"use client";

import { JSX } from "react";
import Caja from "../../Create/modules/Caja";
import { usePathname } from "next/navigation";
import { formatToken } from "@/app/lib/format/units";
import { formatDuration, formatTimestamp } from "@/app/lib/format/time";
import ActionButton from "@/app/components/Common/modules/ActionButton";
import { useManagePanel } from "@/app/lib/hooks/useManagePanel";

function ManageEntry({ dict }: { dict: any }): JSX.Element {
  const path = usePathname();
  const panel = useManagePanel();

  return (
    <Caja title={`*${dict?.manage}*`}>
      <div
        dir={path.includes("/ar") ? "rtl" : "ltr"}
        className="relative w-full overflow-y-scroll h-[20rem] text-center sm:p-6 font-earl"
      >
        <div className="w-full h-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="text-xl uppercase tracking-[0.2em]">
              {panel.activeTab === "global" && dict?.globalPanel}
              {panel.activeTab === "projects" && dict?.projects}
              {panel.activeTab === "epochs" && dict?.epochs}
              {panel.activeTab === "wallet" && dict?.wallet}
              {panel.activeTab === "actions" && dict?.actions}
            </div>
            <div className="text-xs opacity-70">
              {panel.activeTab === "global" && dict?.globalPanelDesc}
              {panel.activeTab === "projects" && dict?.projectsDesc}
              {panel.activeTab === "epochs" && dict?.epochsDesc}
              {panel.activeTab === "wallet" && dict?.walletDesc}
              {panel.activeTab === "actions" && dict?.actionsDesc}
            </div>
          </div>

          <div className="w-full flex flex-wrap items-center justify-center gap-2 text-xs uppercase tracking-[0.2em]">
            {[
              { key: "global", label: dict?.global },
              { key: "projects", label: dict?.projects },
              { key: "epochs", label: dict?.epochs },
              { key: "wallet", label: dict?.wallet },
              { key: "actions", label: dict?.actions },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => panel?.setActiveTab(tab?.key as any)}
                className={`px-3 py-1 border-2 border-black ${
                  panel?.activeTab === tab.key
                    ? "bg-yell text-black"
                    : "bg-dullY text-black/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {panel.subgraphEnabled && panel.loading && (
            <div className="text-sm opacity-70">{dict?.loadingGlobalState}</div>
          )}

          {panel.subgraphEnabled && !panel.loading && panel.error && (
            <div className="text-sm text-red-400">{panel.error}</div>
          )}

          {panel?.activeTab === "global" &&
            !panel?.loading &&
            !panel?.error &&
            panel?.globalPanel && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="border border-black/60 bg-dullY/80 p-4 rounded">
                  <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                    {dict?.distribution}
                  </div>
                  <div className="mt-3 text-sm space-y-2">
                    <div>
                      {dict?.targetTotal}:{" "}
                      {formatToken(panel?.globalPanel?.targetTotal)}
                    </div>
                    <div>
                      {dict?.totalDistributed}:{" "}
                      {formatToken(panel?.globalPanel?.totalDistributed)}
                    </div>
                    <div>
                      {dict?.targetDuration}:{" "}
                      {formatDuration(panel?.globalPanel?.targetDuration)}
                    </div>
                    <div>
                      {dict?.claimWindow}:{" "}
                      {formatDuration(panel?.globalPanel?.claimWindow)}
                    </div>
                    <div>
                      {dict?.distributionStart}:{" "}
                      {formatTimestamp(panel?.globalPanel?.distributionStart)}
                    </div>
                  </div>
                </div>

                <div className="border border-black/60 bg-dullY/80 p-4 rounded">
                  <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                    {dict?.budget}
                  </div>
                  <div className="mt-3 text-sm space-y-2">
                    <div>
                      {dict?.baseBudget}: {formatToken(panel?.globalPanel?.baseBudget)}
                    </div>
                    <div>
                      {dict?.perProjectBudget}:{" "}
                      {formatToken(panel?.globalPanel?.perProjectBudget)}
                    </div>
                    <div>
                      {dict?.totalDeposited}:{" "}
                      {formatToken(panel?.globalPanel?.totalDeposited)}
                    </div>
                  </div>
                </div>

                <div className="border border-black/60 bg-dullY/80 p-4 rounded">
                  <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                    {dict?.globalPool}
                  </div>
                  <div className="mt-3 text-sm space-y-2">
                    <div>
                      {dict?.totalStaked}:{" "}
                      {formatToken(panel?.globalPanel?.totalStaked)}
                    </div>
                    <div>
                      {dict?.rewardNotified}:{" "}
                      {formatToken(panel?.globalPanel?.rewardNotifiedTotal)}
                    </div>
                    <div>
                      {dict?.stakerCount}: {panel?.globalPanel?.stakerCount ?? "-"}
                    </div>
                  </div>
                </div>

                <div className="border border-black/60 bg-dullY/80 p-4 rounded">
                  <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                    {dict?.system}
                  </div>
                  <div className="mt-3 text-xs space-y-2 break-all">
                    <div
                      className="cursor-pointer hover:opacity-80 underline"
                      onClick={() =>
                        panel?.openAddress(panel?.globalPanel?.mona)
                      }
                    >
                      {dict?.mona}: {panel?.globalPanel?.mona || "-"}
                    </div>
                    <div
                      className="cursor-pointer hover:opacity-80 underline"
                      onClick={() =>
                        panel?.openAddress(panel?.globalPanel?.registry)
                      }
                    >
                      {dict?.registry}: {panel?.globalPanel?.registry || "-"}
                    </div>
                    <div
                      className="cursor-pointer hover:opacity-80 underline"
                      onClick={() =>
                        panel?.openAddress(panel?.globalPanel?.scorer)
                      }
                    >
                      {dict?.scorer}: {panel?.globalPanel?.scorer || "-"}
                    </div>
                    <div
                      className="cursor-pointer hover:opacity-80 underline"
                      onClick={() =>
                        panel?.openAddress(panel?.globalPanel?.globalPool)
                      }
                    >
                      {dict?.globalPool}: {panel?.globalPanel?.globalPool || "-"}
                    </div>
                    <div
                      className="cursor-pointer hover:opacity-80 underline"
                      onClick={() =>
                        panel?.openAddress(panel?.globalPanel?.slashingContract)
                      }
                    >
                      {dict?.slashing}: {panel?.globalPanel?.slashingContract || "-"}
                    </div>
                  </div>
                </div>

                <div className="border border-black/60 bg-dullY/80 p-4 rounded md:col-span-2">
                  <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                    {dict?.coverage}
                  </div>
                  <div className="mt-3 text-sm space-y-2">
                    <div>
                      {dict?.projectsIndexed}: {panel?.stats?.projectCount ?? "-"}
                    </div>
                    <div>{dict?.epochsIndexed}: {panel?.stats?.epochCount ?? "-"}</div>
                  </div>
                </div>
              </div>
            )}

          {panel?.activeTab === "global" &&
            !panel?.loading &&
            !panel?.error &&
            !panel?.globalPanel && (
              <div className="text-sm opacity-70">{dict?.noGlobalData}</div>
            )}

          {panel?.activeTab === "projects" && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 text-left">
              <div className="border border-black/60 bg-dullY/80 rounded p-4">
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {dict?.projects}
                </div>
                <div className="mt-3 flex flex-col gap-2 max-h-[14rem] overflow-y-auto">
                  {panel?.projectsLoading && (
                    <div className="text-sm opacity-70">
                      {dict?.loadingProjects}
                    </div>
                  )}
                  {!panel?.projectsLoading && panel?.projectsError && (
                    <div className="text-sm text-red-400">
                      {panel?.projectsError}
                    </div>
                  )}
                  {!panel?.projectsLoading &&
                    !panel?.projectsError &&
                    panel?.projects.length === 0 && (
                      <div className="text-sm opacity-70">
                        {dict?.noProjectsFound}
                      </div>
                    )}
                  {!panel?.projectsLoading &&
                    !panel?.projectsError &&
                    panel?.projects.map((project) => {
                      const title = project.metadata?.title || dict?.untitled;
                      const active = project.id === panel?.selectedProject?.id;
                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() =>
                            panel?.setSelectedProjectId(project.id)
                          }
                          className={`w-full text-left px-3 py-2 border-2 border-black ${
                            active ? "bg-yell" : "bg-comp"
                          }`}
                        >
                          <div className="text-sm font-digiB uppercase">
                            {title}
                          </div>
                          <div className="text-[10px] opacity-70 break-all">
                            {project.id}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
              <div className="border border-black/60 bg-dullY/80 rounded p-4">
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {dict?.projectDetail}
                </div>
                {panel?.selectedProject ? (
                  <div className="mt-3 flex flex-col gap-3 text-sm">
                    <div className="text-lg font-digiB uppercase">
                      {panel?.selectedProject.metadata?.title || dict?.untitled}
                    </div>
                    {panel?.selectedProject.metadata?.description && (
                      <div className="text-xs opacity-80">
                        {panel?.selectedProject.metadata?.description}
                      </div>
                    )}
                    <div
                      className="text-xs underline cursor-pointer"
                      onClick={() =>
                        panel?.openAddress(panel?.selectedProject?.id)
                      }
                    >
                      {panel?.selectedProject.id}
                    </div>
                    <div className="text-xs space-y-2">
                      <div>
                        {dict?.registered}:{" "}
                        {formatTimestamp(panel?.selectedProject.registeredAt)}
                      </div>
                      <div>
                        {dict?.monaIn}: {formatToken(panel?.selectedProject.monaIn)}
                      </div>
                      <div>
                        {dict?.monaOut}: {formatToken(panel?.selectedProject.monaOut)}
                      </div>
                      <div>
                        {dict?.txCount}: {panel?.selectedProject.monaTxCount || "-"}
                      </div>
                      <div>
                        {dict?.uniqueUsers}:{" "}
                        {panel?.selectedProject.monaUniqueUsers || "-"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm opacity-70">
                    {dict?.selectProjectDetail}
                  </div>
                )}
              </div>
            </div>
          )}

          {panel?.activeTab === "epochs" && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 text-left">
              <div className="border border-black/60 bg-dullY/80 rounded p-4">
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {dict?.epochs}
                </div>
                <div className="mt-3 flex flex-col gap-2 max-h-[14rem] overflow-y-auto">
                  {panel?.epochsLoading && (
                    <div className="text-sm opacity-70">{dict?.loadingEpochs}</div>
                  )}
                  {!panel?.epochsLoading && panel?.epochsError && (
                    <div className="text-sm text-red-400">
                      {panel?.epochsError}
                    </div>
                  )}
                  {!panel?.epochsLoading &&
                    !panel?.epochsError &&
                    panel?.epochs.length === 0 && (
                      <div className="text-sm opacity-70">{dict?.noEpochsFound}</div>
                    )}
                  {!panel?.epochsLoading &&
                    !panel?.epochsError &&
                    panel?.epochs.map((epoch) => {
                      const label = `${dict?.epoch} ${epoch.epoch ?? "-"}`;
                      const active = epoch.id === panel?.selectedEpoch?.id;
                      return (
                        <button
                          key={epoch.id}
                          type="button"
                          onClick={() => panel?.setSelectedEpochId(epoch.id)}
                          className={`w-full text-left px-3 py-2 border-2 border-black ${
                            active ? "bg-yell" : "bg-comp"
                          }`}
                        >
                          <div className="text-sm font-digiB uppercase">
                            {label}
                          </div>
                          <div className="text-[10px] opacity-70">
                            {formatTimestamp(epoch.blockTimestamp)}
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
              <div className="border border-black/60 bg-dullY/80 rounded p-4">
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {dict?.epochDetail}
                </div>
                {panel?.selectedEpoch ? (
                  <div className="mt-3 flex flex-col gap-3 text-sm">
                    <div className="text-lg font-digiB uppercase">
                      {dict?.epoch} {panel?.selectedEpoch.epoch ?? "-"}
                    </div>
                    <div className="text-xs space-y-2">
                      <div>
                        {dict?.finalizedAt}:{" "}
                        {formatTimestamp(panel?.selectedEpoch.blockTimestamp)}
                      </div>
                      <div>
                        {dict?.totalScore}: {panel?.selectedEpoch.totalScore || "-"}
                      </div>
                      <div>
                        {dict?.activeProjects}:{" "}
                        {panel?.selectedEpoch.activeProjects || "-"}
                      </div>
                      <div>
                        {dict?.budget}: {formatToken(panel?.selectedEpoch.budget)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 text-sm opacity-70">
                    {dict?.selectEpochDetail}
                  </div>
                )}
              </div>
            </div>
          )}

          {panel?.activeTab === "actions" && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 text-left">
              <div className="border border-black/60 bg-dullY/80 rounded p-4 flex flex-col gap-4">
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {dict?.globalMaintenance}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                      {dict?.epoch}
                    </label>
                    <select
                      className="border-2 border-black bg-comp px-3 py-2 text-xs"
                      value={panel?.actionEpoch}
                      onChange={(event) =>
                        panel?.setActionEpoch(event.target.value)
                      }
                    >
                      <option value="">{dict?.selectEpoch}</option>
                      {panel?.epochs.map((epoch) => (
                        <option key={epoch.id} value={epoch.epoch || ""}>
                          {dict?.epoch} {epoch.epoch ?? "-"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                      {dict?.project}
                    </label>
                    <select
                      className="border-2 border-black bg-comp px-3 py-2 text-xs"
                      value={panel?.actionProject}
                      onChange={(event) =>
                        panel?.setActionProject(event.target.value)
                      }
                    >
                      <option value="">{dict?.selectProject}</option>
                      {panel?.projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.metadata?.title || project.id}
                        </option>
                      ))}
                    </select>
                    {panel?.selectedProject?.id && (
                      <button
                        type="button"
                        className="text-[10px] underline"
                        onClick={() =>
                          panel?.setActionProject(panel?.selectedProject?.id!)
                        }
                      >
                        {dict?.useSelectedProject}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    label={dict?.reconcileTarget}
                    onClick={panel?.handlers.reconcileTarget}
                    disabled={panel?.disabled.reconcileTarget}
                    size="sm"
                  />
                  <ActionButton
                    label={dict?.finalizeEpoch}
                    onClick={panel?.handlers.finalizeEpoch}
                    disabled={panel?.disabled.finalizeEpoch}
                    size="sm"
                  />
                  <ActionButton
                    label={dict?.computeClaimable}
                    onClick={panel?.handlers.computeClaimable}
                    disabled={panel?.disabled.computeClaimable}
                    size="sm"
                  />
                  <ActionButton
                    label={dict?.sweepExpired}
                    onClick={panel?.handlers.sweepExpired}
                    disabled={panel?.disabled.sweepExpired}
                    size="sm"
                  />
                  <ActionButton
                    label={dict?.resolveSlash}
                    onClick={panel?.handlers.resolveSlash}
                    disabled={panel?.disabled.resolveSlash}
                    size="sm"
                  />
                  <ActionButton
                    label={dict?.finalizeProposal}
                    onClick={panel?.handlers.finalizeProposal}
                    disabled={panel?.disabled.finalizeProposal}
                    size="sm"
                  />
                  <ActionButton
                    label={dict?.resolveFailure}
                    onClick={panel?.handlers.resolveFailure}
                    disabled={panel?.disabled.resolveFailure}
                    size="sm"
                  />
                </div>
                {panel?.actionsError && (
                  <div className="text-xs text-red-400">
                    {panel?.actionsError.message}
                  </div>
                )}
              </div>
              <div className="border border-black/60 bg-dullY/80 rounded p-4 flex flex-col gap-4">
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {dict?.actionContext}
                </div>
                <div className="text-xs space-y-2">
                  <div>{dict?.wallet}: {panel?.address || "-"}</div>
                  <div>{dict?.chain}: {panel?.chainId}</div>
                  <div>
                    {dict?.selectedProject}:{" "}
                    {panel?.selectedProject?.metadata?.title || "-"}
                  </div>
                  <div className="break-all">
                    {dict?.projectAddress}: {panel?.actionProject || "-"}
                  </div>
                  <div>{dict?.epoch}: {panel?.actionEpoch || "-"}</div>
                  {!panel?.isConnected && (
                    <div className="text-red-400">{dict?.connectWalletToAct}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {panel?.activeTab === "wallet" && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 text-left">
              <div className="border border-black/60 bg-dullY/80 rounded p-4 flex flex-col gap-4">
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {dict?.walletActions}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                      {dict?.epoch}
                    </label>
                    <select
                      className="border-2 border-black bg-comp px-3 py-2 text-xs"
                      value={panel?.walletEpoch}
                      onChange={(event) =>
                        panel?.setWalletEpoch(event.target.value)
                      }
                    >
                      <option value="">{dict?.selectEpoch}</option>
                      {panel?.epochs.map((epoch) => (
                        <option key={epoch.id} value={epoch.epoch || ""}>
                          {dict?.epoch} {epoch.epoch ?? "-"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                      {dict?.project}
                    </label>
                    <select
                      className="border-2 border-black bg-comp px-3 py-2 text-xs"
                      value={panel?.walletProject}
                      onChange={(event) =>
                        panel?.setWalletProject(event.target.value)
                      }
                    >
                      <option value="">{dict?.selectProject}</option>
                      {panel?.projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.metadata?.title || project.id}
                        </option>
                      ))}
                    </select>
                    {panel?.selectedProject?.id && (
                      <button
                        type="button"
                        className="text-[10px] underline"
                        onClick={() =>
                          panel?.setWalletProject(panel?.selectedProject?.id!)
                        }
                      >
                        {dict?.useSelectedProject}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                      {dict?.voteAmount}
                    </label>
                    <input
                      className="border-2 border-black bg-comp px-3 py-2 text-xs"
                      value={panel?.voteAmount}
                      onChange={(event) =>
                        panel?.setVoteAmount(event.target.value)
                      }
                      placeholder="e.g. 1.5"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] opacity-70">
                      {dict?.slashBps}
                    </label>
                    <input
                      className="border-2 border-black bg-comp px-3 py-2 text-xs"
                      value={panel?.slashBps}
                      onChange={(event) =>
                        panel?.setSlashBps(event.target.value)
                      }
                      placeholder="0 - 10000"
                    />
                  </div>
                  <label className="text-[10px] uppercase tracking-[0.2em] opacity-70 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={panel?.blacklist}
                      onChange={(event) =>
                        panel?.setBlacklist(event.target.checked)
                      }
                    />
                    {dict?.blacklist}
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ActionButton
                    label={dict?.claim}
                    onClick={panel?.handlers.claim}
                    disabled={panel?.disabled.claim}
                    size="sm"
                  />
                  <ActionButton
                    label={dict?.vote}
                    onClick={panel?.handlers.vote}
                    disabled={panel?.disabled.vote}
                    size="sm"
                  />
                  <ActionButton
                    label={dict?.unvote}
                    onClick={panel?.handlers.unvote}
                    disabled={panel?.disabled.unvote}
                    size="sm"
                  />
                  <ActionButton
                    label={dict?.withdrawStake}
                    onClick={panel?.handlers.withdrawStake}
                    disabled={panel?.disabled.withdrawStake}
                    size="sm"
                  />
                  <ActionButton
                    label={dict?.claimVoterReward}
                    onClick={panel?.handlers.claimVoterReward}
                    disabled={panel?.disabled.claimVoterReward}
                    size="sm"
                  />
                </div>
                {panel?.actionsError && (
                  <div className="text-xs text-red-400">
                    {panel?.actionsError.message}
                  </div>
                )}
              </div>
              <div className="border border-black/60 bg-dullY/80 rounded p-4 flex flex-col gap-4">
                <div className="text-xs uppercase tracking-[0.2em] opacity-70">
                  {dict?.walletStatus}
                </div>
                <div className="text-xs space-y-2">
                  <div>{dict?.wallet}: {panel?.address || "-"}</div>
                  <div>{dict?.chain}: {panel?.chainId}</div>
                  <div className="break-all">
                    {dict?.project}: {panel?.walletProject || "-"}
                  </div>
                  <div>{dict?.epoch}: {panel?.walletEpoch || "-"}</div>
                  <div>
                    {dict?.claimer}:{" "}
                    {panel?.claimerLoading
                      ? dict?.checking
                      : panel?.isClaimer
                        ? dict?.yes
                        : dict?.no}
                  </div>
                  {!panel?.isConnected && (
                    <div className="text-red-400">{dict?.connectWalletToAct}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Caja>
  );
}

export default ManageEntry;
