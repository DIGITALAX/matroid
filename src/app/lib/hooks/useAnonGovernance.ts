import { useEffect, useState } from "react";
import {
  usePublicClient,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { parseAbiItem, parseUnits, type Abi } from "viem";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";
import { ensureIdentity, getIdentity } from "@/app/lib/zk/identity";
import {
  buildGroupAt,
  generateScopedProof,
  semaphoreNullifier,
  toContractProof,
  BALANCE_LINK_SCOPE,
} from "@/app/lib/zk/identityTree";
import { buildBalanceProof } from "@/app/lib/zk/balanceTree";
import { prove } from "@/app/lib/zk/prover";
import { paymasterFields } from "@/app/lib/zk/paymaster";
import { anonReady, anonWriteContract } from "@/app/lib/zk/anonSigner";
import { useTx } from "@/app/lib/hooks/useTx";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

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

  const { data: minBalanceRaw } = useReadContract({
    ...base,
    functionName: "minBalance",
    query: { enabled: ready },
  });
  const minBalance = typeof minBalanceRaw === "bigint" ? minBalanceRaw : 0n;

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
    const id = getIdentity();
    if (!id || !ready || !publicClient) return;
    try {
      const logs = await publicClient.getLogs({
        address: anonGov as `0x${string}`,
        event: parseAbiItem(
          "event Voted(uint256 indexed id, uint8 choice, uint256 nullifier)",
        ),
        fromBlock: 0n,
      });
      const mine: Record<number, 0 | 1> = {};
      for (const l of logs) {
        const pid = Number(l.args.id ?? 0n);
        const expected = semaphoreNullifier(BigInt(pid), id.secretScalar);
        if (BigInt(l.args.nullifier ?? 0n) === expected) {
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

  const propose = async (
    baseBudget: string,
    perProjectBudget: string,
    durationSecs: string,
  ) => {
    if (!guard()) return;
    const proposeArgs = [
      baseBudget ? parseUnits(baseBudget, 18) : 0n,
      perProjectBudget ? parseUnits(perProjectBudget, 18) : 0n,
      durationSecs ? BigInt(durationSecs) : 0n,
    ];
    const done = anonReady()
      ? await trackAnon("txPropose", () =>
          anonWriteContract({
            address: base.address,
            abi,
            functionName: "propose",
            args: proposeArgs,
          }),
        )
      : await track("txPropose", () =>
          writeContractAsync({
            ...base,
            functionName: "propose",
            args: proposeArgs,
            ...paymasterFields(),
          } as never),
        );
    if (done) {
      refetch();
      refetchTallies();
    }
    return done;
  };

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
    let identity;
    try {
      identity = ensureIdentity();
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
    const identityRoot = BigInt(pdata[0] as bigint);
    const balanceRoot = BigInt(pdata[1] as string);

    let group;
    try {
      group = await buildGroupAt(identityRoot);
    } catch {
      failVote("txSubgraphDown");
      return;
    }
    if (!group) {
      failVote("txNoEnrollments");
      return;
    }

    const voteProof = await generateScopedProof(identity, group, BigInt(choice), proposalId);
    if (!voteProof) {
      failVote("txNotEnrolled");
      return;
    }
    const balanceLinkProof = await generateScopedProof(identity, group, 0n, BALANCE_LINK_SCOPE);
    if (!balanceLinkProof) {
      failVote("txNotEnrolled");
      return;
    }

    const balanceKey = BigInt(balanceLinkProof.nullifier);
    let balr;
    try {
      balr = await buildBalanceProof(balanceKey, balanceRoot);
    } catch {
      failVote("txSubgraphDown");
      return;
    }
    if (!balr.ok) {
      failVote(
        balr.reason === "unregistered"
          ? "txNoBalanceLeaf"
          : balr.reason === "registeredLate"
            ? "txRegisteredLate"
            : "txNoSnapshot",
      );
      return;
    }
    const balp = balr.data;

    let balanceZkProof: `0x${string}`;
    try {
      const proved = await prove("voting", {
        balance: balp.balance.toString(),
        bal_siblings: balp.proof.siblings.map((s) => s.toString()),
        bal_indices: balp.proof.indices,
        balance_root: balp.root.toString(),
        min_balance: minBalance.toString(),
        balance_key: balanceKey.toString(),
      });
      balanceZkProof = proved.proof as `0x${string}`;
    } catch {
      failVote("txProofFailed");
      return;
    }

    const voteArgs = [
      toContractProof(voteProof),
      toContractProof(balanceLinkProof),
      balanceZkProof,
      proposalId,
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
    vote,
    execute,
  };
};
