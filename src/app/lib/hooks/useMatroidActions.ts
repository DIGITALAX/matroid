import { useMemo } from "react";
import { useWriteContract } from "wagmi";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";

export const useMatroidActions = () => {
  const addresses = useCoreAddresses();
  const { writeContractAsync, isPending, error, data } = useWriteContract();

  const treasury = useMemo(
    () => ({
      address: addresses.Treasury as `0x${string}`,
      abi: getABI("Treasury"),
    }),
    [addresses.Treasury],
  );

  const slashing = useMemo(
    () => ({
      address: addresses.SlashingCouncil as `0x${string}`,
      abi: getABI("SlashingCouncil"),
    }),
    [addresses.SlashingCouncil],
  );

  const callTreasury = async (functionName: string, args: readonly unknown[] = []) => {
    return writeContractAsync({
      address: treasury.address,
      abi: treasury.abi as unknown[],
      functionName,
      args,
    });
  };

  const callSlashing = async (functionName: string, args: readonly unknown[] = []) => {
    return writeContractAsync({
      address: slashing.address,
      abi: slashing.abi as unknown[],
      functionName,
      args,
    });
  };

  return {
    isPending,
    error,
    data,
    treasury: {
      reconcileTarget: () => callTreasury("reconcileTarget"),
      finalizeEpoch: (epoch: bigint) => callTreasury("finalizeEpoch", [epoch]),
      computeClaimable: (epoch: bigint, project: `0x${string}`) =>
        callTreasury("computeClaimable", [epoch, project]),
      sweepExpired: (epoch: bigint, project: `0x${string}`) =>
        callTreasury("sweepExpired", [epoch, project]),
      resolveSlash: (epoch: bigint, project: `0x${string}`) =>
        callTreasury("resolveSlash", [epoch, project]),
      claim: (epoch: bigint, project: `0x${string}`) =>
        callTreasury("claim", [epoch, project]),
    },
    slashing: {
      finalizeProposal: (epoch: bigint, project: `0x${string}`) =>
        callSlashing("finalizeProposal", [epoch, project]),
      resolveFailure: (epoch: bigint, project: `0x${string}`) =>
        callSlashing("resolveFailure", [epoch, project]),
      vote: (
        epoch: bigint,
        project: `0x${string}`,
        amount: bigint,
        slashBps: number,
        blacklist: boolean,
      ) => callSlashing("vote", [epoch, project, amount, slashBps, blacklist]),
      unvote: (epoch: bigint, project: `0x${string}`) =>
        callSlashing("unvote", [epoch, project]),
      withdrawStake: (epoch: bigint, project: `0x${string}`) =>
        callSlashing("withdrawStake", [epoch, project]),
      claimVoterReward: (epoch: bigint, project: `0x${string}`) =>
        callSlashing("claimVoterReward", [epoch, project]),
    },
  };
};
