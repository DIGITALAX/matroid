import { hash2 } from "./poseidon";

const KEY = "matroid-zk-identity";

export type Identity = { deviceSecret: string; chipField: string };

const randomField = (): bigint => {
  const b = crypto.getRandomValues(new Uint8Array(31));
  let x = 0n;
  for (const v of b) x = (x << 8n) + BigInt(v);
  return x;
};

export const getIdentity = (): Identity | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Identity) : null;
};

export const ensureIdentity = (): Identity => {
  const existing = getIdentity();
  if (existing) return existing;
  const id: Identity = {
    deviceSecret: randomField().toString(),
    chipField: randomField().toString(),
  };
  localStorage.setItem(KEY, JSON.stringify(id));
  return id;
};

export const commitmentOf = (id: Identity): bigint =>
  hash2(BigInt(id.deviceSecret), BigInt(id.chipField));

export const actionNullifier = (id: Identity, scope: bigint): bigint =>
  hash2(BigInt(id.deviceSecret), scope);

export const randomSalt = (): bigint => {
  const b = crypto.getRandomValues(new Uint8Array(31));
  let x = 0n;
  for (const v of b) x = (x << 8n) + BigInt(v);
  return x;
};

export const tagFromSalt = (id: Identity, salt: bigint): bigint =>
  hash2(BigInt(id.deviceSecret), salt);
