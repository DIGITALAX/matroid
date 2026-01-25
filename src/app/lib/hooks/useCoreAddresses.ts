import { useMemo } from "react";
import {
  DEFAULT_NETWORK,
  getCoreContractAddresses,
} from "@/app/lib/constants";
import { useChainId } from "wagmi";

export const useCoreAddresses = () => {
  const chainId = useChainId();
  return useMemo(() => {
    try {
      return getCoreContractAddresses(chainId);
    } catch {
      return getCoreContractAddresses(DEFAULT_NETWORK.chainId);
    }
  }, [chainId]);
};
