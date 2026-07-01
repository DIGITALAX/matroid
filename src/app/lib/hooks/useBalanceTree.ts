import { useReadContract, useWriteContract } from "wagmi";
import type { Abi } from "viem";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "./useCoreAddresses";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

export const useBalanceTree = () => {
  const addresses = useCoreAddresses();
  const address = addresses.MonaBalanceTree;
  const ready = isAddr(address);
  const abi = getABI("MonaBalanceTree") as Abi;
  const base = { address: address as `0x${string}`, abi };
  const { writeContractAsync, isPending, error } = useWriteContract();

  const { data: currentRoot } = useReadContract({
    ...base,
    functionName: "currentRoot",
    query: { enabled: ready },
  });

  const register = async (holder: `0x${string}`) => {
    if (!ready) {
      console.log("MonaBalanceTree address not configured");
      return;
    }
    return writeContractAsync({
      ...base,
      functionName: "register",
      args: [holder],
    });
  };

  return { ready, currentRoot, isPending, error, register };
};
