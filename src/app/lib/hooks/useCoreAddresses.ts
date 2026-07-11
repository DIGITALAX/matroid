import { useMemo } from "react";
import {
  DEFAULT_NETWORK,
  getCoreContractAddresses,
} from "@/app/lib/constants";
import { useChainId } from "wagmi";

const isAddr = (a?: string): boolean => !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

export const useCoreAddresses = () => {
  const chainId = useChainId();
  return useMemo(() => {
    try {
      const resolved = getCoreContractAddresses(chainId);
      if (isAddr(resolved.SignalRegistry)) {
        return resolved;
      }
      return getCoreContractAddresses(DEFAULT_NETWORK.chainId);
    } catch {
      return getCoreContractAddresses(DEFAULT_NETWORK.chainId);
    }
  }, [chainId]);
};
