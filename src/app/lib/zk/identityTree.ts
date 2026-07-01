import { fetchMatroidGraphQL } from "@/app/lib/graphql/fetcher";
import { ENROLLMENTS_QUERY } from "@/app/lib/graphql/matroid";
import { IncrementalMerkleTree, MerkleProof } from "./merkle";

type RawEnroll = { commitment: string; leafIndex: number };
type EnrollmentsResponse = { enrollments: RawEnroll[] };

export type IdentityProof = {
  proof: MerkleProof;
  root: bigint;
  index: number;
};

export const buildIdentityProof = async (
  commitment: bigint,
): Promise<IdentityProof | null> => {
  const data = await fetchMatroidGraphQL<EnrollmentsResponse>({
    query: ENROLLMENTS_QUERY,
  });
  const rows = (data?.enrollments ?? [])
    .slice()
    .sort((a, b) => a.leafIndex - b.leafIndex);
  const tree = new IncrementalMerkleTree();
  for (const r of rows) tree.insert(BigInt(r.commitment));
  const index = tree.indexOf(commitment);
  if (index < 0) return null;
  return { proof: tree.proof(index), root: tree.root(), index };
};
