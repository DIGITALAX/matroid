export type GraphQLErrorShape = {
  message?: string;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLErrorShape[];
};

type FetchGraphQLParams = {
  query: string;
  variables?: Record<string, unknown>;
};

export const fetchMatroidGraphQL = async <T>({
  query,
  variables,
}: FetchGraphQLParams): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  let res: Response;
  try {
    res = await fetch("/api/graphql/matroid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    console.log("matroid subgraph fetch failed/timeout", e);
    throw new Error("SUBGRAPH_UNREACHABLE");
  }
  clearTimeout(timer);
  const json = (await res.json()) as GraphQLResponse<T>;
  if (!res.ok || json?.errors?.length) {
    throw new Error(json?.errors?.[0]?.message || "GraphQL error");
  }
  if (!json?.data) {
    throw new Error("No GraphQL data");
  }
  return json.data;
};
