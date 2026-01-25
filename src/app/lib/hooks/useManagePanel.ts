import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { isAddress } from "viem";
import { getNetworkByChainId } from "@/app/lib/constants";
import { useGlobalPanel } from "@/app/lib/hooks/useGlobalPanel";
import { useProjectsPanel } from "@/app/lib/hooks/useProjectsPanel";
import { useEpochsPanel } from "@/app/lib/hooks/useEpochsPanel";
import { useMatroidActions } from "@/app/lib/hooks/useMatroidActions";
import { useProjectClaimer } from "@/app/lib/hooks/useProjectClaimer";
import { parseToken } from "@/app/lib/format/units";
import { ProjectListItem, EpochItem } from "@/app/lib/types/matroid";

type ManageTab = "global" | "projects" | "epochs" | "wallet" | "actions";

export const useManagePanel = () => {
  const subgraphEnabled = false;
  const { globalPanel, stats, loading, error } = useGlobalPanel(subgraphEnabled);
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
  } = useProjectsPanel(subgraphEnabled);
  const {
    epochs,
    loading: epochsLoading,
    error: epochsError,
  } = useEpochsPanel(subgraphEnabled);
  const chainId = useChainId();
  const explorer = getNetworkByChainId(chainId).blockExplorer;
  const { address, isConnected } = useAccount();
  const actions = useMatroidActions();

  const [activeTab, setActiveTab] = useState<ManageTab>("global");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [selectedEpochId, setSelectedEpochId] = useState<string | null>(null);
  const [actionEpoch, setActionEpoch] = useState<string>("");
  const [actionProject, setActionProject] = useState<string>("");
  const [walletEpoch, setWalletEpoch] = useState<string>("");
  const [walletProject, setWalletProject] = useState<string>("");
  const [voteAmount, setVoteAmount] = useState<string>("");
  const [slashBps, setSlashBps] = useState<string>("0");
  const [blacklist, setBlacklist] = useState<boolean>(false);

  const selectedProject = useMemo<ProjectListItem | null>(() => {
    if (!selectedProjectId) return projects[0] || null;
    return projects.find((project) => project.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const selectedEpoch = useMemo<EpochItem | null>(() => {
    if (!selectedEpochId) return epochs[0] || null;
    return epochs.find((epoch) => epoch.id === selectedEpochId) || null;
  }, [epochs, selectedEpochId]);

  const { isClaimer, loading: claimerLoading } = useProjectClaimer(
    walletProject,
    address,
  );

  useEffect(() => {
    if (!selectedProject?.id) return;
    if (!actionProject) setActionProject(selectedProject.id);
    if (!walletProject) setWalletProject(selectedProject.id);
  }, [selectedProject, actionProject, walletProject]);

  const openAddress = (addr?: string | null) => {
    if (!addr) return;
    window.open(`${explorer}/address/${addr}`, "_blank");
  };

  const parseEpoch = (value: string): bigint | null => {
    if (!value) return null;
    try {
      return BigInt(value);
    } catch {
      return null;
    }
  };

  const parseSlashBps = (value: string): number | null => {
    if (!value) return null;
    const num = Number(value);
    if (!Number.isFinite(num)) return null;
    return Math.max(0, Math.min(10_000, Math.floor(num)));
  };

  const epochValue = useMemo(() => parseEpoch(actionEpoch), [actionEpoch]);
  const walletEpochValue = useMemo(() => parseEpoch(walletEpoch), [walletEpoch]);
  const actionProjectValid = useMemo(
    () => (actionProject ? isAddress(actionProject) : false),
    [actionProject],
  );
  const walletProjectValid = useMemo(
    () => (walletProject ? isAddress(walletProject) : false),
    [walletProject],
  );
  const voteAmountWei = useMemo(() => parseToken(voteAmount), [voteAmount]);
  const slashValue = useMemo(() => parseSlashBps(slashBps), [slashBps]);
  const voteAmountValid = useMemo(() => {
    if (!voteAmountWei) return false;
    try {
      return BigInt(voteAmountWei) >= BigInt("1000000000000000000");
    } catch {
      return false;
    }
  }, [voteAmountWei]);

  const canAct = isConnected && !actions.isPending;

  const handlers = {
    reconcileTarget: () => actions.treasury.reconcileTarget(),
    finalizeEpoch: () =>
      epochValue && actions.treasury.finalizeEpoch(epochValue),
    computeClaimable: () =>
      epochValue &&
      actionProjectValid &&
      actions.treasury.computeClaimable(
        epochValue,
        actionProject as `0x${string}`,
      ),
    sweepExpired: () =>
      epochValue &&
      actionProjectValid &&
      actions.treasury.sweepExpired(
        epochValue,
        actionProject as `0x${string}`,
      ),
    resolveSlash: () =>
      epochValue &&
      actionProjectValid &&
      actions.treasury.resolveSlash(
        epochValue,
        actionProject as `0x${string}`,
      ),
    finalizeProposal: () =>
      epochValue &&
      actionProjectValid &&
      actions.slashing.finalizeProposal(
        epochValue,
        actionProject as `0x${string}`,
      ),
    resolveFailure: () =>
      epochValue &&
      actionProjectValid &&
      actions.slashing.resolveFailure(
        epochValue,
        actionProject as `0x${string}`,
      ),
    claim: () =>
      walletEpochValue &&
      walletProjectValid &&
      actions.treasury.claim(
        walletEpochValue,
        walletProject as `0x${string}`,
      ),
    vote: () =>
      walletEpochValue &&
      walletProjectValid &&
      slashValue !== null &&
      voteAmountWei &&
      actions.slashing.vote(
        walletEpochValue,
        walletProject as `0x${string}`,
        BigInt(voteAmountWei),
        slashValue,
        blacklist,
      ),
    unvote: () =>
      walletEpochValue &&
      walletProjectValid &&
      actions.slashing.unvote(
        walletEpochValue,
        walletProject as `0x${string}`,
      ),
    withdrawStake: () =>
      walletEpochValue &&
      walletProjectValid &&
      actions.slashing.withdrawStake(
        walletEpochValue,
        walletProject as `0x${string}`,
      ),
    claimVoterReward: () =>
      walletEpochValue &&
      walletProjectValid &&
      actions.slashing.claimVoterReward(
        walletEpochValue,
        walletProject as `0x${string}`,
      ),
  };

  const disabled = {
    reconcileTarget: !canAct,
    finalizeEpoch: !canAct || !epochValue,
    computeClaimable: !canAct || !epochValue || !actionProjectValid,
    sweepExpired: !canAct || !epochValue || !actionProjectValid,
    resolveSlash: !canAct || !epochValue || !actionProjectValid,
    finalizeProposal: !canAct || !epochValue || !actionProjectValid,
    resolveFailure: !canAct || !epochValue || !actionProjectValid,
    claim:
      !canAct ||
      !walletEpochValue ||
      !walletProjectValid ||
      !isClaimer ||
      claimerLoading,
    vote:
      !canAct ||
      !walletEpochValue ||
      !walletProjectValid ||
      slashValue === null ||
      !voteAmountValid,
    unvote: !canAct || !walletEpochValue || !walletProjectValid,
    withdrawStake: !canAct || !walletEpochValue || !walletProjectValid,
    claimVoterReward: !canAct || !walletEpochValue || !walletProjectValid,
  };

  return {
    subgraphEnabled,
    globalPanel,
    stats,
    loading,
    error,
    projects,
    projectsLoading,
    projectsError,
    epochs,
    epochsLoading,
    epochsError,
    activeTab,
    setActiveTab,
    selectedProjectId,
    setSelectedProjectId,
    selectedEpochId,
    setSelectedEpochId,
    selectedProject,
    selectedEpoch,
    actionEpoch,
    setActionEpoch,
    actionProject,
    setActionProject,
    walletEpoch,
    setWalletEpoch,
    walletProject,
    setWalletProject,
    voteAmount,
    setVoteAmount,
    slashBps,
    setSlashBps,
    blacklist,
    setBlacklist,
    openAddress,
    address,
    chainId,
    isConnected,
    actionsError: actions.error,
    isClaimer,
    claimerLoading,
    disabled,
    handlers,
  };
};
