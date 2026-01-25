import { useMemo } from "react";
import { useMatroidQuery } from "@/app/lib/hooks/useMatroidQuery";
import { PROJECTS_PANEL_QUERY } from "@/app/lib/graphql/matroid";
import {
  ProjectListItem,
  ProjectsPanelQueryData,
} from "@/app/lib/types/matroid";

type UseProjectsPanelResult = {
  projects: ProjectListItem[];
  loading: boolean;
  error: string | null;
};

export const useProjectsPanel = (
  enabled = true,
): UseProjectsPanelResult => {
  const { data, loading, error } = useMatroidQuery<ProjectsPanelQueryData>({
    query: PROJECTS_PANEL_QUERY,
    enabled,
  });

  const projects = useMemo<ProjectListItem[]>(() => {
    return data?.projects?.slice() || [];
  }, [data]);

  return { projects, loading, error };
};
