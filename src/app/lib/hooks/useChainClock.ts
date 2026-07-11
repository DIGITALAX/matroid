import { useEffect, useRef, useState } from "react";
import { useBlock } from "wagmi";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

export const useChainClock = (): number => {
  const { data: block } = useBlock({ watch: true, chainId: DEFAULT_NETWORK.chainId });
  const anchor = useRef<{ chain: number; wall: number } | null>(null);
  const [nowSec, setNowSec] = useState<number>(() =>
    Math.floor(Date.now() / 1000),
  );

  useEffect(() => {
    if (!block) return;
    const chain = Number(block.timestamp);
    const wall = Date.now() / 1000;
    const estimate = anchor.current
      ? anchor.current.chain + (wall - anchor.current.wall)
      : -Infinity;
    if (chain >= estimate) {
      anchor.current = { chain, wall };
    }
  }, [block?.timestamp]);

  useEffect(() => {
    const compute = (): number => {
      const a = anchor.current;
      return a
        ? Math.floor(a.chain + (Date.now() / 1000 - a.wall))
        : Math.floor(Date.now() / 1000);
    };
    setNowSec(compute());
    const iv = setInterval(() => setNowSec(compute()), 1000);
    return () => clearInterval(iv);
  }, []);

  return nowSec;
};

export default useChainClock;
