import { useReadContract, useWriteContract } from "wagmi";
import type { Abi } from "viem";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "./useCoreAddresses";
import { paymasterFields } from "@/app/lib/zk/paymaster";
import { anonReady, anonWriteContract } from "@/app/lib/zk/anonSigner";
import { useTx } from "@/app/lib/hooks/useTx";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

export const useIdentity = (commitment?: string) => {
  const addresses = useCoreAddresses();
  const address = addresses.IdentityRegistry;
  const ready = isAddr(address);
  const abi = getABI("IdentityRegistry") as Abi;
  const base = {
    address: address as `0x${string}`,
    abi,
    chainId: DEFAULT_NETWORK.chainId,
  };
  const { writeContractAsync, isPending, error } = useWriteContract();
  const { track, trackAnon } = useTx();

  const valid = Boolean(commitment && /^0x[0-9a-fA-F]{64}$/.test(commitment));

  const { data: enrolled, refetch } = useReadContract({
    ...base,
    functionName: "enrolledCommitment",
    args: valid ? [BigInt(commitment as `0x${string}`)] : undefined,
    query: { enabled: Boolean(ready && valid) },
  });

  const { data: currentRoot } = useReadContract({
    ...base,
    functionName: "currentRoot",
    query: { enabled: ready },
  });

  const enroll = async (
    proof: string,
    freshBind: string,
    enrollNullifier: string,
    commitmentArg: string,
    siblings: string[],
  ) => {
    if (!ready) {
      console.log("IdentityRegistry address not configured");
      return;
    }
    const args = [
      proof as `0x${string}`,
      freshBind as `0x${string}`,
      enrollNullifier as `0x${string}`,
      BigInt(commitmentArg as `0x${string}`),
      siblings as `0x${string}`[],
    ];
    const done = anonReady()
      ? await trackAnon("txEnroll", () =>
          anonWriteContract({
            address: base.address,
            abi,
            functionName: "enroll",
            args,
          }),
        )
      : await track("txEnroll", () =>
          writeContractAsync({
            ...base,
            functionName: "enroll",
            args,
            ...paymasterFields(),
          } as never),
        );
    if (done) refetch();
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
