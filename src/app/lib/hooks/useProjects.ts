import { useReadContracts } from "wagmi";
import type { Abi } from "viem";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";
import { useProjectsPanel } from "@/app/lib/hooks/useProjectsPanel";

const isAddr = (a?: string): a is `0x${string}` =>
  !!a && /^0x[0-9a-fA-F]{40}$/.test(a);

export const useProjects = (epoch: bigint) => {
  const { projects, loading, error } = useProjectsPanel(true);
  const addresses = useCoreAddresses();
  const scorer = addresses.SignalScorer;
  const scorerReady = isAddr(scorer);
  const scorerAbi = getABI("SignalScorer") as Abi;

  const { data: scores } = useReadContracts({
    contracts: projects
      .filter((p) => isAddr(p.id))
      .map((p) => ({
        address: scorer as `0x${string}`,
        abi: scorerAbi,
        functionName: "score",
        args: [p.id as `0x${string}`, epoch],
      })),
    query: { enabled: scorerReady && projects.length > 0 },
  });

  const items = projects.map((p, i) => ({
    project: p,
    score: scores?.[i]?.result as bigint | undefined,
  }));

  return { items, loading, error, scorerReady };
};
