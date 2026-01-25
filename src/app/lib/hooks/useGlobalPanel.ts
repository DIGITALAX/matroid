import { useMemo } from "react";
import { GLOBAL_PANEL_QUERY } from "@/app/lib/graphql/matroid";
import { useMatroidQuery } from "@/app/lib/hooks/useMatroidQuery";
import {
  GlobalPanel,
  GlobalPanelQueryData,
} from "@/app/lib/types/matroid";

export type GlobalPanelStats = {
  projectCount: number;
  epochCount: number;
};

type UseGlobalPanelResult = {
  globalPanel: GlobalPanel | null;
  stats: GlobalPanelStats | null;
  loading: boolean;
  error: string | null;
};

export const useGlobalPanel = (
  enabled = true,
): UseGlobalPanelResult => {
  const { data, loading, error } = useMatroidQuery<GlobalPanelQueryData>({
    query: GLOBAL_PANEL_QUERY,
    enabled,
  });
  const globalPanel = data?.globals?.[0] || null;

  const stats = useMemo<GlobalPanelStats | null>(() => {
    if (!globalPanel) return null;
    const projectCount = globalPanel.projects?.length ?? 0;
    const epochCount = globalPanel.epochs?.length ?? 0;
    return { projectCount, epochCount };
  }, [globalPanel]);

  return { globalPanel, stats, loading, error };
};
