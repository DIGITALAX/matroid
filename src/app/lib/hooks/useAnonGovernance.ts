import { useEffect, useState } from "react";
import {
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import {
  encodeAbiParameters,
  keccak256,
  parseAbiItem,
  parseUnits,
  sliceHex,
  stringToHex,
  type Abi,
  type Hex,
} from "viem";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";
import {
  chipActionProof,
  nullifierOf,
  peekSeedField,
  scopeOf,
  seedField,
} from "@/app/lib/zk/chipAction";
import { buildIdentityTree } from "@/app/lib/zk/chipEnrollments";
import { buildPoolProof } from "@/app/lib/zk/poolTree";
import { toHex32 } from "@/app/lib/zk/poseidon";
import { prove } from "@/app/lib/zk/prover";
import { paymasterFields } from "@/app/lib/zk/paymaster";
import { anonReady, anonWriteContract } from "@/app/lib/zk/anonSigner";
import { useTx } from "@/app/lib/hooks/useTx";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

const VOTE_TAG = sliceHex(
  keccak256(stringToHex("matroidAnonGovernance.vote")),
  0,
  4,
);
const PROPOSE_TAG = sliceHex(
  keccak256(stringToHex("matroidAnonGovernance.propose")),
  0,
  4,
);
const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as const;

export const useAnonGovernance = () => {
  const addresses = useCoreAddresses();
  const anonGov = addresses.MatroidAnonGovernance;
  const ready = isAddr(anonGov);
  const abi = getABI("MatroidAnonGovernance") as Abi;
  const base = {
    address: anonGov as `0x${string}`,
    abi,
    chainId: DEFAULT_NETWORK.chainId,
  };
  const { writeContractAsync, isPending, error } = useWriteContract();
  const { track, trackAnon, setTx } = useTx();

  const { data: countRaw, refetch } = useReadContract({
    ...base,
    functionName: "proposalCount",
    query: { enabled: ready },
  });
  const count = typeof countRaw === "bigint" ? Number(countRaw) : 0;

  const { data: quorumRaw } = useReadContract({
    ...base,
    functionName: "quorum",
    query: { enabled: ready },
  });
  const quorum = typeof quorumRaw === "bigint" ? quorumRaw : 0n;

  const { data: list } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => ({
      address: anonGov as `0x${string}`,
      abi,
      chainId: DEFAULT_NETWORK.chainId,
      functionName: "proposals",
      args: [BigInt(i)],
    })),
    query: { enabled: ready && count > 0 },
  });
  const proposals = (list ?? []).map((r, i) => ({ id: i, data: r.result }));

  const { data: tallyList, refetch: refetchTallies } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => [
      {
        address: anonGov as `0x${string}`,
        abi,
        chainId: DEFAULT_NETWORK.chainId,
        functionName: "tally",
        args: [BigInt(i), 1],
      },
      {
        address: anonGov as `0x${string}`,
        abi,
        chainId: DEFAULT_NETWORK.chainId,
        functionName: "tally",
        args: [BigInt(i), 0],
      },
    ]).flat(),
    query: { enabled: ready && count > 0 },
  });
  const tallies: Record<number, { yes: bigint; no: bigint }> = {};
  for (let i = 0; i < count; i++) {
    const yes = tallyList?.[i * 2]?.result;
    const no = tallyList?.[i * 2 + 1]?.result;
    tallies[i] = {
      yes: typeof yes === "bigint" ? yes : 0n,
      no: typeof no === "bigint" ? no : 0n,
    };
  }

  const publicClient = usePublicClient({ chainId: DEFAULT_NETWORK.chainId });
  const [myVotes, setMyVotes] = useState<Record<number, 0 | 1>>({});
  const [busy, setBusy] = useState<boolean>(false);

  const loadMyVotes = async () => {
    const seed = peekSeedField();
    if (!seed || !ready || !publicClient) return;
    try {
      const logs = await publicClient.getLogs({
        address: anonGov as `0x${string}`,
        event: parseAbiItem(
          "event Voted(uint256 indexed id, uint8 choice, bytes32 nullifier)",
        ),
        fromBlock: 0n,
      });
      const mine: Record<number, 0 | 1> = {};
      for (const l of logs) {
        const pid = Number(l.args.id ?? 0n);
        const expected = nullifierOf(
          seed,
          scopeOf(anonGov as `0x${string}`, VOTE_TAG, BigInt(pid)),
        );
        if (l.args.nullifier === expected) {
          mine[pid] = Number(l.args.choice ?? 0) as 0 | 1;
        }
      }
      setMyVotes(mine);
    } catch (e) {
      console.log("loadMyVotes failed", e);
    }
  };

  useEffect(() => {
    loadMyVotes();
  }, [count, ready]);

  const guard = (): boolean => {
    if (!ready) {
      console.log("MatroidAnonGovernance address not set");
      return false;
    }
    return true;
  };

  const chipPropose = async (
    kind: number,
    project: `0x${string}`,
    flag: boolean,
    v1: bigint,
    v2: bigint,
    v3: bigint,
  ) => {
    const registry = addresses.IdentityRegistry;
    if (!isAddr(registry) || !publicClient) {
      setTx?.({ open: true, status: "error", label: "txPropose", message: "registryMissing" });
      return null;
    }
    setTx?.({ open: true, status: "proving", label: "txPropose" });
    const { tree, leaves } = await buildIdentityTree(
      publicClient,
      registry as Hex,
    );
    const payloadHash = keccak256(
      encodeAbiParameters(
        [
          { type: "uint8" },
          { type: "address" },
          { type: "bool" },
          { type: "uint256" },
          { type: "uint256" },
          { type: "uint256" },
        ],
        [kind, project, flag, v1, v2, v3],
      ),
    );
    return chipActionProof({
      contract: anonGov as Hex,
      chainId: DEFAULT_NETWORK.chainId,
      actionTag: PROPOSE_TAG,
      scopeSeed: BigInt(payloadHash),
      payloadHash,
      label: "propose",
      tree,
      leaves,
    });
  };

  const proposeVia = async (
    functionName: string,
    kind: number,
    project: `0x${string}`,
    flag: boolean,
    v1: bigint,
    v2: bigint,
    v3: bigint,
    tailArgs: unknown[],
  ) => {
    if (!guard()) return;
    let res;
    try {
      res = await chipPropose(kind, project, flag, v1, v2, v3);
    } catch (e) {
      console.log("propose failed", e);
      setTx?.({
        open: true,
        status: "error",
        label: "txPropose",
        message: e instanceof Error ? e.message : "actFailed",
      });
      return;
    }
    if (!res) return;
    const args = [res.proof, res.merkleRoot, res.nullifier, ...tailArgs];
    const done = anonReady()
      ? await trackAnon("txPropose", () =>
          anonWriteContract({
            address: base.address,
            abi,
            functionName,
            args,
          }),
        )
      : await track("txPropose", () =>
          writeContractAsync({
            ...base,
            functionName,
            args,
            ...paymasterFields(),
          } as never),
        );
    if (done) {
      refetch();
      refetchTallies();
    }
    return done;
  };

  const propose = (
    baseBudget: string,
    perProjectBudget: string,
    durationSecs: string,
  ) => {
    const b = baseBudget ? parseUnits(baseBudget, 18) : 0n;
    const p = perProjectBudget ? parseUnits(perProjectBudget, 18) : 0n;
    const d = durationSecs ? BigInt(durationSecs) : 0n;
    return proposeVia("propose", 0, ZERO_ADDR, false, b, p, d, [b, p, d]);
  };

  const proposeBucket = (newBucket: number) =>
    proposeVia("proposeBucket", 1, ZERO_ADDR, false, BigInt(newBucket), 0n, 0n, [newBucket]);
  const proposeCap = (project: `0x${string}`, cap: bigint) =>
    proposeVia("proposeCap", 2, project, false, cap, 0n, 0n, [project, cap]);
  const proposeDefaultCap = (cap: bigint) =>
    proposeVia("proposeDefaultCap", 3, ZERO_ADDR, false, cap, 0n, 0n, [cap]);
  const proposeRegister = (project: `0x${string}`, active: boolean) =>
    proposeVia("proposeRegister", 4, project, active, 0n, 0n, 0n, [project, active]);
  const proposeBlacklist = (project: `0x${string}`, banned: boolean) =>
    proposeVia("proposeBlacklist", 5, project, banned, 0n, 0n, 0n, [project, banned]);

  const failVote = (message: string) => {
    setTx?.({ open: true, status: "error", label: "txVoteAnon", message });
  };

  const vote = async (proposalId: bigint, choice: 0 | 1) => {
    if (!guard()) return;
    setBusy(true);
    try {
      await voteInner(proposalId, choice);
    } finally {
      setBusy(false);
    }
  };

  const voteInner = async (proposalId: bigint, choice: 0 | 1) => {
    setTx?.({ open: true, status: "proving", label: "txVoteAnon" });
    let seed: bigint;
    try {
      seed = await seedField();
    } catch {
      failVote("txNoChip");
      return;
    }

    const pdata = proposals.find((p) => p.id === Number(proposalId))?.data as
      | readonly unknown[]
      | undefined;
    if (!pdata) {
      failVote("txNoProposal");
      return;
    }
    const identityRoot = BigInt(pdata[0] as string);
    const poolRoot = BigInt(pdata[1] as string);
    const bucket = Number(pdata[2] as number | bigint);

    const registry = addresses.IdentityRegistry;
    if (!isAddr(registry) || !publicClient) {
      failVote("txNoChip");
      return;
    }

    let poolr;
    try {
      poolr = await buildPoolProof(seed, bucket, poolRoot);
      for (let attempt = 0; attempt < 5 && !poolr.ok; attempt++) {
        poolr = await buildPoolProof(seed, bucket);
        if (!poolr.ok) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }
    } catch {
      failVote("txSubgraphDown");
      return;
    }
    if (!poolr.ok) {
      failVote(poolr.reason === "noSnapshot" ? "txNoSnapshot" : "txNoDeposit");
      return;
    }
    const poolp = poolr.data;

    let action;
    try {
      const { tree, leaves } = await buildIdentityTree(
        publicClient,
        registry as Hex,
        identityRoot,
      );
      const payloadHash = keccak256(
        encodeAbiParameters([{ type: "uint8" }], [choice]),
      );
      action = await chipActionProof({
        contract: anonGov as Hex,
        chainId: DEFAULT_NETWORK.chainId,
        actionTag: VOTE_TAG,
        scopeSeed: proposalId,
        payloadHash,
        label: `vote:${proposalId}`,
        tree,
        leaves,
      });
    } catch (e) {
      console.log("vote: identity proof failed", e);
      failVote("txNotEnrolled");
      return;
    }

    let poolZkProof: `0x${string}`;
    try {
      const proved = await prove("voting", {
        identity_secret: seed.toString(),
        deposit_r: poolr.r!.toString(),
        siblings: poolp.proof.siblings.map((s) => s.toString()),
        indices: poolp.proof.indices,
        pool_root: poolp.root.toString(),
        scope: action.scope.toString(),
      });
      poolZkProof = proved.proof as `0x${string}`;
    } catch {
      failVote("txProofFailed");
      return;
    }

    const voteArgs = [
      action.proof,
      poolZkProof,
      toHex32(poolp.root),
      proposalId,
      choice,
      action.nullifier,
    ];
    const done = anonReady()
      ? await trackAnon("txVoteAnon", () =>
          anonWriteContract({
            address: base.address,
            abi,
            functionName: "vote",
            args: voteArgs,
          }),
        )
      : await track("txVoteAnon", () =>
          writeContractAsync({
            ...base,
            functionName: "vote",
            args: voteArgs,
            ...paymasterFields(),
          } as never),
        );
    if (done) {
      refetch();
      refetchTallies();
      loadMyVotes();
    }
  };

  const execute = async (proposalId: bigint) => {
    if (!guard()) return;
    const done = anonReady()
      ? await trackAnon("txExecute", () =>
          anonWriteContract({
            address: base.address,
            abi,
            functionName: "execute",
            args: [proposalId],
          }),
        )
      : await track("txExecute", () =>
          writeContractAsync({
            ...base,
            functionName: "execute",
            args: [proposalId],
            ...paymasterFields(),
          } as never),
        );
    if (done) {
      refetch();
      refetchTallies();
    }
  };

  return {
    ready,
    count,
    proposals,
    tallies,
    myVotes,
    quorum,
    busy,
    isPending,
    error,
    refetch,
    loadMyVotes,
    propose,
    proposeBucket,
    proposeCap,
    proposeDefaultCap,
    proposeRegister,
    proposeBlacklist,
    vote,
    execute,
  };
};
