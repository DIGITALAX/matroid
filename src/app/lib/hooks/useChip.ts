import { useEffect, useState } from "react";
import { ensureIdentity, getIdentity, commitmentOf } from "@/app/lib/zk/identity";
import { toHex32 } from "@/app/lib/zk/poseidon";

export const useChip = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [commitment, setCommitment] = useState<`0x${string}` | undefined>(undefined);

  useEffect(() => {
    const id = getIdentity();
    if (id) {
      setCommitment(toHex32(commitmentOf(id)));
      setConnected(true);
    }
  }, []);

  const connect = (): void => {
    console.log("chip.connect: dev software identity (mock, shared with dx.computer)");
    const id = ensureIdentity();
    setCommitment(toHex32(commitmentOf(id)));
    setConnected(true);
  };

  return { connected, commitment, connect };
};
