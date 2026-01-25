import { useEffect, useRef, useState } from "react";
import { fetchMatroidGraphQL } from "@/app/lib/graphql/fetcher";

type UseMatroidQueryResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

type UseMatroidQueryArgs = {
  query: string;
  variables?: Record<string, unknown>;
  enabled?: boolean;
};

export const useMatroidQuery = <T>({
  query,
  variables,
  enabled = true,
}: UseMatroidQueryArgs): UseMatroidQueryResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const latestCallId = useRef(0);

  const run = async () => {
    const callId = latestCallId.current + 1;
    latestCallId.current = callId;
    setLoading(true);
    setError(null);
    try {
      const next = await fetchMatroidGraphQL<T>({ query, variables });
      if (latestCallId.current === callId) {
        setData(next);
      }
    } catch (err: any) {
      if (latestCallId.current === callId) {
        setError(err?.message || "Failed to load data");
      }
    } finally {
      if (latestCallId.current === callId) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!enabled) return;
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, JSON.stringify(variables), enabled]);

  return { data, loading, error, refetch: run };
};
