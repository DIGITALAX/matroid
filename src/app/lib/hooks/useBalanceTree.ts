import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { readContract } from "wagmi/actions";
import type { Abi } from "viem";
import { getABI } from "@/app/abis";
import { config } from "@/app/providers";
import { useCoreAddresses } from "./useCoreAddresses";
import { ensureIdentity } from "@/app/lib/zk/identity";
import { buildGroup, generateScopedProof, toContractProof, BALANCE_LINK_SCOPE } from "@/app/lib/zk/identityTree";
import { useTx } from "@/app/lib/hooks/useTx";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

export const useBalanceTree = () => {
  const addresses = useCoreAddresses();
  const address = addresses.MonaBalanceTree;
  const ready = isAddr(address);
  const abi = getABI("MonaBalanceTree") as Abi;
  const base = {
    address: address as `0x${string}`,
    abi,
    chainId: DEFAULT_NETWORK.chainId,
  };
  const { writeContractAsync, isPending, error } = useWriteContract();
  const { track, setTx } = useTx();
  const { address: account } = useAccount();

  const { data: currentRoot } = useReadContract({
    ...base,
    functionName: "currentRoot",
    query: { enabled: ready },
  });

  const { data: monaBalance } = useReadContract({
    address: addresses.Mona as `0x${string}`,
    abi: getABI("Mona") as Abi,
    chainId: DEFAULT_NETWORK.chainId,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: { enabled: isAddr(addresses.Mona) && Boolean(account) },
  });

  const register = async () => {
    if (!ready) {
      console.log("MonaBalanceTree address not configured");
      return;
    }
    if (!account) {
      setTx?.({
        open: true,
        status: "error",
        label: "txRegisterBalance",
        message: "txNeedWallet",
      });
      return;
    }
    setTx?.({ open: true, status: "proving", label: "txRegisterBalance" });
    let liveBalance = monaBalance as bigint | undefined;
    if (isAddr(addresses.Mona)) {
      try {
        liveBalance = (await readContract(config, {
          address: addresses.Mona as `0x${string}`,
          abi: getABI("Mona") as Abi,
          chainId: DEFAULT_NETWORK.chainId,
          functionName: "balanceOf",
          args: [account],
        })) as bigint;
      } catch {}
    }
    if (typeof liveBalance === "bigint" && liveBalance === 0n) {
      setTx?.({
        open: true,
        status: "error",
        label: "txRegisterBalance",
        message: "txNeedMona",
      });
      return;
    }
    let identity;
    try {
      identity = ensureIdentity();
    } catch {
      setTx?.({
        open: true,
        status: "error",
        label: "txRegisterBalance",
        message: "txNoChip",
      });
      return;
    }
    let group;
    try {
      group = await buildGroup();
    } catch (e: any) {
      setTx?.({
        open: true,
        status: "error",
        label: "txRegisterBalance",
        message: e?.message === "SUBGRAPH_UNREACHABLE" ? "txSubgraphDown" : "txSubgraphDown",
      });
      return;
    }
    if (!group) {
      setTx?.({
        open: true,
        status: "error",
        label: "txRegisterBalance",
        message: "txNoEnrollments",
      });
      return;
    }
    if (!group.members.includes(identity.commitment)) {
      setTx?.({
        open: true,
        status: "error",
        label: "txRegisterBalance",
        message: "txNotEnrolledYet",
      });
      return;
    }
    let linkProof;
    try {
      linkProof = await Promise.race([
        generateScopedProof(identity, group, 0n, BALANCE_LINK_SCOPE),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("PROOF_TIMEOUT")), 300000),
        ),
      ]);
    } catch {
      setTx?.({
        open: true,
        status: "error",
        label: "txRegisterBalance",
        message: "txProofTimeout",
      });
      return;
    }
    if (!linkProof) {
      setTx?.({
        open: true,
        status: "error",
        label: "txRegisterBalance",
        message: "txNotEnrolled",
      });
      return;
    }
    await track("txRegisterBalance", () =>
      writeContractAsync({
        ...base,
        functionName: "register",
        args: [toContractProof(linkProof)],
      }),
    );
  };

  return { ready, currentRoot, isPending, error, register };
};
