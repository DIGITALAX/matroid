import { useMemo } from "react";
import { useWriteContract } from "wagmi";
import type { Abi } from "viem";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";
import { useTx } from "@/app/lib/hooks/useTx";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

export const useMatroidActions = () => {
  const addresses = useCoreAddresses();
  const { writeContractAsync, isPending, error, data } = useWriteContract();
  const { track } = useTx();

  const treasury = useMemo(
    () => ({
      address: addresses.Treasury as `0x${string}`,
      abi: getABI("Treasury"),
      chainId: DEFAULT_NETWORK.chainId,
    }),
    [addresses.Treasury],
  );

  const slashing = useMemo(
    () => ({
      address: addresses.SlashingCouncil as `0x${string}`,
      abi: getABI("SlashingCouncil"),
      chainId: DEFAULT_NETWORK.chainId,
    }),
    [addresses.SlashingCouncil],
  );

  const txLabel = (functionName: string) =>
    `tx${functionName.charAt(0).toUpperCase()}${functionName.slice(1)}`;

  const callTreasury = async (functionName: string, args: readonly unknown[] = []) => {
    return track(txLabel(functionName), () =>
      writeContractAsync({
        address: treasury.address,
        abi: treasury.abi as Abi,
        chainId: DEFAULT_NETWORK.chainId,
        functionName,
        args,
      }),
    );
  };

  const callSlashing = async (functionName: string, args: readonly unknown[] = []) => {
    return track(txLabel(functionName), () =>
      writeContractAsync({
        address: slashing.address,
        abi: slashing.abi as Abi,
        chainId: DEFAULT_NETWORK.chainId,
        functionName,
        args,
      }),
    );
  };

  const approveSlashStake = async (amount: bigint): Promise<boolean> => {
    if (amount === 0n) return true;
    return track("txApprove", () =>
      writeContractAsync({
        address: addresses.Mona as `0x${string}`,
        abi: getABI("Mona") as Abi,
        chainId: DEFAULT_NETWORK.chainId,
        functionName: "approve",
        args: [slashing.address, amount],
      }),
    );
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
      vote: async (
        epoch: bigint,
        project: `0x${string}`,
        amount: bigint,
        slashBps: number,
        blacklist: boolean,
      ) => {
        const ok = await approveSlashStake(amount);
        if (!ok) return false;
        return callSlashing("vote", [
          epoch,
          project,
          amount,
          slashBps,
          blacklist,
        ]);
      },
      unvote: (epoch: bigint, project: `0x${string}`) =>
        callSlashing("unvote", [epoch, project]),
      withdrawStake: (epoch: bigint, project: `0x${string}`) =>
        callSlashing("withdrawStake", [epoch, project]),
      claimVoterReward: (epoch: bigint, project: `0x${string}`) =>
        callSlashing("claimVoterReward", [epoch, project]),
    },
  };
};
