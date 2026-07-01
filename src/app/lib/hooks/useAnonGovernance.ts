import { useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { parseUnits, type Abi } from "viem";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";
import { ensureIdentity, commitmentOf, actionNullifier } from "@/app/lib/zk/identity";
import { buildIdentityProof } from "@/app/lib/zk/identityTree";
import { buildBalanceProof } from "@/app/lib/zk/balanceTree";
import { toHex32 } from "@/app/lib/zk/poseidon";
import { signMona } from "@/app/lib/zk/signer";
import { prove } from "@/app/lib/zk/prover";
import { paymasterFields } from "@/app/lib/zk/paymaster";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

export const useAnonGovernance = () => {
  const addresses = useCoreAddresses();
  const anonGov = addresses.MatroidAnonGovernance;
  const ready = isAddr(anonGov);
  const abi = getABI("MatroidAnonGovernance") as Abi;
  const base = { address: anonGov as `0x${string}`, abi };
  const { writeContractAsync, isPending, error } = useWriteContract();

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
      functionName: "proposals",
      args: [BigInt(i)],
    })),
    query: { enabled: ready && count > 0 },
  });
  const proposals = (list ?? []).map((r, i) => ({ id: i, data: r.result }));

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
    return writeContractAsync({
      ...base,
      functionName: "propose",
      args: [
        baseBudget ? parseUnits(baseBudget, 18) : 0n,
        perProjectBudget ? parseUnits(perProjectBudget, 18) : 0n,
        durationSecs ? BigInt(durationSecs) : 0n,
      ],
    });
  };

  const vote = async (proposalId: bigint, choice: 0 | 1) => {
    if (!guard()) return;
    const id = ensureIdentity();
    const commitment = commitmentOf(id);

    const idp = await buildIdentityProof(commitment);
    if (!idp) {
      console.log("vote: this identity is not enrolled on-chain yet");
      return;
    }

    const sig = signMona(proposalId);
    const balp = await buildBalanceProof(sig.addr);
    if (!balp) {
      console.log("vote: mona key not registered in the balance tree yet");
      return;
    }

    const nullifier = actionNullifier(id, proposalId);

    const { proof } = await prove("voting", {
      device_secret: id.deviceSecret,
      chip_field: id.chipField,
      siblings: idp.proof.siblings.map((s) => s.toString()),
      indices: idp.proof.indices,
      msg: sig.msg,
      mona_pk_x: sig.x,
      mona_pk_y: sig.y,
      mona_sig: sig.sig,
      balance: balp.balance.toString(),
      bal_siblings: balp.proof.siblings.map((s) => s.toString()),
      bal_indices: balp.proof.indices,
      merkle_root: idp.root.toString(),
      proposal_id: proposalId.toString(),
      choice: choice.toString(),
      balance_root: balp.root.toString(),
      min_balance: minBalance.toString(),
    });

    return writeContractAsync({
      ...base,
      functionName: "vote",
      args: [proof, proposalId, choice, toHex32(nullifier)],
      ...paymasterFields(),
    } as never);
  };

  const execute = async (proposalId: bigint) => {
    if (!guard()) return;
    return writeContractAsync({ ...base, functionName: "execute", args: [proposalId] });
  };

  return {
    ready,
    count,
    proposals,
    quorum,
    isPending,
    error,
    refetch,
    propose,
    vote,
    execute,
  };
};
