"use client";

import { FunctionComponent, JSX } from "react";
import { usePathname } from "next/navigation";
import { ConnectKitButton } from "connectkit";
import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import Frame from "@/app/components/Create/modules/Frame";
import ActionButton from "./ActionButton";
import { useChip } from "@/app/lib/hooks/useChip";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

const ConnectModal: FunctionComponent<{
  dict: any;
  open: boolean;
  onClose: () => void;
}> = ({ dict, open, onClose }): JSX.Element | null => {
  const path = usePathname();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const chip = useChip();

  if (!open) return null;

  const wrongNetwork = isConnected && chainId !== DEFAULT_NETWORK.chainId;
  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-row items-center justify-center bg-black/70 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md flex flex-col bg-gradient-to-r from-offBlack via-black/70 to-offBlack rounded-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Frame title={`*${dict?.connectWallet}*`}>
          <div
            className="relative w-full h-fit flex flex-col gap-4 font-earl text-black"
            dir={path?.includes("/ar") ? "rtl" : "ltr"}
          >
            <div className="relative w-full flex flex-col gap-2 border-2 border-black bg-white/60 p-3">
              <div className="relative w-full flex flex-row items-center gap-2 flex-wrap">
                <span className="relative flex flex-1 font-digiB uppercase text-sm">
                  {dict?.wallet}
                </span>
                <span
                  className={`relative flex text-xs ${
                    isConnected ? "" : "opacity-60"
                  }`}
                >
                  {isConnected ? `✓ ${short}` : dict?.notConnected}
                </span>
              </div>
              {isConnected ? (
                <ActionButton
                  size="sm"
                  showIcon={false}
                  label={dict?.disconnect}
                  onClick={() => disconnect()}
                />
              ) : (
                <ConnectKitButton.Custom>
                  {({ show }) => (
                    <ActionButton
                      size="sm"
                      showIcon={false}
                      label={dict?.connectWallet}
                      onClick={show}
                    />
                  )}
                </ConnectKitButton.Custom>
              )}
              {wrongNetwork ? (
                <div className="relative w-full flex flex-col gap-1">
                  <span className="relative flex text-xs">
                    {dict?.wrongNetwork} ({chainId} ≠ {DEFAULT_NETWORK.chainId})
                  </span>
                  <ActionButton
                    size="sm"
                    showIcon={false}
                    label={dict?.switchChain}
                    disabled={!switchChain}
                    loading={isSwitching}
                    onClick={() =>
                      switchChain?.({ chainId: DEFAULT_NETWORK.chainId })
                    }
                  />
                </div>
              ) : null}
            </div>

            <div className="relative w-full flex flex-col gap-2 border-2 border-black bg-white/60 p-3">
              <div className="relative w-full flex flex-row items-center gap-2 flex-wrap">
                <span className="relative flex flex-1 font-digiB uppercase text-sm">
                  {dict?.chip}
                </span>
                <span
                  className={`relative flex text-xs ${
                    chip.connected ? "" : "opacity-60"
                  }`}
                >
                  {chip.connected
                    ? `✓ ${chip.commitment?.slice(0, 10)}…`
                    : dict?.notConnected}
                </span>
              </div>
              <ActionButton
                size="sm"
                showIcon={false}
                label={chip.connected ? dict?.disconnect : dict?.connectChip}
                loading={chip.busy}
                onClick={chip.connected ? chip.disconnect : chip.connect}
              />
            </div>

            <div className="relative w-full flex flex-row justify-end">
              <ActionButton
                size="sm"
                showIcon={false}
                label={dict?.done}
                onClick={onClose}
              />
            </div>
          </div>
        </Frame>
      </div>
    </div>
  );
};

export default ConnectModal;
