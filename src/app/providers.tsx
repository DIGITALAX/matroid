"use client";
import { createContext } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { chains } from "@lens-chain/sdk/viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { anvil } from "viem/chains";

const queryClient = new QueryClient();

export const ModalContext = createContext<{} | undefined>(undefined);

export const config = createConfig(
  getDefaultConfig({
    appName: "MATROID",
    walletConnectProjectId: process.env
      .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
    appUrl: "https://matroid.digitalax.xyz",
    appIcon: "https://matroid.digitalax.xyz/favicon.ico",
    chains: [chains.mainnet],
    transports: {
      [chains.mainnet.id]: http("https://rpc.lens.xyz"),
      // [anvil.id]: http("http://127.0.0.1:8545"),
    },
    ssr: true,
  }),
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <ModalContext.Provider value={{}}>{children}</ModalContext.Provider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
