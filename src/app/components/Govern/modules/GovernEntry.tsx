"use client";

import { FunctionComponent, JSX, useState } from "react";
import { usePathname } from "next/navigation";
import { formatUnits } from "viem";
import Caja from "@/app/components/Create/modules/Caja";
import ActionButton from "@/app/components/Common/modules/ActionButton";
import { useGovernance } from "@/app/lib/hooks/useGovernance";
import { useAnonGovernance } from "@/app/lib/hooks/useAnonGovernance";
import { useChip } from "@/app/lib/hooks/useChip";
import { useIdentity } from "@/app/lib/hooks/useIdentity";

const GovernEntry: FunctionComponent<{ dict: any }> = ({ dict }): JSX.Element => {
  const path = usePathname();
  const g = useGovernance();
  const ag = useAnonGovernance();
  const chip = useChip();
  const identity = useIdentity(chip.commitment);
  const [base, setBase] = useState<string>("");
  const [per, setPer] = useState<string>("");
  const [dur, setDur] = useState<string>("");
  const [amt, setAmt] = useState<{ [k: number]: string }>({});
  const [aBase, setABase] = useState<string>("");
  const [aPer, setAPer] = useState<string>("");
  const [aDur, setADur] = useState<string>("");

  const input =
    "relative w-full flex border-2 border-black bg-white/80 px-2 py-1 text-sm text-black font-earl focus:outline-none";

  return (
    <Caja title={`*${dict?.govern}*`}>
      <div
        className="relative w-full overflow-y-scroll h-[20rem] flex flex-col gap-6 p-2 font-earl text-black"
        dir={path.includes("/ar") ? "rtl" : "ltr"}
      >
        <span className="relative flex text-xs opacity-70">
          {g.ready ? dict?.governReady : dict?.governNotReady}
        </span>

        <div className="relative flex flex-col gap-2 border-2 border-black bg-white/60 p-3">
          <span className="relative flex font-digiB uppercase text-sm">
            {dict?.propose}
          </span>
          <input
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder={dict?.baseBudgetPlaceholder}
            className={input}
          />
          <input
            value={per}
            onChange={(e) => setPer(e.target.value)}
            placeholder={dict?.perProjectBudgetPlaceholder}
            className={input}
          />
          <input
            value={dur}
            onChange={(e) => setDur(e.target.value)}
            placeholder={dict?.newDurationPlaceholder}
            className={input}
          />
          <ActionButton
            size="sm"
            label={dict?.propose}
            disabled={!g.ready || g.isPending}
            onClick={() => g.propose(base, per, dur)}
          />
        </div>

        <div className="relative flex flex-col gap-2">
          <span className="relative flex font-digiB uppercase text-sm">
            {dict?.proposals} ({g.count})
          </span>
          {g.proposals.length ? (
            g.proposals.map((row) => {
              const d = row.data as readonly bigint[] | undefined;
              if (!d) return null;
              return (
                <div
                  key={row.id}
                  className="relative flex flex-col gap-1 border-2 border-black bg-white/60 p-2 text-xs"
                >
                  <div className="relative flex flex-row gap-2">
                    <span className="opacity-70">#{row.id}</span>
                    <span>
                      {(d[6] as unknown as boolean) ? dict?.executed : dict?.open}
                    </span>
                  </div>
                  <div className="relative flex">
                    {dict?.baseLabel} {formatUnits(d[0], 18)} ·{" "}
                    {dict?.perProjectLabel} {formatUnits(d[1], 18)} MONA
                  </div>
                  <div className="relative flex">
                    {dict?.yesLabel} {formatUnits(d[4], 18)} · {dict?.noLabel}{" "}
                    {formatUnits(d[5], 18)}
                  </div>
                  <div className="relative flex flex-row flex-wrap gap-2 items-center">
                    <input
                      value={amt[row.id] ?? ""}
                      onChange={(e) =>
                        setAmt({ ...amt, [row.id]: e.target.value })
                      }
                      placeholder={dict?.votePlaceholder}
                      className="relative flex w-24 border-2 border-black bg-white/80 px-2 py-0.5 text-black"
                    />
                    <ActionButton
                      size="sm"
                      showIcon={false}
                      label={dict?.voteFor}
                      disabled={!g.ready || g.isPending}
                      onClick={() => g.vote(BigInt(row.id), true, amt[row.id] ?? "")}
                    />
                    <ActionButton
                      size="sm"
                      showIcon={false}
                      label={dict?.voteAgainst}
                      disabled={!g.ready || g.isPending}
                      onClick={() =>
                        g.vote(BigInt(row.id), false, amt[row.id] ?? "")
                      }
                    />
                    <ActionButton
                      size="sm"
                      showIcon={false}
                      label={dict?.execute }
                      disabled={!g.ready || g.isPending}
                      onClick={() => g.execute(BigInt(row.id))}
                    />
                    <ActionButton
                      size="sm"
                      showIcon={false}
                      label={dict?.withdraw}
                      disabled={!g.ready || g.isPending}
                      onClick={() => g.withdraw(BigInt(row.id))}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <span className="relative flex text-xs opacity-70">
              {dict?.noProposals}
            </span>
          )}
        </div>

        <div className="relative flex flex-col gap-2 border-2 border-black bg-white/60 p-3">
          <span className="relative flex font-digiB uppercase text-sm">
            {dict?.anonGovern}
          </span>
          <span className="relative flex text-xs opacity-70">
            {ag.ready ? dict?.anonGovernReady : dict?.anonGovernNotReady}
          </span>
          {!chip.connected ? (
            <ActionButton
              size="sm"
              label={dict?.connectChip}
              disabled={false}
              onClick={chip.connect}
            />
          ) : !identity.enrolled ? (
            <ActionButton
              size="sm"
              label={dict?.enrolChip}
              disabled={!identity.ready || identity.isPending}
              onClick={async () => {
                console.log(
                  "enrol: needs the enrollment proof flow, not wired yet",
                );
              }}
            />
          ) : (
            <span className="relative flex text-xs opacity-70">
              {dict?.chipEnrolled}
            </span>
          )}

          <input
            value={aBase}
            onChange={(e) => setABase(e.target.value)}
            placeholder={dict?.baseBudgetPlaceholder}
            className={input}
          />
          <input
            value={aPer}
            onChange={(e) => setAPer(e.target.value)}
            placeholder={dict?.perProjectBudgetPlaceholder}
            className={input}
          />
          <input
            value={aDur}
            onChange={(e) => setADur(e.target.value)}
            placeholder={dict?.newDurationPlaceholder}
            className={input}
          />
          <ActionButton
            size="sm"
            label={dict?.propose}
            disabled={!ag.ready || ag.isPending}
            onClick={() => ag.propose(aBase, aPer, aDur)}
          />

          <span className="relative flex font-digiB uppercase text-sm">
            {dict?.proposals} ({ag.count})
          </span>
          {ag.proposals.length ? (
            ag.proposals.map((row) => {
              const d = row.data as readonly unknown[] | undefined;
              if (!d) return null;
              const baseBudget = d[6] as bigint;
              const perBudget = d[7] as bigint;
              const executed = d[5] as boolean;
              return (
                <div
                  key={row.id}
                  className="relative flex flex-col gap-1 border-2 border-black bg-white/60 p-2 text-xs"
                >
                  <div className="relative flex flex-row gap-2">
                    <span className="opacity-70">#{row.id}</span>
                    <span>{executed ? dict?.executed : dict?.open}</span>
                  </div>
                  <div className="relative flex">
                    {dict?.baseLabel} {formatUnits(baseBudget, 18)} ·{" "}
                    {dict?.perProjectLabel} {formatUnits(perBudget, 18)} MONA
                  </div>
                  <div className="relative flex flex-row flex-wrap gap-2 items-center">
                    <ActionButton
                      size="sm"
                      showIcon={false}
                      label={dict?.voteFor}
                      disabled={!ag.ready || ag.isPending || !identity.enrolled}
                      onClick={() => ag.vote(BigInt(row.id), 1)}
                    />
                    <ActionButton
                      size="sm"
                      showIcon={false}
                      label={dict?.voteAgainst}
                      disabled={!ag.ready || ag.isPending || !identity.enrolled}
                      onClick={() => ag.vote(BigInt(row.id), 0)}
                    />
                    <ActionButton
                      size="sm"
                      showIcon={false}
                      label={dict?.execute}
                      disabled={!ag.ready || ag.isPending}
                      onClick={() => ag.execute(BigInt(row.id))}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <span className="relative flex text-xs opacity-70">
              {dict?.noProposals}
            </span>
          )}
        </div>
      </div>
    </Caja>
  );
};

export default GovernEntry;
