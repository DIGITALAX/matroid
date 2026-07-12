import { useContext } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { useModal } from "connectkit";
import { waitForTransactionReceipt } from "wagmi/actions";
import { config, ModalContext } from "@/app/providers";
import { DEFAULT_NETWORK } from "@/app/lib/constants";

export const useTx = () => {
  const context = useContext(ModalContext);
  const { isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { setOpen } = useModal();

  const track = async (
    label: string,
    fn: () => Promise<`0x${string}`>,
  ): Promise<boolean> => {
    if (!isConnected) {
      setOpen(true);
      return false;
    }
    if (chainId !== DEFAULT_NETWORK.chainId && switchChainAsync) {
      try {
        await switchChainAsync({ chainId: DEFAULT_NETWORK.chainId });
      } catch (err: any) {
        console.log("chain switch failed", err);
        context?.setTxModal({
          open: true,
          status: "error",
          label,
          message: err?.shortMessage || err?.message,
        });
        return false;
      }
    }
    context?.setTxModal({ open: true, status: "wallet", label });
    try {
      const hash = await fn();
      context?.setTxModal({ open: true, status: "pending", label, hash });
      const receipt = await waitForTransactionReceipt(config, { hash });
      if (receipt.status === "reverted") {
        context?.setTxModal({ open: true, status: "error", label, hash, message: "reverted" });
        return false;
      }
      context?.setTxModal({ open: true, status: "success", label, hash });
      return true;
    } catch (err: any) {
      console.log("tx failed", err);
      const raw: string = err?.shortMessage || err?.message || "";
      const message = raw.includes("0x3c21f90f") ? "txEpochOpen" : raw;
      context?.setTxModal({
        open: true,
        status: "error",
        label,
        message,
      });
      return false;
    }
  };

  const trackAnon = async (
    label: string,
    fn: () => Promise<`0x${string}`>,
  ): Promise<boolean> => {
    context?.setTxModal({ open: true, status: "pending", label });
    try {
      const hash = await fn();
      context?.setTxModal({ open: true, status: "pending", label, hash });
      const receipt = await waitForTransactionReceipt(config, {
        hash,
        chainId: DEFAULT_NETWORK.chainId as never,
      });
      if (receipt.status === "reverted") {
        context?.setTxModal({ open: true, status: "error", label, hash, message: "reverted" });
        return false;
      }
      context?.setTxModal({ open: true, status: "success", label, hash });
      return true;
    } catch (err: any) {
      console.log("anon tx failed", err);
      context?.setTxModal({
        open: true,
        status: "error",
        label,
        message: err?.shortMessage || err?.message,
      });
      return false;
    }
  };

  return { track, trackAnon, setTx: context?.setTxModal };
};
