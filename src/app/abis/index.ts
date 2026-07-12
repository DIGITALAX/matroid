import Mona from "./Mona.json";
import StakingFactory from "./StakingFactory.json";
import SignalRegistry from "./SignalRegistry.json";
import SignalKit from "./SignalKit.json";
import SignalScorer from "./SignalScorer.json";
import GlobalStakingPool from "./GlobalStakingPool.json";
import Treasury from "./Treasury.json";
import SlashingCouncil from "./SlashingCouncil.json";
import MatroidAnonGovernance from "./MatroidAnonGovernance.json";
import IdentityRegistry from "./IdentityRegistry.json";
import BalancePool from "./BalancePool.json";

export const ABIS = {
  Mona,
  StakingFactory,
  SignalRegistry,
  SignalKit,
  SignalScorer,
  GlobalStakingPool,
  Treasury,
  SlashingCouncil,
  MatroidAnonGovernance,
  IdentityRegistry,
  BalancePool,
} as const;

export const getABI = (contractName: keyof typeof ABIS) => {
  return ABIS[contractName];
};
