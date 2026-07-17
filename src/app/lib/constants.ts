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
    Mona: "0xE00A695e460e44194fF851a4E8F7fa9529fD6EA2",
    StakingFactory: "0x4b381a0b18E12E63a6DACc51919039bD211a0be9",
    SignalRegistry: "0x09Ca99B9893FB38edA6375f46d487A78C29F3292",
    SignalKit: "0xd029E16723D10634102C3b665df6908624880c34",
    SignalScorer: "0x9dCB721492Efa1d839549498169D414cEE7D5b85",
    GlobalStakingPool: "0x42585bc083ac4Ead2AF492E7aCfd83dc4117C2C1",
    Treasury: "0x22719C7546DA37C629085e0b7333Cd1118604F6c",
    SlashingCouncil: "0xb9695C94f3aACCE22921Ae4B6539481EA190Af43",
    MatroidAnonGovernance: "0x5686c890827423ff58eb4C8fDe8D18C3cbCc11b3",
    IdentityRegistry: "0x84C084579Daa3c6a6f600657969a38e8D3fBEB5F",
    BalancePool: "0x6a7d65c87dAa5c9ad98DBD1eF8567c2056989272",
  },
  [NETWORKS.LENS_TESTNET.chainId]: {
    Mona: "0x8dF5fc980475169839c69277A0F3871c1804aF0E",
    StakingFactory: "0x449d77Fe38A0F1E25276d2E4AB5c5fE3c2b6B3B9",
    SignalRegistry: "0xD8f2918921aD39cFE7216C1Fd130F94d345615e6",
    SignalKit: "0x5713eC9FC31C15A353952EE895deE655E641F5FF",
    SignalScorer: "0xd9559acfF3044D0E95D8e8d97Cc742D3f657569C",
    GlobalStakingPool: "0x8e53DDbB26Ad1817f0DB4A51A3077cF24d23dbA0",
    Treasury: "0xE571Ad3A5246bAa4d1b860E3785AC513750Ad8D9",
    SlashingCouncil: "0x81499af07264a1E0494485333e165aEaBcAeCcab",
    MatroidAnonGovernance: "0x012dA3d3085775a245Ec2CEDDa80eF98aC853157",
    IdentityRegistry: "0x7990e98504AcD43681cdfFb975Aa75472836855e",
    BalancePool: "0x07BD5E26287B23354D27aA680D274b9098BA9e5B",
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
