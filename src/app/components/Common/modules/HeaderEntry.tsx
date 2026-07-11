"use client";

import { FunctionComponent, useState } from "react";
import { useAccount } from "wagmi";
import ActionButton from "./ActionButton";
import ConnectModal from "./ConnectModal";
import { useChip } from "@/app/lib/hooks/useChip";
import { usePathname, useRouter } from "next/navigation";

const HeaderEntry: FunctionComponent<{ dict: any }> = ({ dict }) => {
  const router = useRouter();
  const path = usePathname();
  const currentLang = path.match(/(?<=\/)(en|es|ar|pt)(?=\/)/)?.[0] ?? "en";
  const { address, isConnected } = useAccount();
  const chip = useChip();
  const [open, setOpen] = useState<boolean>(false);

  const label =
    isConnected && address
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : chip.connected
        ? `${dict?.chip}`
        : dict?.connectWallet;

  return (
    <div className="relative w-full flex-row flex-wrap h-fit flex items-start justify-center gap-3">
      {!/^\/(en|es|ar|pt)?\/?$/.test(path || "/") && (
        <ActionButton
          showIcon={false}
          connect={true}
          label={dict?.return}
          onClick={() => router.push(`/${currentLang}`)}
        />
      )}
      <ActionButton
        showIcon={false}
        label={label}
        onClick={() => setOpen(true)}
        connect={true}
      />
      <ConnectModal dict={dict} open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default HeaderEntry;
