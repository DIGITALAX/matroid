import { useContext, useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { numberToHex, type Abi, type Hex } from "viem";
import { getABI } from "@/app/abis";
import {
  connectChip,
  disconnectChip,
  isChipConnected,
  notifyIdentity,
  subscribeIdentity,
} from "@/app/lib/zk/identity";
import { circuitAvailable } from "@/app/lib/zk/prover";
import { chipEnrollProof } from "@/app/lib/zk/chipEnroll";
import { buildIdentityTree } from "@/app/lib/zk/chipEnrollments";
import { merklePath } from "@/app/lib/zk/chipTree";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";
import { DEFAULT_NETWORK } from "@/app/lib/constants";
import { ModalContext } from "@/app/providers";
import { ChipEnrollData } from "@/app/components/Common/types/common.types";

const COMMITMENT_KEY = "matroid-chip-commitment";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

const storedCommitment = (): `0x${string}` | undefined => {
  if (typeof window === "undefined") return undefined;
  const v = window.localStorage.getItem(COMMITMENT_KEY);
  return v && /^0x[0-9a-fA-F]{64}$/.test(v) ? (v as `0x${string}`) : undefined;
};

const randomFreshHex = (): string => {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const useChip = () => {
  const context = useContext(ModalContext);
  const addresses = useCoreAddresses();
  const registry = addresses.IdentityRegistry;
  const client = usePublicClient({ chainId: DEFAULT_NETWORK.chainId });
  const [connected, setConnected] = useState<boolean>(isChipConnected());
  const [commitment, setCommitment] = useState<`0x${string}` | undefined>(
    storedCommitment,
  );
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(
    () =>
      subscribeIdentity(() => {
        setConnected(isChipConnected());
        setCommitment(storedCommitment());
      }),
    [],
  );

  const connect = async (): Promise<void> => {
    setBusy(true);
    try {
      await connectChip();
      setCommitment(storedCommitment());
      setConnected(true);
    } catch (e) {
      console.log("chip.connect failed", e);
      context?.setTxModal({
        open: true,
        status: "error",
        label: "txEnroll",
        message: e instanceof Error ? e.message : "bridgeUnreachable",
      });
      setConnected(false);
      setCommitment(undefined);
    } finally {
      setBusy(false);
    }
  };

  const disconnect = (): void => {
    disconnectChip();
    setConnected(false);
    setCommitment(undefined);
  };

  const enrollData = async (): Promise<ChipEnrollData | null> => {
    setBusy(true);
    try {
      if (!(await circuitAvailable("enrollment"))) {
        throw new Error("circuitMissing");
      }
      if (!isAddr(registry) || !client) {
        throw new Error("registryMissing");
      }
      context?.setTxModal({
        open: true,
        status: "proving",
        label: "txEnroll",
      });
      const res = await chipEnrollProof(randomFreshHex(), undefined, async (c) => {
        try {
          return (await client.readContract({
            address: registry as Hex,
            abi: getABI("IdentityRegistry") as Abi,
            functionName: "enrolledCommitment",
            args: [c],
          })) as boolean;
        } catch {
          return false;
        }
      });
      const commitmentHex = numberToHex(res.commitment, {
        size: 32,
      }) as `0x${string}`;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(COMMITMENT_KEY, commitmentHex);
      }
      setCommitment(commitmentHex);
      notifyIdentity();
      if (res.alreadyEnrolled) {
        context?.setTxModal({
          open: true,
          status: "success",
          label: "txEnroll",
        });
        return null;
      }
      const { tree, leaves } = await buildIdentityTree(
        client,
        registry as Hex,
      );
      const { siblings } = merklePath(tree, leaves.length);
      return {
        commitment: commitmentHex,
        proof: res.proof,
        enrollNullifier: res.enrollNullifier,
        freshBind: res.freshBind,
        siblings: siblings.map(
          (s) => numberToHex(s, { size: 32 }) as `0x${string}`,
        ),
      };
    } catch (e) {
      console.log("chip.enrollData failed", e);
      context?.setTxModal({
        open: true,
        status: "error",
        label: "txEnroll",
        message: e instanceof Error ? e.message : "chipNotConnected",
      });
      return null;
    } finally {
      setBusy(false);
    }
  };

  return { connected, commitment, busy, connect, disconnect, enrollData };
};
