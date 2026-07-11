import { useContext, useEffect, useState } from "react";
import {
  connectChip,
  disconnectChip,
  ensureIdentity,
  enrollNullifierFrom,
  enrollProofInputs,
  fetchAttestation,
  freshnessFor,
  getIdentity,
  subscribeIdentity,
} from "@/app/lib/zk/identity";
import { circuitAvailable, prove } from "@/app/lib/zk/prover";
import { hash2, toHex32 } from "@/app/lib/zk/poseidon";
import { ModalContext } from "@/app/providers";
import { ChipEnrollData } from "@/app/components/Common/types/common.types";

const ENROLL_SCOPE = BigInt("0x656e726f6c6c");

export const useChip = () => {
  const context = useContext(ModalContext);
  const [connected, setConnected] = useState<boolean>(Boolean(getIdentity()));
  const [commitment, setCommitment] = useState<`0x${string}` | undefined>(
    () => {
      const id = getIdentity();
      return id ? toHex32(id.commitment) : undefined;
    },
  );
  const [busy, setBusy] = useState<boolean>(false);

  useEffect(
    () =>
      subscribeIdentity(() => {
        const id = getIdentity();
        setConnected(Boolean(id));
        setCommitment(id ? toHex32(id.commitment) : undefined);
      }),
    [],
  );

  const connect = async (): Promise<void> => {
    setBusy(true);
    try {
      const id = await connectChip();
      setCommitment(toHex32(id.commitment));
      setConnected(true);
    } catch (e) {
      console.log("chip.connect failed", e);
      context?.setTxModal({
        open: true,
        status: "error",
        label: "txEnroll",
        message: e instanceof Error ? e.message : "chip bridge not reachable",
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
      const id = ensureIdentity();
      let proof: `0x${string}` = "0x";
      let enrollNullifier: `0x${string}` = toHex32(
        hash2(id.commitment, ENROLL_SCOPE),
      );
      if (await circuitAvailable("enrollment")) {
        const freshHex = freshnessFor(id.commitment);
        context?.setTxModal({
          open: true,
          status: "proving",
          label: "txEnroll",
        });
        const chipAttest = await fetchAttestation(freshHex);
        const inputs = enrollProofInputs(chipAttest, freshHex);
        const res = await prove("enrollment", inputs);
        proof = res.proof;
        enrollNullifier = toHex32(
          enrollNullifierFrom(String(chipAttest.chipId)),
        );
      }
      return {
        commitment: toHex32(id.commitment),
        proof,
        enrollNullifier,
      };
    } catch (e) {
      console.log("chip.enrollData failed", e);
      context?.setTxModal({
        open: true,
        status: "error",
        label: "txEnroll",
        message: e instanceof Error ? e.message : "chip not connected",
      });
      return null;
    } finally {
      setBusy(false);
    }
  };

  return { connected, commitment, busy, connect, disconnect, enrollData };
};
