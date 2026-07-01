import Mona from "./Mona.json";
import StakingFactory from "./StakingFactory.json";
import SignalRegistry from "./SignalRegistry.json";
import SignalKit from "./SignalKit.json";
import SignalScorer from "./SignalScorer.json";
import GlobalStakingPool from "./GlobalStakingPool.json";
import Treasury from "./Treasury.json";
import SlashingCouncil from "./SlashingCouncil.json";
import MatroidGovernance from "./MatroidGovernance.json";
import MatroidAnonGovernance from "./MatroidAnonGovernance.json";
import IdentityRegistry from "./IdentityRegistry.json";
import MonaBalanceTree from "./MonaBalanceTree.json";

export const ABIS = {
  Mona,
  StakingFactory,
  SignalRegistry,
  SignalKit,
  SignalScorer,
  GlobalStakingPool,
  Treasury,
  SlashingCouncil,
  MatroidGovernance,
  MatroidAnonGovernance,
  IdentityRegistry,
  MonaBalanceTree,
} as const;

export const getABI = (contractName: keyof typeof ABIS) => {
  return ABIS[contractName];
};
