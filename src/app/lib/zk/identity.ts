import { Identity } from "@semaphore-protocol/core";
import { sha256, toHex } from "viem";
import { poseidon1 } from "poseidon-lite";

const BRIDGE_URL =
  process.env.NEXT_PUBLIC_CHIP_BRIDGE || "http://localhost:7151";

let chipIdentity: Identity | null = null;

const listeners = new Set<() => void>();

export const subscribeIdentity = (cb: () => void): (() => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

const notifyIdentity = (): void => {
  listeners.forEach((cb) => cb());
};

export const connectChip = async (): Promise<Identity> => {
  const res = await fetch(`${BRIDGE_URL}/secret`).catch(() => null);
  if (!res || !res.ok) {
    throw new Error(
      "chip bridge not reachable — is the bridge running with the SE051 connected?",
    );
  }
  const data = (await res.json()) as {
    identitySeed?: string;
    error?: string;
  };
  if (!data.identitySeed) {
    throw new Error(data.error || "chip bridge returned no secret");
  }
  chipIdentity = new Identity(data.identitySeed);
  notifyIdentity();
  return chipIdentity;
};

export const disconnectChip = (): void => {
  chipIdentity = null;
  notifyIdentity();
};

export const getIdentity = (): Identity | null => chipIdentity;

export const ensureIdentity = (): Identity => {
  if (!chipIdentity) {
    throw new Error("chip not connected — tap connect first");
  }
  return chipIdentity;
};

export const fetchAttestation = async (
  freshHex: string,
): Promise<Record<string, unknown>> => {
  const res = await fetch(`${BRIDGE_URL}/attest?fresh=${freshHex}`).catch(
    () => null,
  );
  if (!res) {
    throw new Error(
      `chip bridge not reachable at ${BRIDGE_URL} — open the rezygcki app and turn on the browser bridge`,
    );
  }
  const data = (await res.json().catch(() => ({}))) as {
    inputs?: Record<string, unknown>;
    error?: string;
  };
  if (!res.ok || !data.inputs) {
    throw new Error(
      data.error
        ? `attestation failed: ${data.error}`
        : `attestation failed (bridge returned ${res.status})`,
    );
  }
  return data.inputs;
};

export const freshnessFor = (commitment: bigint): string => {
  const be32 = toHex(commitment, { size: 32 });
  return sha256(be32).slice(2, 34);
};

export const enrollNullifierFrom = (chipIdHex: string): bigint =>
  poseidon1([BigInt(chipIdHex)]);

export const enrollProofInputs = (
  chipAttest: Record<string, unknown>,
  freshHex: string,
): Record<string, unknown> => {
  const chipId = String(chipAttest.chipId);
  const { chipId: _drop, ...rest } = chipAttest;
  void _drop;
  return {
    ...rest,
    fresh_bind: BigInt("0x" + freshHex).toString(),
    enroll_nullifier: enrollNullifierFrom(chipId).toString(),
  };
};
