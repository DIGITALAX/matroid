import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";

type UseProjectClaimerResult = {
  isClaimer: boolean;
  loading: boolean;
  error: string | null;
};

export const useProjectClaimer = (
  project?: string | null,
  claimer?: string | null,
): UseProjectClaimerResult => {
  const addresses = useCoreAddresses();
  const enabled = Boolean(project && claimer);
  const result = useReadContract({
    address: addresses.SignalRegistry as `0x${string}`,
    abi: getABI("SignalRegistry"),
    functionName: "projectClaimers",
    args: enabled ? [project, claimer] : undefined,
    query: { enabled },
  });

  const isClaimer = useMemo(() => {
    if (!enabled) return false;
    return Boolean(result.data);
  }, [enabled, result.data]);

  return {
    isClaimer,
    loading: result.isLoading,
    error: result.error ? result.error.message : null,
  };
};
