import { useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { parseUnits, type Abi } from "viem";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";
import { useTx } from "@/app/lib/hooks/useTx";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

export const useGovernance = () => {
  const addresses = useCoreAddresses();
  const governance = addresses.MatroidGovernance;
  const ready = isAddr(governance);
  const govAbi = getABI("MatroidGovernance") as Abi;
  const monaAbi = getABI("Mona") as Abi;
  const { writeContractAsync, isPending, error } = useWriteContract();
  const { track } = useTx();

  const base = {
    address: governance as `0x${string}`,
    abi: govAbi,
    chainId: DEFAULT_NETWORK.chainId,
  };

  const { data: countRaw, refetch } = useReadContract({
    ...base,
    functionName: "proposalCount",
    query: { enabled: ready },
  });
  const count = typeof countRaw === "bigint" ? Number(countRaw) : 0;

  const { data: minStakeRaw } = useReadContract({
    ...base,
    functionName: "minProposeStake",
    query: { enabled: ready },
  });
  const minProposeStake = typeof minStakeRaw === "bigint" ? minStakeRaw : 0n;

  const { data: list } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => ({
      address: governance as `0x${string}`,
      abi: govAbi,
      chainId: DEFAULT_NETWORK.chainId,
      functionName: "proposals",
      args: [BigInt(i)],
    })),
    query: { enabled: ready && count > 0 },
  });
  const proposals = (list ?? []).map((r, i) => ({ id: i, data: r.result }));

  const guard = (): boolean => {
    if (!ready) {
      console.log("MatroidGovernance address not set");
      return false;
    }
    return true;
  };

  const approveMona = async (amount: bigint): Promise<boolean> => {
    if (!isAddr(addresses.Mona) || amount === 0n) return true;
    return track("txApprove", () =>
      writeContractAsync({
        address: addresses.Mona as `0x${string}`,
        abi: monaAbi,
        chainId: DEFAULT_NETWORK.chainId,
        functionName: "approve",
        args: [governance, amount],
      }),
    );
  };

  const propose = async (
    baseBudget: string,
    perProjectBudget: string,
    durationSecs: string
  ) => {
    if (!guard()) return;
    if (minProposeStake > 0n) {
      const ok = await approveMona(minProposeStake);
      if (!ok) return;
    }
    const done = await track("txPropose", () =>
      writeContractAsync({
        ...base,
        functionName: "propose",
        args: [
          baseBudget ? parseUnits(baseBudget, 18) : 0n,
          perProjectBudget ? parseUnits(perProjectBudget, 18) : 0n,
          durationSecs ? BigInt(durationSecs) : 0n,
        ],
      }),
    );
    if (done) refetch();
    return done;
  };

  const vote = async (id: bigint, inFavor: boolean, amount: string) => {
    if (!guard()) return;
    const amt = amount ? parseUnits(amount, 18) : 0n;
    const ok = await approveMona(amt);
    if (!ok) return false;
    const done = await track("txVote", () =>
      writeContractAsync({
        ...base,
        functionName: "vote",
        args: [id, inFavor, amt],
      }),
    );
    if (done) refetch();
    return done;
  };

  const cancelVote = async (id: bigint) => {
    if (!guard()) return;
    await track("txCancelVote", () =>
      writeContractAsync({ ...base, functionName: "cancelVote", args: [id] }),
    );
  };

  const execute = async (id: bigint) => {
    if (!guard()) return;
    await track("txExecute", () =>
      writeContractAsync({ ...base, functionName: "execute", args: [id] }),
    );
  };

  const withdraw = async (id: bigint) => {
    if (!guard()) return;
    await track("txWithdraw", () =>
      writeContractAsync({ ...base, functionName: "withdraw", args: [id] }),
    );
  };

  return {
    ready,
    count,
    proposals,
    minProposeStake,
    isPending,
    error,
    refetch,
    propose,
    vote,
    cancelVote,
    execute,
    withdraw,
  };
};
