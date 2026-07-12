export type BoxProps = {
  image: string;
  row: string;
  col: string;
  self: string;
  justify: string;
  contain?: boolean;
  bgColor?: boolean;
  rounded?: boolean;
  border?: boolean;
};

export type ActionButtonProps = {
  label: string;
  connect?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
  showIcon?: boolean;
};

export type ChipEnrollData = {
  commitment: `0x${string}`;
  proof: `0x${string}`;
  enrollNullifier: `0x${string}`;
};

export interface CoreContractAddresses {
  Mona: `0x${string}`;
  StakingFactory: `0x${string}`;
  SignalRegistry: `0x${string}`;
  SignalKit: `0x${string}`;
  SignalScorer: `0x${string}`;
  GlobalStakingPool: `0x${string}`;
  Treasury: `0x${string}`;
  SlashingCouncil: `0x${string}`;
  MatroidAnonGovernance: `0x${string}`;
  IdentityRegistry: `0x${string}`;
  BalancePool: `0x${string}`;
}
