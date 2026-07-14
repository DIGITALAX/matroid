import { CoreContractAddresses } from "../components/Common/types/common.types";

export const LOCALES: string[] = ["en", "es", "pt", "ar"];

export const INFURA_GATEWAY: string = "https://cdn.digitalax.xyz";
export const INFURA_GATEWAY_INTERNAL: string =
  "https://cdn.digitalax.xyz/ipfs/";

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
  ZKSYNC: {
    chainId: 260,
    name: "ZKsync Local",
    rpcUrl: "http://127.0.0.1:8011",
    blockExplorer: "https://explorer.lens.xyz",
  },
  LENS_TESTNET: {
    chainId: 37111,
    name: "Lens Testnet",
    rpcUrl:
      process.env.NEXT_PUBLIC_LENS_TESTNET_RPC_URL ||
      "https://rpc.testnet.lens.xyz",
    blockExplorer: "https://explorer.testnet.lens.xyz",
  },
  LENS_MAINNET: {
    chainId: 232,
    name: "Lens Network",
    rpcUrl: "https://rpc.lens.xyz",
    blockExplorer: "https://explorer.lens.xyz",
  },
} as const;

export type NetworkConfig = (typeof NETWORKS)[keyof typeof NETWORKS];

export const getCurrentNetwork = (): NetworkConfig => {
  const net = process.env.NEXT_PUBLIC_NETWORK;
  if (net === "anvil") return NETWORKS.ANVIL;
  if (net === "zksync") return NETWORKS.ZKSYNC;
  if (net === "testnet") return NETWORKS.LENS_TESTNET;
  return NETWORKS.LENS_MAINNET;
};

export const DEFAULT_NETWORK = getCurrentNetwork();

export const getNetworkByChainId = (chainId: number): NetworkConfig => {
  const match = Object.values(NETWORKS).find(
    (network) => network.chainId === chainId,
  );
  return match || DEFAULT_NETWORK;
};

export const CORE_CONTRACT_ADDRESSES: Record<number, CoreContractAddresses> = {
  [NETWORKS.ANVIL.chainId]: {
    Mona: "0x1F0151386fB0AbBF0273238dF5E9bc519DE5e20B",
    StakingFactory: "0x5B11c36bf87ED2EAc102C42E9528eC99D77f7aFd",
    SignalRegistry: "0x29c6fF2E3D04a9f37e7af1fF9b38C9E2e9079FfA",
    SignalKit: "0xd4567AA4Fd1B32A16c16CBFF9D9a69e51CF72293",
    SignalScorer: "0xcFDE18a0f130bBAfe0037072407F83899D49414f",
    GlobalStakingPool: "0x3ccA24e1A0e49654bc3482ab70199b7400eb7A3a",
    Treasury: "0xfC3c03385dA8D5Adfb8BDF5f5fe156fb5B3a6Ee2",
    SlashingCouncil: "0x1055780Bd25e2F698E7c9a95FBaf4cb565A23A14",
    MatroidAnonGovernance: "0x",
    IdentityRegistry: "0x22F4D93be0E8C0C081e74c0d5e697B64eEA007FF",
    BalancePool: "0x",
  },
  [NETWORKS.ZKSYNC.chainId]: {
    Mona: "0xd4567AA4Fd1B32A16c16CBFF9D9a69e51CF72293",
    StakingFactory: "0xcFDE18a0f130bBAfe0037072407F83899D49414f",
    SignalRegistry: "0x3ccA24e1A0e49654bc3482ab70199b7400eb7A3a",
    SignalKit: "0xfC3c03385dA8D5Adfb8BDF5f5fe156fb5B3a6Ee2",
    SignalScorer: "0x1055780Bd25e2F698E7c9a95FBaf4cb565A23A14",
    GlobalStakingPool: "0x9035E63C5Ac74dE843F176BE6B9869cA2385C61d",
    Treasury: "0xF3a4d6E6581e12Dc5b0eCd6EA3d483fF09c3cAE0",
    SlashingCouncil: "0x8a7E4b12Fb1914d91A84fe66e7B0e899DE291167",
    MatroidAnonGovernance: "0xA1B809005E589f81dE6EF9F48D67e35606c05fC3",
    IdentityRegistry: "0xe4C7fBB0a626ed208021ccabA6Be1566905E2dFc",
    BalancePool: "0xf43624d811c5DC9eF91cF237ab9B8eE220D438eE",
  },
  [NETWORKS.LENS_TESTNET.chainId]: {
    Mona: "0x674DB539f2469A934c60361D3f9aC3B6392764fe",
    StakingFactory: "0x4b8d663B330aeeF0D3F2D4c5484667488b3b1659",
    SignalRegistry: "0xA92Fe487cBF1C5AE8C3D6461Cb9cD6FFd82cDdC4",
    SignalKit: "0xd83278EBCE020faaA9374491958eE51C1756122B",
    SignalScorer: "0x7CE382F310cCff8b7b94266D4FbA7D07da350796",
    GlobalStakingPool: "0x6197DcaE07a001837B893d2Eebf07048e7C7337e",
    Treasury: "0x4D3eB87A346AC54f4A0a2a6BAe168972db5aB1Ad",
    SlashingCouncil: "0xf3BC087Ce2995669B0eA461A4ccb0CEd8Aa6e78F",
    MatroidAnonGovernance: "0x86214baEA20cb79cbe1AEF0A10d8739352524Af5",
    IdentityRegistry: "0x748C1Ca889899adFA422CF90Ad7D5ac8f9996257",
    BalancePool: "0x9f595C5F39F4F4eEFB2b48eD4E04C6D870B60499",
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
    MatroidAnonGovernance: "0x",
    IdentityRegistry: "0x",
    BalancePool: "0x",
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
