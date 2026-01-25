export type SubgraphId = string;

export type GlobalPanel = {
  id: SubgraphId;
  totalStaked?: string | null;
  rewardNotifiedTotal?: string | null;
  stakerCount?: number | null;
  totalDeposited?: string | null;
  targetTotal?: string | null;
  targetDuration?: string | null;
  claimWindow?: string | null;
  distributionStart?: string | null;
  totalDistributed?: string | null;
  baseBudget?: string | null;
  perProjectBudget?: string | null;
  mona?: string | null;
  registry?: string | null;
  scorer?: string | null;
  globalPool?: string | null;
  slashingContract?: string | null;
  projects?: { id: SubgraphId }[] | null;
  epochs?: { id: SubgraphId }[] | null;
};

export type GlobalPanelQueryData = {
  globals?: GlobalPanel[];
};

export type ProjectMetadata = {
  title?: string | null;
  image?: string | null;
  description?: string | null;
};

export type ProjectListItem = {
  id: SubgraphId;
  registeredAt?: string | null;
  monaIn?: string | null;
  monaOut?: string | null;
  monaTxCount?: string | null;
  monaUniqueUsers?: string | null;
  metadata?: ProjectMetadata | null;
};

export type ProjectsPanelQueryData = {
  projects?: ProjectListItem[];
};

export type EpochItem = {
  id: SubgraphId;
  epoch?: string | null;
  totalScore?: string | null;
  activeProjects?: string | null;
  budget?: string | null;
  blockTimestamp?: string | null;
};

export type EpochsPanelQueryData = {
  globals?: {
    epochs?: EpochItem[];
  }[];
};
