"use client";

import { FunctionComponent, JSX, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { formatUnits } from "viem";
import { formatDuration } from "@/app/lib/format/time";
import Caja from "@/app/components/Create/modules/Caja";
import ActionButton from "@/app/components/Common/modules/ActionButton";
import EnrolModal from "@/app/components/Common/modules/EnrolModal";
import { useGovernance } from "@/app/lib/hooks/useGovernance";
import { useAnonGovernance } from "@/app/lib/hooks/useAnonGovernance";
import { useChip } from "@/app/lib/hooks/useChip";
import { useIdentity } from "@/app/lib/hooks/useIdentity";
import { useBalanceTree } from "@/app/lib/hooks/useBalanceTree";
import { useChainClock } from "@/app/lib/hooks/useChainClock";

const formatLeft = (secs: number): string => {
  const s = Math.max(0, secs);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${r}s`;
  return `${m}m ${r}s`;
};

const GovernEntry: FunctionComponent<{ dict: any }> = ({ dict }): JSX.Element => {
  const path = usePathname();
  const g = useGovernance();
  const ag = useAnonGovernance();
  const chip = useChip();
  const identity = useIdentity(chip.commitment);
  const bt = useBalanceTree();
  const nowSec = useChainClock();

  const [mode, setMode] = useState<"public" | "anonymous">("public");
  const [base, setBase] = useState<string>("");
  const [per, setPer] = useState<string>("");
  const [dur, setDur] = useState<string>("");
  const [amt, setAmt] = useState<{ [k: number]: string }>({});
  const [confirm, setConfirm] = useState<{ id: number; choice: 0 | 1 } | null>(
    null,
  );
  const [enrolOpen, setEnrolOpen] = useState<boolean>(false);

  const anon = mode === "anonymous";

  const isNum = (v: string): boolean =>
    v.trim() !== "" && !isNaN(Number(v)) && Number(v) >= 0;
  const canPropose = isNum(base) && isNum(per);
  const canPublicVote = (id: number): boolean =>
    isNum(amt[id] ?? "") && Number(amt[id]) > 0;

  useEffect(() => {
    if (chip.connected) ag.loadMyVotes();
  }, [chip.connected]);

  const seg = (active: boolean): string =>
    `relative flex px-4 py-1 border-2 border-black cursor-pointer text-xs font-digiB uppercase tracking-[0.12em] ${
      active ? "bg-yell text-black" : "bg-dullY text-black/50"
    }`;

  const input =
    "relative w-full flex border-2 border-black bg-white/80 px-2 py-1 text-sm text-black font-earl focus:outline-none";

  const needsEnrol = anon && !identity.enrolled;

  const doPropose = async (): Promise<void> => {
    if (needsEnrol) {
      setEnrolOpen(true);
      return;
    }
    const ok = anon
      ? await ag.propose(base, per, dur)
      : await g.propose(base, per, dur);
    if (ok) {
      setBase("");
      setPer("");
      setDur("");
    }
  };

  const startVote = (id: number, choice: 0 | 1): void => {
    if (needsEnrol) {
      setEnrolOpen(true);
      return;
    }
    setConfirm({ id, choice });
  };

  const publicVote = async (id: number, inFavor: boolean): Promise<void> => {
    const ok = await g.vote(BigInt(id), inFavor, amt[id] ?? "");
    if (ok) setAmt((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <Caja title={`*${dict?.govern}*`}>
      <div
        className="relative w-full overflow-y-scroll h-[20rem] flex flex-col gap-5 p-2 font-earl text-black"
        dir={path.includes("/ar") ? "rtl" : "ltr"}
      >
        <div className="relative w-full flex flex-col gap-2">
          <span className="relative flex text-[10px] uppercase tracking-[0.2em] opacity-60">
            {dict?.visibility}
          </span>
          <div className="relative w-full flex flex-row gap-2">
            <button onClick={() => setMode("public")} className={seg(!anon)}>
              {dict?.visibilityPublic}
            </button>
            <button
              onClick={() => {
                setMode("anonymous");
                if (!identity.enrolled) setEnrolOpen(true);
              }}
              className={seg(anon)}
            >
              {dict?.visibilityAnonymous}
            </button>
          </div>
          <span className="relative flex text-[10px] leading-relaxed opacity-70">
            {anon ? dict?.anonHint : dict?.publicHint}
          </span>
          {anon && !identity.enrolled ? (
            <div className="relative w-full flex flex-col gap-1 border-2 border-black bg-yell p-2">
              <span className="relative flex text-[11px] font-digiB uppercase">
                {dict?.enrolNeeded}
              </span>
              <ActionButton
                size="sm"
                showIcon={false}
                label={dict?.enrolOpen}
                onClick={() => setEnrolOpen(true)}
              />
            </div>
          ) : anon ? (
            <div className="relative w-full flex flex-col gap-2 border-2 border-black bg-white/60 p-2">
              <span className="relative flex text-[11px] text-green-700">
                ✓ {dict?.enrolDone}
              </span>
              <span className="relative flex text-[10px] leading-relaxed opacity-70">
                {dict?.enrolBalanceInfo}
              </span>
              <ActionButton
                size="sm"
                showIcon={false}
                label={dict?.registerBalance}
                disabled={!bt.ready}
                loading={bt.isPending}
                onClick={bt.register}
              />
            </div>
          ) : null}
        </div>

        <div className="relative w-full flex flex-col gap-2 border-2 border-black bg-white/60 p-3">
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
            disabled={
              !canPropose || (anon ? !ag.ready || needsEnrol : !g.ready)
            }
            loading={anon ? ag.isPending : g.isPending}
            onClick={doPropose}
          />
        </div>

        <div className="relative w-full flex flex-col gap-2">
          <span className="relative flex font-digiB uppercase text-sm">
            {dict?.visibilityAnonymous} · {dict?.proposals} ({ag.count})
          </span>
          {renderAnon()}
        </div>

        <div className="relative w-full flex flex-col gap-2">
          <span className="relative flex font-digiB uppercase text-sm">
            {dict?.visibilityPublic} · {dict?.proposals} ({g.count})
          </span>
          {renderPublic()}
        </div>
      </div>

      <EnrolModal
        dict={dict}
        open={enrolOpen}
        onClose={() => setEnrolOpen(false)}
      />
    </Caja>
  );

  function emptyRow(): JSX.Element {
    return (
      <span className="relative flex text-xs opacity-60">
        {dict?.noProposals}
      </span>
    );
  }

  function loadingRow(): JSX.Element {
    return (
      <span className="relative flex text-xs opacity-60">
        {dict?.loadingProposals}
      </span>
    );
  }

  function renderPublic(): JSX.Element | JSX.Element[] {
    if (g.count === 0) return emptyRow();
    if (!g.proposals.length) return loadingRow();
    return g.proposals.map((row) => {
      const d = row.data as readonly bigint[] | undefined;
      if (!d)
        return (
          <div
            key={row.id}
            className="relative w-full flex flex-row gap-2 border-2 border-black bg-white/60 p-2 text-xs opacity-60"
          >
            <span>#{row.id}</span>
            <span>{dict?.loadingProposals}</span>
          </div>
        );
      const executed = d[6] as unknown as boolean;
      return (
        <div
          key={row.id}
          className="relative w-full flex flex-col gap-1 border-2 border-black bg-white/60 p-2 text-xs"
        >
          <div className="relative flex flex-row gap-2">
            <span className="opacity-60">#{row.id}</span>
            <span>{executed ? dict?.executed : dict?.open}</span>
          </div>
          <div className="relative flex">
            {dict?.baseLabel} {formatUnits(d[0], 18)} MONA ·{" "}
            {dict?.perProjectLabel} {formatUnits(d[1], 18)} MONA
          </div>
          <div className="relative flex">
            {dict?.yesLabel} {formatUnits(d[4], 18)} · {dict?.noLabel}{" "}
            {formatUnits(d[5], 18)}
          </div>
          <div className="relative flex flex-row flex-wrap gap-2 items-center">
            <input
              value={amt[row.id] ?? ""}
              onChange={(e) => setAmt({ ...amt, [row.id]: e.target.value })}
              placeholder={dict?.votePlaceholder}
              className="relative flex w-24 border-2 border-black bg-white/80 px-2 py-0.5 text-black"
            />
            <ActionButton
              size="sm"
              showIcon={false}
              label={dict?.voteFor}
              disabled={!g.ready || !canPublicVote(row.id)}
              loading={g.isPending}
              onClick={() => publicVote(row.id, true)}
            />
            <ActionButton
              size="sm"
              showIcon={false}
              label={dict?.voteAgainst}
              disabled={!g.ready || !canPublicVote(row.id)}
              loading={g.isPending}
              onClick={() => publicVote(row.id, false)}
            />
            <ActionButton
              size="sm"
              showIcon={false}
              label={dict?.execute}
              disabled={!g.ready}
              loading={g.isPending}
              onClick={() => g.execute(BigInt(row.id))}
            />
            <ActionButton
              size="sm"
              showIcon={false}
              label={dict?.withdraw}
              disabled={!g.ready}
              loading={g.isPending}
              onClick={() => g.withdraw(BigInt(row.id))}
            />
          </div>
        </div>
      );
    });
  }

  function renderAnon(): JSX.Element | JSX.Element[] {
    if (ag.count === 0) return emptyRow();
    if (!ag.proposals.length)
      return (
        <span className="relative flex text-xs opacity-60">
          {dict?.loadingProposals}
        </span>
      );
    return ag.proposals.map((row) => {
      const d = row.data as readonly unknown[] | undefined;
      if (!d)
        return (
          <div
            key={row.id}
            className="relative w-full flex flex-row gap-2 border-2 border-black bg-white/60 p-2 text-xs opacity-60"
          >
            <span>#{row.id}</span>
            <span>{dict?.loadingProposals}</span>
          </div>
        );
      const baseBudget = d[6] as bigint;
      const perBudget = d[7] as bigint;
      const newDur = d[8] as bigint;
      const executed = d[5] as boolean;
      const start = Number(d[2] as bigint);
      const end = Number(d[3] as bigint);
      const openNow = !executed && nowSec < end;
      const myVote = ag.myVotes[row.id];
      const t = ag.tallies[row.id] ?? { yes: 0n, no: 0n };
      return (
        <div
          key={row.id}
          className="relative w-full flex flex-col gap-1 border-2 border-black bg-white/60 p-2 text-xs"
        >
          <div className="relative flex flex-row flex-wrap gap-2">
            <span className="opacity-60">#{row.id}</span>
            <span>
              {executed
                ? dict?.executed
                : openNow
                  ? dict?.open
                  : dict?.votingEnded}
            </span>
            {openNow ? (
              <span className="opacity-70">
                {dict?.timeLeft} {formatLeft(end - nowSec)}
              </span>
            ) : null}
          </div>
          <div className="relative flex">
            {dict?.baseLabel} {formatUnits(baseBudget, 18)} MONA ·{" "}
            {dict?.perProjectLabel} {formatUnits(perBudget, 18)} MONA
          </div>
          <div className="relative flex">
            {dict?.newDurationLabel}{" "}
            {newDur > 0n ? formatDuration(newDur.toString()) : dict?.unchanged}
          </div>
          <div className="relative flex opacity-70">
            {dict?.yesLabel} {t.yes.toString()} · {dict?.noLabel}{" "}
            {t.no.toString()}
          </div>
          {myVote !== undefined ? (
            <span className="relative flex opacity-70">
              {dict?.alreadyVoted}{" "}
              {myVote === 1 ? dict?.voteFor : dict?.voteAgainst}
            </span>
          ) : null}
          {confirm?.id === row.id ? (
            <div className="relative flex flex-row flex-wrap gap-2 items-center">
              <span>
                {dict?.confirmVote}{" "}
                {confirm.choice === 1 ? dict?.voteFor : dict?.voteAgainst}?
              </span>
              <ActionButton
                size="sm"
                showIcon={false}
                label={dict?.confirm}
                loading={ag.busy || ag.isPending}
                onClick={() => {
                  const c = confirm;
                  setConfirm(null);
                  if (c) ag.vote(BigInt(c.id), c.choice);
                }}
              />
              <ActionButton
                size="sm"
                showIcon={false}
                label={dict?.cancel}
                onClick={() => setConfirm(null)}
              />
            </div>
          ) : (
            <div className="relative flex flex-row flex-wrap gap-2 items-center">
              <ActionButton
                size="sm"
                showIcon={false}
                label={dict?.voteFor}
                disabled={!ag.ready || !openNow || myVote !== undefined}
                loading={ag.busy || ag.isPending}
                onClick={() => startVote(row.id, 1)}
              />
              <ActionButton
                size="sm"
                showIcon={false}
                label={dict?.voteAgainst}
                disabled={!ag.ready || !openNow || myVote !== undefined}
                loading={ag.busy || ag.isPending}
                onClick={() => startVote(row.id, 0)}
              />
              <ActionButton
                size="sm"
                showIcon={false}
                label={dict?.execute}
                disabled={!ag.ready || executed || nowSec < end}
                loading={ag.isPending}
                onClick={() => ag.execute(BigInt(row.id))}
              />
            </div>
          )}
        </div>
      );
    });
  }
};

export default GovernEntry;
