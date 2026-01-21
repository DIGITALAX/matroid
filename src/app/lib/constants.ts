import { CoreContractAddresses } from "../components/Common/types/common.types";

export const LOCALES: string[] = ["en", "es"];

export const INFURA_GATEWAY: string = "https://thedial.infura-ipfs.io";
export const INFURA_GATEWAY_INTERNAL: string =
  "https://digitalax.xyz/api/infura/";

export const idiomaAIndice: { [key in Idiomas]: number } = {
  ["en"]: 0,
  ["es"]: 1,
  ["ar"]: 2,
  ["pt"]: 3,
};

export enum Idiomas {
  Ingles = "en",
  Español = "es",
  Árabe = "ar",
  Portugués = "pt",
}

export const indiceAIdioma: { [key in number]: string } = {
  [0]: "en",
  [1]: "es",
  [2]: "ar",
  [3]: "pt",
};

export const NETWORKS = {
  ANVIL: {
    chainId: 31337,
    name: "Anvil",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "https://explorer.lens.xyz",
  },
  LENS_TESTNET: {
    chainId: 37111,
    name: "Lens Network Testnet",
    rpcUrl: "https://rpc.testnet.lens.dev",
    blockExplorer: "https://block-explorer.testnet.lens.dev",
  },
  LENS_MAINNET: {
    chainId: 232,
    name: "Lens Network",
    rpcUrl: "https://rpc.lens.xyz",
    blockExplorer: "https://explorer.lens.xyz",
  },
} as const;

export type NetworkConfig = (typeof NETWORKS)[keyof typeof NETWORKS];

export const DEFAULT_NETWORK =
  // process.env.NODE_ENV === "production"
  //   ?
  NETWORKS.ANVIL;
// : NETWORKS.LENS_TESTNET;

export const getCurrentNetwork = (): NetworkConfig => {
  // const isMainnet = process.env.NEXT_PUBLIC_NETWORK === "mainnet";
  // const isMainnet = true;
  // return isMainnet ? NETWORKS.LENS_MAINNET : NETWORKS.LENS_TESTNET;
  return NETWORKS.ANVIL;
};

export const CORE_CONTRACT_ADDRESSES: Record<number, CoreContractAddresses> = {
  [NETWORKS.ANVIL.chainId]: {
    Mona: "0x700b6a60ce7eaaea56f065753d8dcb9653dbad35",
    StakingFactory: "0xa15bb66138824a1c7167f5e85b957d04dd34e468",
    SignalRegistry: "0xb19b36b1456e65e3a6d514d3f715f204bd59f431",
    SignalKit: "0x8ce361602b935680e8dec218b820ff5056beb7af",
    SignalScorer: "0xe1da8919f262ee86f9be05059c9280142cf23f48",
    GlobalStakingPool: "0x0c8e79f3534b00d9a3d4a856b665bf4ebc22f2ba",
    Treasury: "0xed1db453c3156ff3155a97ad217b3087d5dc5f6e",
    SlashingCouncil: "0xf7cd8fa9b94db2aa972023b379c7f72c65e4de9d",
  },
  [NETWORKS.LENS_MAINNET.chainId]: {
    Mona: "0x",
    StakingFactory: "0x",
    SignalRegistry: "0x",
    SignalKit: "0x",
    SignalScorer: "0x",
    GlobalStakingPool: "0x",
    Treasury: "0x",
    SlashingCouncil: "0x",
  },
};

export const getCoreContractAddresses = (
  chainId: number,
): CoreContractAddresses => {
  const addresses = CORE_CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(
      `Core contract addresses not found for chain ID: ${chainId}`,
    );
  }
  return addresses;
};
