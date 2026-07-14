"use client";

import { FunctionComponent, JSX } from "react";
import { usePathname } from "next/navigation";
import Frame from "@/app/components/Create/modules/Frame";
import ActionButton from "./ActionButton";
import { useChip } from "@/app/lib/hooks/useChip";
import { useIdentity } from "@/app/lib/hooks/useIdentity";

const EnrolModal: FunctionComponent<{
  dict: any;
  open: boolean;
  onClose: () => void;
}> = ({ dict, open, onClose }): JSX.Element | null => {
  const path = usePathname();
  const chip = useChip();
  const identity = useIdentity(chip.commitment);

  if (!open) return null;

  const enrol = async (): Promise<void> => {
    const data = await chip.enrollData();
    if (!data) return;
    await identity.enroll(
      data.proof,
      data.freshBind,
      data.enrollNullifier,
      data.commitment,
      data.siblings,
    );
    identity.refetch();
  };

  const step = (n: string, text: string, done: boolean): JSX.Element => (
    <div className="relative w-full flex flex-row items-start gap-2">
      <span
        className={`relative flex items-center justify-center w-5 h-5 shrink-0 border-2 border-black text-[10px] font-digiB ${
          done ? "bg-green-500 text-white" : "bg-yell text-black"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <span className="relative flex flex-1 text-xs leading-relaxed">
        {text}
      </span>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-row items-center justify-center bg-black/70 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md flex flex-col bg-gradient-to-r from-offBlack via-black/70 to-offBlack rounded-lg p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Frame title={`*${dict?.enrolTitle}*`}>
          <div
            className="relative w-full h-fit flex flex-col gap-4 font-earl text-black"
            dir={path?.includes("/ar") ? "rtl" : "ltr"}
          >
            <span className="relative w-full flex text-xs leading-relaxed">
              {dict?.enrolInfo}
            </span>

            <div className="relative w-full flex flex-col gap-3 border-2 border-black bg-white/60 p-3">
              {step("1", dict?.enrolStepConnect, chip.connected)}
              {step("2", dict?.enrolStepEnrol, identity.enrolled)}
            </div>

            {!chip.connected ? (
              <ActionButton
                size="sm"
                showIcon={false}
                label={dict?.connectChip}
                loading={chip.busy}
                onClick={chip.connect}
              />
            ) : !identity.enrolled ? (
              <div className="relative w-full flex flex-col gap-1">
                <span className="relative flex text-[10px] break-all opacity-70">
                  {chip.commitment}
                </span>
                <ActionButton
                  size="sm"
                  showIcon={false}
                  label={dict?.enrolChip}
                  disabled={!identity.ready}
                  loading={chip.busy || identity.isPending}
                  onClick={enrol}
                />
              </div>
            ) : (
              <span className="relative flex text-[10px] text-green-700">
                ✓ {dict?.chipEnrolled}
              </span>
            )}

            <div className="relative w-full flex flex-row justify-end">
              <ActionButton
                size="sm"
                showIcon={false}
                label={dict?.done}
                onClick={onClose}
              />
            </div>
          </div>
        </Frame>
      </div>
    </div>
  );
};

export default EnrolModal;
