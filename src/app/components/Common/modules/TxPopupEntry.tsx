"use client";

import { useContext } from "react";
import { usePathname } from "next/navigation";
import { ModalContext } from "@/app/providers";
import ActionButton from "./ActionButton";

export default function TxPopupEntry({ dict }: { dict: any }) {
  const context = useContext(ModalContext);
  const path = usePathname();
  const tx = context?.txModal;

  if (!tx?.open) return <></>;

  const close = () =>
    context?.setTxModal((prev) => ({ ...prev, open: false }));

  const busy =
    tx.status === "wallet" ||
    tx.status === "pending" ||
    tx.status === "proving";
  const title = dict?.[tx.label || ""] || tx.label || "";
  const statusText =
    tx.status === "proving"
      ? dict?.txProving
      : tx.status === "wallet"
        ? dict?.txWallet
        : tx.status === "pending"
          ? dict?.txPending
          : tx.status === "success"
            ? dict?.txSuccess
            : dict?.txError;
  const message = tx.message ? dict?.[tx.message] || tx.message : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 p-4"
      dir={path.includes("/ar") ? "rtl" : "ltr"}
      onClick={busy ? undefined : close}
    >
      <div
        className="relative w-80 max-w-full h-fit flex flex-col border-4 border-black bg-white p-1 gap-0 font-earl text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-fit flex flex-row justify-center bg-black text-white font-digiB uppercase text-sm py-1 px-2">
          {title}
        </div>
        <div className="relative w-full h-fit flex flex-col items-center gap-3 bg-dullY p-4">
          {busy && (
            <div className="relative w-4 h-4 flex border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          )}
          <div
            className={`relative w-full h-fit flex flex-row justify-center text-xs ${
              tx.status === "success"
                ? "text-black"
                : tx.status === "error"
                  ? "text-red-600"
                  : "opacity-80"
            }`}
          >
            {statusText}
          </div>
          {tx.status === "error" && message && (
            <div className="relative w-full h-fit flex flex-row justify-center text-xs opacity-60 break-all max-h-24 overflow-y-scroll">
              {message}
            </div>
          )}
          {tx.hash && (
            <div className="relative w-full h-fit flex flex-row justify-center text-[10px] opacity-50 break-all">
              {tx.hash}
            </div>
          )}
          {!busy && (
            <ActionButton
              showIcon={false}
              connect={true}
              label={dict?.txClose}
              onClick={close}
            />
          )}
        </div>
      </div>
    </div>
  );
}
