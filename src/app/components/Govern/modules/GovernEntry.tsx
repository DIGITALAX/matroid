"use client";

import { FunctionComponent, JSX, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useReadContract } from "wagmi";
import { formatUnits, parseUnits, type Abi } from "viem";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";
import { DEFAULT_NETWORK } from "@/app/lib/constants";
import { formatDuration } from "@/app/lib/format/time";
import Caja from "@/app/components/Create/modules/Caja";
import ActionButton from "@/app/components/Common/modules/ActionButton";
import EnrolModal from "@/app/components/Common/modules/EnrolModal";
import { useAnonGovernance } from "@/app/lib/hooks/useAnonGovernance";
import { useChip } from "@/app/lib/hooks/useChip";
import { useIdentity } from "@/app/lib/hooks/useIdentity";
import { usePool } from "@/app/lib/hooks/usePool";
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
  const ag = useAnonGovernance();
  const chip = useChip();
  const identity = useIdentity(chip.commitment);
  const pool = usePool();
  const [poolDeposits, setPoolDeposits] = useState<
    { bucket: number; denomination: bigint }[]
  >([]);
  const nowSec = useChainClock();

  const [base, setBase] = useState<string>("");
  const [per, setPer] = useState<string>("");
  const [dur, setDur] = useState<string>("");
  const [confirm, setConfirm] = useState<{ id: number; choice: 0 | 1 } | null>(
    null,
  );
  const [enrolOpen, setEnrolOpen] = useState<boolean>(false);
  const [bucketSel, setBucketSel] = useState<number>(0);
  const [pmProject, setPmProject] = useState<string>("");
  const [pmCap, setPmCap] = useState<string>("");
  const [propType, setPropType] = useState<"budget" | "bucket" | "cap" | "blacklist">("budget");

  const isAddr = (a: string): boolean => /^0x[0-9a-fA-F]{40}$/.test(a);

  const isNum = (v: string): boolean =>
    v.trim() !== "" && !isNaN(Number(v)) && Number(v) >= 0;
  const canPropose = isNum(base) && isNum(per);

  useEffect(() => {
    if (chip.connected) ag.loadMyVotes();
  }, [chip.connected]);

  useEffect(() => {
    if (chip.connected && identity.enrolled) {
      pool.deposits().then(setPoolDeposits);
    }
  }, [chip.connected, identity.enrolled, pool.activeBucket, pool.isPending]);

  const activeDeposited = poolDeposits.some(
    (d) => d.bucket === pool.activeBucket,
  );

  const addresses = useCoreAddresses();
  const anonGovAddr = addresses.MatroidAnonGovernance as `0x${string}`;
  const treasuryAddr = addresses.Treasury as `0x${string}`;
  const { data: windowRaw } = useReadContract({
    address: anonGovAddr,
    abi: getABI("MatroidAnonGovernance") as Abi,
    chainId: DEFAULT_NETWORK.chainId,
    functionName: "votingWindow",
    query: { enabled: ag.ready },
  });
  const { data: baseBudgetRaw } = useReadContract({
    address: treasuryAddr,
    abi: getABI("Treasury") as Abi,
    chainId: DEFAULT_NETWORK.chainId,
    functionName: "baseBudgetAmount",
    query: { enabled: isAddr(treasuryAddr) },
  });
  const { data: perBudgetRaw } = useReadContract({
    address: treasuryAddr,
    abi: getABI("Treasury") as Abi,
    chainId: DEFAULT_NETWORK.chainId,
    functionName: "perProjectBudget",
    query: { enabled: isAddr(treasuryAddr) },
  });
  const { data: quorumRaw } = useReadContract({
    address: anonGovAddr,
    abi: getABI("MatroidAnonGovernance") as Abi,
    chainId: DEFAULT_NETWORK.chainId,
    functionName: "quorumFloor",
    query: { enabled: ag.ready },
  });
  const windowText =
    typeof windowRaw === "bigint" ? formatDuration(windowRaw.toString()) : "—";
  const fmtMona = (v: unknown): string =>
    typeof v === "bigint" ? `${Number(formatUnits(v, 18)).toLocaleString()} MONA` : "—";

  const input =
    "relative w-full flex border-2 border-black bg-white/80 px-2 py-1 text-sm text-black font-earl focus:outline-none";

  const needsEnrol = !identity.enrolled;

  const doPropose = async (): Promise<void> => {
    if (needsEnrol) {
      setEnrolOpen(true);
      return;
    }
    const ok = await ag.propose(base, per, dur);
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

  return (
    <Caja title={`*${dict?.govern}*`}>
      <div
        className="relative w-full overflow-y-scroll h-[20rem] flex flex-col gap-5 p-2 font-earl text-black"
        dir={path.includes("/ar") ? "rtl" : "ltr"}
      >
        <div className="relative w-full flex flex-col gap-2">
          <span className="relative flex text-[10px] leading-relaxed opacity-70">
            {dict?.anonHint}
          </span>
          {!identity.enrolled ? (
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
          ) : (
            <div className="relative w-full flex flex-col gap-2 border-2 border-black bg-white/60 p-2">
              <span className="relative flex text-[11px] text-green-700">
                ✓ {dict?.enrolDone}
              </span>
            </div>
          )}
        </div>

        <div className="relative w-full flex flex-col gap-1 border-2 border-black bg-white/60 p-3">
          <span className="relative flex font-digiB uppercase text-sm">
            {dict?.currentValues}
          </span>
          <span className="relative flex text-[11px]">
            {dict?.currentBucket}: {pool.activeBucket}
            {pool.denomination > 0n
              ? ` · ${Number(formatUnits(pool.denomination, 18)).toLocaleString()} MONA`
              : ""}
          </span>
          <span className="relative flex text-[11px]">
            {dict?.votingTime}: {windowText}
          </span>
          <span className="relative flex text-[11px]">
            {dict?.currentQuorum}:{" "}
            {typeof quorumRaw === "bigint" ? quorumRaw.toString() : "—"}
          </span>
          <span className="relative flex text-[11px]">
            {dict?.baseLabel} {fmtMona(baseBudgetRaw)} · {dict?.perProjectLabel}{" "}
            {fmtMona(perBudgetRaw)}
          </span>
        </div>

        <div className="relative w-full flex flex-col gap-2 border-2 border-black bg-white/60 p-3">
          <span className="relative flex font-digiB uppercase text-sm">
            {dict?.propose}
          </span>

          {!needsEnrol && (
            <div className="relative w-full flex flex-col gap-1">
              <span className="relative flex text-[10px] uppercase tracking-[0.2em] opacity-60">
                {dict?.propType}
              </span>
              <div className="relative w-full flex flex-row gap-1 flex-wrap">
                {(
                  [
                    ["budget", dict?.propTypeBudget],
                    ["bucket", dict?.propTypeBucket],
                    ["cap", dict?.propTypeCap],
                    ["blacklist", dict?.propTypeBlacklist],
                  ] as const
                ).map(([k, lbl]) => (
                  <button
                    key={k}
                    onClick={() => setPropType(k)}
                    className={`relative flex px-2 py-1 border-2 border-black text-[10px] font-digiB uppercase ${
                      propType === k ? "bg-yell text-black" : "bg-dullY text-black/50"
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {propType === "budget" && (
            <>
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
                disabled={!canPropose || !ag.ready || needsEnrol}
                loading={ag.isPending}
                onClick={doPropose}
              />
            </>
          )}

          {propType === "bucket" && (
            <>
              <span className="relative flex text-[10px] leading-relaxed opacity-70">
                {dict?.bucketNote}
              </span>
              <select
                value={bucketSel}
                onChange={(e) => setBucketSel(Number(e.target.value))}
                className={input}
              >
                {Array.from({ length: 9 }, (_, i) => (
                  <option key={i} value={i}>
                    {i} · {["0.01", "0.1", "0.25", "0.5", "0.75", "1", "5", "7", "10"][i]} MONA
                  </option>
                ))}
              </select>
              <ActionButton
                size="sm"
                label={dict?.propose}
                disabled={!ag.ready}
                loading={ag.isPending}
                onClick={() => ag.proposeBucket(bucketSel)}
              />
            </>
          )}

          {propType === "cap" && (
            <>
              <span className="relative flex text-[10px] leading-relaxed opacity-70">
                {dict?.capNote}
              </span>
              <input
                value={pmProject}
                onChange={(e) => setPmProject(e.target.value)}
                placeholder={dict?.capProjectPlaceholder}
                className={input}
              />
              <input
                value={pmCap}
                onChange={(e) => setPmCap(e.target.value)}
                placeholder={dict?.capValuePlaceholder}
                className={input}
              />
              <ActionButton
                size="sm"
                label={dict?.propose}
                disabled={!ag.ready || !isAddr(pmProject) || !isNum(pmCap)}
                loading={ag.isPending}
                onClick={() =>
                  ag.proposeCap(pmProject as `0x${string}`, parseUnits(pmCap, 18))
                }
              />
            </>
          )}

          {propType === "blacklist" && (
            <>
              <span className="relative flex text-[10px] leading-relaxed opacity-70">
                {dict?.blacklistNote}
              </span>
              <input
                value={pmProject}
                onChange={(e) => setPmProject(e.target.value)}
                placeholder={dict?.capProjectPlaceholder}
                className={input}
              />
              <div className="relative w-full flex flex-row gap-2 flex-wrap">
                <ActionButton
                  size="sm"
                  label={dict?.blacklistBtn}
                  disabled={!ag.ready || !isAddr(pmProject)}
                  loading={ag.isPending}
                  onClick={() => ag.proposeBlacklist(pmProject as `0x${string}`, true)}
                />
                <ActionButton
                  size="sm"
                  label={dict?.unblacklistBtn}
                  disabled={!ag.ready || !isAddr(pmProject)}
                  loading={ag.isPending}
                  onClick={() => ag.proposeBlacklist(pmProject as `0x${string}`, false)}
                />
              </div>
            </>
          )}
        </div>

        {!needsEnrol ? (
          <div className="relative w-full flex flex-col gap-2 border-2 border-black bg-white/60 p-3">
            <span className="relative flex font-digiB uppercase text-sm">
              {dict?.poolTitle}
            </span>

            {poolDeposits.length > 0 && (
              <div className="relative w-full flex flex-col gap-2">
                {poolDeposits.map((d) => (
                  <div
                    key={d.bucket}
                    className="relative w-full flex flex-row items-center gap-2"
                  >
                    <span className="relative flex flex-1 text-[10px] text-green-700">
                      ✓ {dict?.poolDeposited} ·{" "}
                      {Number(formatUnits(d.denomination, 18)).toLocaleString()} MONA
                    </span>
                    <ActionButton
                      size="sm"
                      showIcon={false}
                      label={dict?.poolWithdraw}
                      disabled={!pool.ready}
                      loading={pool.isPending}
                      onClick={() => pool.withdraw(d.bucket)}
                    />
                  </div>
                ))}
              </div>
            )}

            {!activeDeposited && (
              <>
                <span className="relative flex text-[10px] leading-relaxed opacity-70">
                  {dict?.poolInfo}
                </span>
                {pool.denomination > 0n && (
                  <span className="relative flex text-[10px] opacity-70">
                    {dict?.poolDenomination}:{" "}
                    {Number(formatUnits(pool.denomination, 18)).toLocaleString()} MONA
                  </span>
                )}
                <ActionButton
                  size="sm"
                  showIcon={false}
                  label={dict?.poolDeposit}
                  disabled={!pool.ready}
                  loading={pool.isPending}
                  onClick={pool.deposit}
                />
              </>
            )}
          </div>
        ) : null}

        <div className="relative w-full flex flex-col gap-2">
          <span className="relative flex font-digiB uppercase text-sm">
            {dict?.proposals} ({ag.count})
          </span>
          {renderAnon()}
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
      const kind = Number(d[7] as number | bigint);
      const newBucket = Number(d[8] as number | bigint);
      const pmProject = d[9] as string;
      const pmFlag = d[10] as boolean;
      const pmValue = d[11] as bigint;
      const baseBudget = d[12] as bigint;
      const perBudget = d[13] as bigint;
      const newDur = d[14] as bigint;
      const executed = d[6] as boolean;
      const end = Number(d[4] as bigint);
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
          {kind === 0 ? (
            <>
              <div className="relative flex">
                {dict?.baseLabel} {formatUnits(baseBudget, 18)} MONA ·{" "}
                {dict?.perProjectLabel} {formatUnits(perBudget, 18)} MONA
              </div>
              <div className="relative flex">
                {dict?.newDurationLabel}{" "}
                {newDur > 0n ? formatDuration(newDur.toString()) : dict?.unchanged}
              </div>
            </>
          ) : kind === 1 ? (
            <div className="relative flex">
              {dict?.kindBucket}: {newBucket}
            </div>
          ) : kind === 2 ? (
            <div className="relative flex break-all">
              {dict?.kindPmCap}: {pmProject} → {formatUnits(pmValue, 18)} ETH
            </div>
          ) : kind === 3 ? (
            <div className="relative flex">
              {dict?.kindPmDefaultCap}: {formatUnits(pmValue, 18)} ETH
            </div>
          ) : kind === 4 ? (
            <div className="relative flex break-all">
              {dict?.kindPmRegister}: {pmProject} →{" "}
              {pmFlag ? dict?.pmOn : dict?.pmOff}
            </div>
          ) : (
            <div className="relative flex break-all">
              {dict?.kindPmBlacklist}: {pmProject} →{" "}
              {pmFlag ? dict?.pmBanned : dict?.pmUnbanned}
            </div>
          )}
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
          {executed ? null : confirm?.id === row.id ? (
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
              {openNow ? (
                <>
                  <ActionButton
                    size="sm"
                    showIcon={false}
                    label={dict?.voteFor}
                    disabled={!ag.ready || myVote !== undefined}
                    loading={ag.busy || ag.isPending}
                    onClick={() => startVote(row.id, 1)}
                  />
                  <ActionButton
                    size="sm"
                    showIcon={false}
                    label={dict?.voteAgainst}
                    disabled={!ag.ready || myVote !== undefined}
                    loading={ag.busy || ag.isPending}
                    onClick={() => startVote(row.id, 0)}
                  />
                </>
              ) : (
                <ActionButton
                  size="sm"
                  showIcon={false}
                  label={dict?.execute}
                  disabled={!ag.ready}
                  loading={ag.isPending}
                  onClick={() => ag.execute(BigInt(row.id))}
                />
              )}
            </div>
          )}
        </div>
      );
    });
  }
};

export default GovernEntry;
