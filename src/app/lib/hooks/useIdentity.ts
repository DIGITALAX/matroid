import { useReadContract, useWriteContract } from "wagmi";
import type { Abi } from "viem";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "./useCoreAddresses";
import { paymasterFields } from "@/app/lib/zk/paymaster";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

export const useIdentity = (commitment?: string) => {
  const addresses = useCoreAddresses();
  const address = addresses.IdentityRegistry;
  const ready = isAddr(address);
  const abi = getABI("IdentityRegistry") as Abi;
  const base = { address: address as `0x${string}`, abi };
  const { writeContractAsync, isPending, error } = useWriteContract();

  const valid = Boolean(commitment && /^0x[0-9a-fA-F]{64}$/.test(commitment));

  const { data: enrolled, refetch } = useReadContract({
    ...base,
    functionName: "commitments",
    args: valid ? [commitment as `0x${string}`] : undefined,
    query: { enabled: Boolean(ready && valid) },
  });

  const { data: currentRoot } = useReadContract({
    ...base,
    functionName: "currentRoot",
    query: { enabled: ready },
  });

  const enroll = async (
    proof: string,
    commitmentArg: string,
    enrollNullifier: string,
  ) => {
    if (!ready) {
      console.log("IdentityRegistry address not configured");
      return;
    }
    return writeContractAsync({
      ...base,
      functionName: "enroll",
      args: [
        proof as `0x${string}`,
        commitmentArg as `0x${string}`,
        enrollNullifier as `0x${string}`,
      ],
      ...paymasterFields(),
    } as never);
  };

  return {
    ready,
    valid,
    enrolled: Boolean(enrolled),
    enrolledKnown: typeof enrolled === "boolean",
    currentRoot,
    isPending,
    error,
    refetch,
    enroll,
  };
};
