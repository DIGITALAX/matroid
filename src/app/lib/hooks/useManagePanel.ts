import { useEffect, useMemo, useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { isAddress, type Abi } from "viem";
import { DEFAULT_NETWORK, getNetworkByChainId } from "@/app/lib/constants";
import { getABI } from "@/app/abis";
import { useCoreAddresses } from "@/app/lib/hooks/useCoreAddresses";
import { useGlobalPanel } from "@/app/lib/hooks/useGlobalPanel";
import { useProjectsPanel } from "@/app/lib/hooks/useProjectsPanel";
import { useEpochsPanel } from "@/app/lib/hooks/useEpochsPanel";
import { useMatroidActions } from "@/app/lib/hooks/useMatroidActions";
import { useProjectClaimer } from "@/app/lib/hooks/useProjectClaimer";
import { parseToken } from "@/app/lib/format/units";
import { ProjectListItem, EpochItem } from "@/app/lib/types/matroid";

type ManageTab = "global" | "projects" | "epochs" | "wallet" | "actions";

export const useManagePanel = () => {
  const subgraphEnabled = true;
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
    actionProject,
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

  const coreAddresses = useCoreAddresses();
  const { data: claimableAmount } = useReadContract({
    address: coreAddresses.Treasury as `0x${string}`,
    abi: getABI("Treasury") as Abi,
    chainId: DEFAULT_NETWORK.chainId,
    functionName: "claimable",
    args:
      epochValue !== null && actionProjectValid
        ? [epochValue, actionProject as `0x${string}`]
        : undefined,
    query: { enabled: epochValue !== null && actionProjectValid },
  });

  const { data: claimableSetFlag } = useReadContract({
    address: coreAddresses.Treasury as `0x${string}`,
    abi: getABI("Treasury") as Abi,
    chainId: DEFAULT_NETWORK.chainId,
    functionName: "claimableSet",
    args:
      epochValue !== null && actionProjectValid
        ? [epochValue, actionProject as `0x${string}`]
        : undefined,
    query: { enabled: epochValue !== null && actionProjectValid },
  });

  const alreadyClaimed =
    claimableSetFlag === true &&
    typeof claimableAmount === "bigint" &&
    claimableAmount === 0n;

  const { data: currentEpochRaw } = useReadContract({
    address: coreAddresses.SignalRegistry as `0x${string}`,
    abi: getABI("SignalRegistry") as Abi,
    chainId: DEFAULT_NETWORK.chainId,
    functionName: "currentEpoch",
  });
  const currentEpochChain =
    typeof currentEpochRaw === "bigint" ? currentEpochRaw : undefined;

  const pendingEpoch = useMemo(() => {
    if (currentEpochChain === undefined || currentEpochChain === 0n)
      return null;
    const last = currentEpochChain - 1n;
    const finalized = epochs.some((e) => e.epoch === last.toString());
    return finalized ? null : last;
  }, [currentEpochChain, epochs]);

  useEffect(() => {
    if (!actionProject && projects.length === 1) {
      setActionProject(projects[0].id);
    }
  }, [projects, actionProject]);

  const selectEpoch = (id: string, epochNumber?: string | null) => {
    setSelectedEpochId(id);
    if (epochNumber) {
      setActionEpoch(epochNumber);
    }
  };

  const canAct = !actions.isPending;

  const handlers = {
    reconcileTarget: () => actions.treasury.reconcileTarget(),
    finalizeEpoch: () =>
      epochValue !== null && actions.treasury.finalizeEpoch(epochValue),
    finalizePending: () =>
      pendingEpoch !== null && actions.treasury.finalizeEpoch(pendingEpoch),
    computeClaimable: () =>
      epochValue !== null &&
      actionProjectValid &&
      actions.treasury.computeClaimable(
        epochValue,
        actionProject as `0x${string}`,
      ),
    sweepExpired: () =>
      epochValue !== null &&
      actionProjectValid &&
      actions.treasury.sweepExpired(
        epochValue,
        actionProject as `0x${string}`,
      ),
    resolveSlash: () =>
      epochValue !== null &&
      actionProjectValid &&
      actions.treasury.resolveSlash(
        epochValue,
        actionProject as `0x${string}`,
      ),
    finalizeProposal: () =>
      epochValue !== null &&
      actionProjectValid &&
      actions.slashing.finalizeProposal(
        epochValue,
        actionProject as `0x${string}`,
      ),
    resolveFailure: () =>
      epochValue !== null &&
      actionProjectValid &&
      actions.slashing.resolveFailure(
        epochValue,
        actionProject as `0x${string}`,
      ),
    claim: () =>
      epochValue !== null &&
      actionProjectValid &&
      actions.treasury.claim(
        epochValue,
        actionProject as `0x${string}`,
      ),
    vote: () =>
      walletEpochValue !== null &&
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
      walletEpochValue !== null &&
      walletProjectValid &&
      actions.slashing.unvote(
        walletEpochValue,
        walletProject as `0x${string}`,
      ),
    withdrawStake: () =>
      walletEpochValue !== null &&
      walletProjectValid &&
      actions.slashing.withdrawStake(
        walletEpochValue,
        walletProject as `0x${string}`,
      ),
    claimVoterReward: () =>
      walletEpochValue !== null &&
      walletProjectValid &&
      actions.slashing.claimVoterReward(
        walletEpochValue,
        walletProject as `0x${string}`,
      ),
  };

  const disabled = {
    reconcileTarget: !canAct,
    finalizeEpoch: !canAct || epochValue === null,
    finalizePending: !canAct || pendingEpoch === null,
    computeClaimable: !canAct || epochValue === null || !actionProjectValid,
    sweepExpired: !canAct || epochValue === null || !actionProjectValid,
    resolveSlash: !canAct || epochValue === null || !actionProjectValid,
    finalizeProposal: !canAct || epochValue === null || !actionProjectValid,
    resolveFailure: !canAct || epochValue === null || !actionProjectValid,
    claim:
      !canAct ||
      epochValue === null ||
      !actionProjectValid ||
      !isClaimer ||
      claimerLoading ||
      alreadyClaimed,
    vote:
      !canAct ||
      walletEpochValue === null ||
      !walletProjectValid ||
      slashValue === null ||
      !voteAmountValid,
    unvote: !canAct || walletEpochValue === null || !walletProjectValid,
    withdrawStake: !canAct || walletEpochValue === null || !walletProjectValid,
    claimVoterReward: !canAct || walletEpochValue === null || !walletProjectValid,
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
    claimableAmount: claimableAmount as bigint | undefined,
    alreadyClaimed,
    currentEpochChain,
    pendingEpoch,
    selectEpoch,
    disabled,
    handlers,
    busy: actions.isPending,
  };
};
