import { poseidon1, poseidon2 } from "poseidon-lite";

export const hash1 = (a: bigint): bigint => poseidon1([a]);
export const hash2 = (a: bigint, b: bigint): bigint => poseidon2([a, b]);

export const toField = (v: `0x${string}` | bigint | number): bigint =>
  typeof v === "bigint" ? v : BigInt(v);

export const toHex32 = (x: bigint): `0x${string}` =>
  `0x${x.toString(16).padStart(64, "0")}`;
