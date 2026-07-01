import { fetchMatroidGraphQL } from "@/app/lib/graphql/fetcher";
import { BALANCE_LEAVES_QUERY } from "@/app/lib/graphql/matroid";
import { IncrementalMerkleTree, MerkleProof } from "./merkle";
import { hash2 } from "./poseidon";

type RawLeaf = { holder: string; balance: string; leafIndex: number };
type BalanceLeavesResponse = { balanceLeaves: RawLeaf[] };

export type BalanceProof = {
  proof: MerkleProof;
  root: bigint;
  balance: bigint;
  index: number;
};

export const buildBalanceProof = async (
  holder: bigint,
): Promise<BalanceProof | null> => {
  const data = await fetchMatroidGraphQL<BalanceLeavesResponse>({
    query: BALANCE_LEAVES_QUERY,
  });
  const rows = (data?.balanceLeaves ?? [])
    .slice()
    .sort((a, b) => a.leafIndex - b.leafIndex);

  const tree = new IncrementalMerkleTree();
  for (const r of rows) tree.insert(hash2(BigInt(r.holder), BigInt(r.balance)));

  const mine = rows.filter((r) => BigInt(r.holder) === holder);
  if (mine.length === 0) return null;
  const latest = mine[mine.length - 1];
  const balance = BigInt(latest.balance);
  const index = tree.indexOf(hash2(holder, balance));
  if (index < 0) return null;

  return { proof: tree.proof(index), root: tree.root(), balance, index };
};
