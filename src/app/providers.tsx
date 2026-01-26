"use client";
import { createContext } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { chains } from "@lens-chain/sdk/viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { walletConnect, coinbaseWallet, injected } from "wagmi/connectors";

const queryClient = new QueryClient();

export const ModalContext = createContext<{} | undefined>(undefined);

export const config = createConfig({
  chains: [chains.mainnet],
  transports: {
    [chains.mainnet.id]: http("https://rpc.lens.xyz"),
  },
  ssr: true,
  connectors: [
    injected({ target: "metaMask" }),
    coinbaseWallet({
      appName: "MATROID",
      appLogoUrl: "https://matroid.digitalax.xyz/favicon.ico",
      preference: {
        options: "all",
        telemetry: false,
      },
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
      metadata: {
        name: "MATROID",
        description: "MATROID Protocol",
        url: "https://matroid.digitalax.xyz",
        icons: ["https://matroid.digitalax.xyz/favicon.ico"],
      },
      showQrModal: false,
      qrModalOptions: {
        themeMode: "dark",
      },
      telemetryEnabled: false,
    }),
  ],
});

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