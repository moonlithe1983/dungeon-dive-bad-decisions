import type { CombatState } from '@/src/types/combat';
import type {
  ArchivedRunRetentionSummary,
  MetaUpgradeLevels,
} from '@/src/types/profile';

export type RunNodeKind = 'battle' | 'event' | 'reward' | 'boss';
export type RunNodeStatus = 'locked' | 'active' | 'resolved';
export type RunFloorStatus = 'locked' | 'active' | 'resolved';
export type RunStatus = 'in_progress' | 'paused' | 'completed' | 'failed';
export type RewardSourceKind = 'battle-victory' | 'reward-node';

export type RunNodeState = {
  id: string;
  floorNumber: number;
  sequence: number;
  kind: RunNodeKind;
  label: string;
  description: string;
  status: RunNodeStatus;
};

export type RunFloorState = {
  id: string;
  floorNumber: number;
  label: string;
  description: string;
  status: RunFloorStatus;
  nodes: RunNodeState[];
};

export type RunMapState = {
  floors: RunFloorState[];
};

export type ArchivedRunResult = 'win' | 'loss' | 'abandon';

export type PendingRewardOptionState = {
  optionId: string;
  label: string;
  description: string;
  metaCurrency: number;
  runHealing: number;
  itemId: string | null;
  companionBonusLabel?: string | null;
  synergyBonusLabel?: string | null;
};

export type PendingRewardState = {
  rewardId: string;
  sourceNodeId: string;
  sourceKind: RewardSourceKind;
  title: string;
  description: string;
  selectedOptionId: string | null;
  options: PendingRewardOptionState[] | null;
  metaCurrency: number;
  runHealing: number;
  itemId: string | null;
  createdAt: string;
};

export type RewardClaimResult = {
  metaCurrencyAwarded: number;
  unlockedItemId: string | null;
  duplicateItemId: string | null;
};

export type RunHeroState = {
  currentHp: number;
  maxHp: number;
};

export type RunProgressStats = {
  nodesResolved: number;
  battlesWon: number;
  eventsResolved: number;
  rewardsClaimed: number;
  metaCurrencyEarned: number;
  damageTaken: number;
  healingReceived: number;
  collectedItemIds: string[];
};

export type ArchivedRunOutcomeNote = {
  title: string;
  detail: string;
};

export type ArchivedRunDefeatSummary = {
  nodeLabel: string;
  enemyName: string;
  enemyIntent: string;
  finalBlow: string;
  heroStatusLabels: string[];
  enemyStatusLabels: string[];
  heroStatusNotes?: string[];
  enemyStatusNotes?: string[];
  recommendation: string;
};

export type ArchivedRunBondGain = {
  companionId: string;
  role: 'active' | 'reserve';
  levelBefore: number;
  levelAfter: number;
  levelsEarned: number;
};

export type ArchivedRunRecap = {
  activeCompanionId: string;
  finalHero: RunHeroState;
  inventoryItemIds: string[];
  metaUpgradeLevels: MetaUpgradeLevels;
  stats: RunProgressStats;
  outcome: ArchivedRunOutcomeNote;
  defeatSummary?: ArchivedRunDefeatSummary | null;
  bondGains: ArchivedRunBondGain[];
  retention?: ArchivedRunRetentionSummary | null;
};

export type RunState = {
  runId: string;
  schemaVersion: number;
  seed: string;
  heroClassId: string;
  hero: RunHeroState;
  chosenCompanionIds: string[];
  companionBondLevels: Record<string, number>;
  metaUpgradeLevels: MetaUpgradeLevels;
  activeCompanionId: string;
  inventoryItemIds: string[];
  floorIndex: number;
  currentNodeId: string | null;
  map: RunMapState;
  runStatus: RunStatus;
  combatState?: CombatState | null;
  pendingReward: PendingRewardState | null;
  stats: RunProgressStats;
  createdAt: string;
  updatedAt: string;
};

export type RunHistoryEntry = {
  id: number;
  runId: string;
  result: ArchivedRunResult;
  classId: string;
  className: string;
  floorReached: number;
  recap: ArchivedRunRecap | null;
  updatedAt: string;
  createdAt: string;
};
