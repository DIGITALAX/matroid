import { Noir } from "@noir-lang/noir_js";
import { Barretenberg, UltraHonkBackend } from "@aztec/bb.js";
import { toHex } from "viem";

type CircuitName = "voting";

const cache: { [k: string]: { bytecode: string } } = {};

let bbPromise: Promise<Barretenberg> | null = null;
const getApi = (): Promise<Barretenberg> => {
  if (!bbPromise) bbPromise = Barretenberg.new();
  return bbPromise;
};

const loadCircuit = async (name: CircuitName) => {
  if (cache[name]) return cache[name];
  const res = await fetch(`/circuits/${name}.json`);
  if (!res.ok)
    throw new Error(`circuit ${name} not found at /circuits/${name}.json`);
  const json = await res.json();
  cache[name] = json;
  return json;
};

export const prove = async (
  name: CircuitName,
  inputs: Record<string, unknown>
): Promise<{ proof: `0x${string}`; publicInputs: string[] }> => {
  const circuit = await loadCircuit(name);
  const noir = new Noir(circuit as never);
  const { witness } = await noir.execute(inputs as never);
  const api = await getApi();
  const backend = new UltraHonkBackend(circuit.bytecode, api);
  const { proof, publicInputs } = await backend.generateProof(witness, {
    verifierTarget: "evm",
  });
  return { proof: toHex(proof), publicInputs };
};
