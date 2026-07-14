import { useAccount, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { useModal } from "connectkit";
import type { Abi } from "viem";
import { getABI } from "@/app/abis";
import { config } from "@/app/providers";
import { useCoreAddresses } from "./useCoreAddresses";
import { seedField } from "@/app/lib/zk/chipAction";
import { toHex32 } from "@/app/lib/zk/poseidon";
import { depositCommitment, nextDepositSlot, withdrawSlot } from "@/app/lib/zk/poolTree";
import { useTx } from "@/app/lib/hooks/useTx";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

export const usePool = () => {
  const addresses = useCoreAddresses();
  const address = addresses.BalancePool;
  const ready = isAddr(address);
  const abi = getABI("BalancePool") as Abi;
  const base = {
    address: address as `0x${string}`,
    abi,
    chainId: DEFAULT_NETWORK.chainId,
  };
  const { writeContractAsync, isPending, error } = useWriteContract();
  const { track, setTx } = useTx();
  const { address: account, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { setOpen } = useModal();

  const ensureWallet = async (): Promise<boolean> => {
    if (!isConnected || !account) {
      setOpen(true);
      return false;
    }
    if (chainId !== DEFAULT_NETWORK.chainId && switchChainAsync) {
      try {
        await switchChainAsync({ chainId: DEFAULT_NETWORK.chainId });
      } catch {
        return false;
      }
    }
    return true;
  };

  const { data: activeBucketRaw } = useReadContract({
    ...base,
    functionName: "activeBucket",
    query: { enabled: ready },
  });
  const bucket = typeof activeBucketRaw === "number" ? activeBucketRaw : 0;

  const { data: denominationRaw } = useReadContract({
    ...base,
    functionName: "denomination",
    args: [bucket],
    query: { enabled: ready && typeof activeBucketRaw === "number" },
  });
  const denomination = typeof denominationRaw === "bigint" ? denominationRaw : 0n;

  const { data: bucketCountRaw } = useReadContract({
    ...base,
    functionName: "bucketCount",
    query: { enabled: ready },
  });
  const bucketCount =
    typeof bucketCountRaw === "number"
      ? bucketCountRaw
      : typeof bucketCountRaw === "bigint"
      ? Number(bucketCountRaw)
      : 1;

  const findDeposit = async (): Promise<{
    bucket: number;
    index: number;
    siblings: bigint[];
  } | null> => {
    const seed = await seedField();
    const all = Array.from({ length: Math.max(bucketCount, 1) }, (_, i) => i);
    const ordered = [bucket, ...all.filter((b) => b !== bucket)];
    for (const b of ordered) {
      const slot = await withdrawSlot(seed, b);
      if (slot.ok) return { bucket: b, index: slot.index, siblings: slot.siblings };
    }
    return null;
  };

  const { data: monaBalance } = useReadContract({
    address: addresses.Mona as `0x${string}`,
    abi: getABI("Mona") as Abi,
    chainId: DEFAULT_NETWORK.chainId,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: { enabled: isAddr(addresses.Mona) && Boolean(account) },
  });

  const deposit = async () => {
    if (!ready) {
      console.log("BalancePool address not configured");
      return;
    }
    if (!(await ensureWallet())) return;
    let seed: bigint;
    try {
      seed = await seedField();
    } catch {
      setTx?.({ open: true, status: "error", label: "txDepositPool", message: "txNoChip" });
      return;
    }
    if (denomination === 0n) {
      setTx?.({ open: true, status: "error", label: "txDepositPool", message: "txSubgraphDown" });
      return;
    }

    let allowance = 0n;
    try {
      allowance = (await readContract(config, {
        address: addresses.Mona as `0x${string}`,
        abi: getABI("Mona") as Abi,
        chainId: DEFAULT_NETWORK.chainId,
        functionName: "allowance",
        args: [account, address],
      })) as bigint;
    } catch {}
    if (allowance < denomination) {
      const approved = await track("txApproveMona", () =>
        writeContractAsync({
          address: addresses.Mona as `0x${string}`,
          abi: getABI("Mona") as Abi,
          chainId: DEFAULT_NETWORK.chainId,
          functionName: "approve",
          args: [address, denomination],
        }),
      );
      if (!approved) return;
    }

    let slot;
    try {
      slot = await nextDepositSlot(bucket);
    } catch {
      setTx?.({ open: true, status: "error", label: "txDepositPool", message: "txSubgraphDown" });
      return;
    }
    const commitment = depositCommitment(seed, bucket, slot.index);
    await track("txDepositPool", () =>
      writeContractAsync({
        ...base,
        functionName: "deposit",
        args: [bucket, toHex32(commitment), slot.siblings.map((s) => toHex32(s))],
      }),
    );
  };

  const withdraw = async (bucketArg?: number) => {
    if (!ready) {
      console.log("BalancePool address not configured");
      return;
    }
    if (!(await ensureWallet())) return;
    let target: { bucket: number; index: number; siblings: bigint[] } | null =
      null;
    try {
      if (bucketArg !== undefined) {
        const seed = await seedField();
        const slot = await withdrawSlot(seed, bucketArg);
        if (slot.ok) {
          target = { bucket: bucketArg, index: slot.index, siblings: slot.siblings };
        }
      } else {
        target = await findDeposit();
      }
    } catch {
      setTx?.({ open: true, status: "error", label: "txWithdrawPool", message: "txNoChip" });
      return;
    }
    if (!target) {
      setTx?.({ open: true, status: "error", label: "txWithdrawPool", message: "txNoDeposit" });
      return;
    }
    await track("txWithdrawPool", () =>
      writeContractAsync({
        ...base,
        functionName: "withdraw",
        args: [target.bucket, target.index, target.siblings.map((s) => toHex32(s))],
      }),
    );
  };

  const hasDeposit = async (): Promise<boolean> => {
    if (!ready) return false;
    try {
      return (await findDeposit()) !== null;
    } catch {
      return false;
    }
  };

  const deposits = async (): Promise<
    { bucket: number; denomination: bigint }[]
  > => {
    if (!ready) return [];
    try {
      const seed = await seedField();
      const found: { bucket: number; denomination: bigint }[] = [];
      for (let b = 0; b < Math.max(bucketCount, 1); b++) {
        const slot = await withdrawSlot(seed, b);
        if (!slot.ok) continue;
        const denom = (await readContract(config, {
          ...base,
          functionName: "denomination",
          args: [b],
        })) as bigint;
        found.push({ bucket: b, denomination: denom });
      }
      return found;
    } catch {
      return [];
    }
  };

  return {
    ready,
    activeBucket: bucket,
    denomination,
    monaBalance,
    isPending,
    error,
    deposit,
    withdraw,
    hasDeposit,
    deposits,
  };
};
