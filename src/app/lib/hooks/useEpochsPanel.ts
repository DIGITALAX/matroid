import { useMemo } from "react";
import { useMatroidQuery } from "@/app/lib/hooks/useMatroidQuery";
import { EPOCHS_PANEL_QUERY } from "@/app/lib/graphql/matroid";
import { EpochItem, EpochsPanelQueryData } from "@/app/lib/types/matroid";

type UseEpochsPanelResult = {
  epochs: EpochItem[];
  loading: boolean;
  error: string | null;
};

export const useEpochsPanel = (
  enabled = true,
): UseEpochsPanelResult => {
  const { data, loading, error } = useMatroidQuery<EpochsPanelQueryData>({
    query: EPOCHS_PANEL_QUERY,
    enabled,
  });

  const epochs = useMemo<EpochItem[]>(() => {
    return data?.globals?.[0]?.epochs?.slice() || [];
  }, [data]);

  return { epochs, loading, error };
};
