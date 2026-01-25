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
  const res = await fetch("/api/graphql/matroid", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as GraphQLResponse<T>;
  if (!res.ok || json?.errors?.length) {
    throw new Error(json?.errors?.[0]?.message || "GraphQL error");
  }
  if (!json?.data) {
    throw new Error("No GraphQL data");
  }
  return json.data;
};
