import { useAccount, useReadContract, useSwitchChain, useWriteContract } from "wagmi";
import { readContract } from "wagmi/actions";
import { useModal } from "connectkit";
import type { Abi } from "viem";
import { getABI } from "@/app/abis";
import { config } from "@/app/providers";
import { useCoreAddresses } from "./useCoreAddresses";
import { ensureIdentity } from "@/app/lib/zk/identity";
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
    let identity;
    try {
      identity = ensureIdentity();
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
    const commitment = depositCommitment(identity.secretScalar, bucket, slot.index);
    await track("txDepositPool", () =>
      writeContractAsync({
        ...base,
        functionName: "deposit",
        args: [bucket, toHex32(commitment), slot.siblings.map((s) => toHex32(s))],
      }),
    );
  };

  const withdraw = async () => {
    if (!ready) {
      console.log("BalancePool address not configured");
      return;
    }
    if (!(await ensureWallet())) return;
    let identity;
    try {
      identity = ensureIdentity();
    } catch {
      setTx?.({ open: true, status: "error", label: "txWithdrawPool", message: "txNoChip" });
      return;
    }
    let slot;
    try {
      slot = await withdrawSlot(identity.secretScalar, bucket);
    } catch {
      setTx?.({ open: true, status: "error", label: "txWithdrawPool", message: "txSubgraphDown" });
      return;
    }
    if (!slot.ok) {
      setTx?.({ open: true, status: "error", label: "txWithdrawPool", message: "txNoDeposit" });
      return;
    }
    await track("txWithdrawPool", () =>
      writeContractAsync({
        ...base,
        functionName: "withdraw",
        args: [bucket, slot.index, slot.siblings.map((s) => toHex32(s))],
      }),
    );
  };

  const hasDeposit = async (): Promise<boolean> => {
    if (!ready) return false;
    try {
      const identity = ensureIdentity();
      const slot = await withdrawSlot(identity.secretScalar, bucket);
      return slot.ok;
    } catch {
      return false;
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
  };
};
