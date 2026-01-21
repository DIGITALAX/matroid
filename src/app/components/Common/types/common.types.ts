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
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  type?: "button" | "submit";
  showIcon?: boolean;
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
}
