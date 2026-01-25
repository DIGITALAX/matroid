"use client";

import { ConnectKitButton } from "connectkit";
import { FunctionComponent } from "react";
import ActionButton from "./ActionButton";
import { usePathname, useRouter } from "next/navigation";

const HeaderEntry: FunctionComponent<{ dict: any }> = ({ dict }) => {
  const router = useRouter();
  const path = usePathname();
  return (
    <div className="relative w-full flex-row flex-wrap h-fit flex items-start justify-center gap-3">
      {(path?.includes("/create") ||
        path?.includes("/manage") ||
        path?.includes("/info") ||
        path?.includes("/walkaway") ||
        path?.includes("/race-condition")) && (
        <ActionButton
          showIcon={false}
          connect={true}
          label={dict?.return}
          onClick={() => router.push("/")}
        />
      )}
      <ConnectKitButton.Custom>
        {({ isConnected, show, address }) => (
          <ActionButton
            showIcon={false}
            label={
              isConnected && address
                ? `${address.slice(0, 6)}...${address.slice(-4)}`
                : dict?.connectWallet
            }
            onClick={show}
            connect={true}
          />
        )}
      </ConnectKitButton.Custom>
    </div>
  );
};

export default HeaderEntry;
