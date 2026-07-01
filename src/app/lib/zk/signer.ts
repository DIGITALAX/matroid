import { secp256k1 } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha256";
import { keccak_256 } from "@noble/hashes/sha3";

const to32be = (x: bigint): Uint8Array => {
  const out = new Uint8Array(32);
  let v = x;
  for (let i = 31; i >= 0; i--) {
    out[i] = Number(v & 0xffn);
    v >>= 8n;
  }
  return out;
};

const bytesToBigint = (b: Uint8Array): bigint => {
  let x = 0n;
  for (const v of b) x = (x << 8n) + BigInt(v);
  return x;
};

const ethAddress = (x: Uint8Array, y: Uint8Array): bigint => {
  const pub = new Uint8Array(64);
  pub.set(x, 0);
  pub.set(y, 32);
  const h = keccak_256(pub);
  return bytesToBigint(h.slice(12, 32));
};

const KEY = "matroid-zk-mona-key";

const ensureMonaKey = (): Uint8Array => {
  const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
  if (raw) return Uint8Array.from(JSON.parse(raw));
  const { secretKey } = secp256k1.keygen();
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(Array.from(secretKey)));
  }
  return secretKey;
};

export type MonaSig = {
  x: number[];
  y: number[];
  sig: number[];
  msg: number[];
  addr: bigint;
};

export const signMona = (proposalId: bigint): MonaSig => {
  const priv = ensureMonaKey();
  const pid32 = to32be(proposalId);
  const msg = sha256(pid32);
  const sig = secp256k1.sign(msg, priv, { prehash: false });
  const pub = secp256k1.getPublicKey(priv, false);
  const x = pub.slice(1, 33);
  const y = pub.slice(33, 65);
  return {
    x: Array.from(x),
    y: Array.from(y),
    sig: Array.from(sig),
    msg: Array.from(msg),
    addr: ethAddress(x, y),
  };
};
