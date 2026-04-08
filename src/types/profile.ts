import type { CombatActionId } from '@/src/types/combat';
import type { DominantHand } from '@/src/input/combat-input';

export type MetaUpgradeId =
  | 'incident-insurance'
  | 'expense-padding'
  | 'breakroom-trauma-kit';

export type MetaUpgradeLevels = Record<MetaUpgradeId, number>;

export type ThemePresetId =
  | 'corporate-hell'
  | 'amber-terminal'
  | 'night-shift'
  | 'ada-contrast';

export type TextSizeSetting = 'default' | 'large' | 'largest';

export type EndingStateId =
  | 'quiet-survival'
  | 'licensed-survival'
  | 'partial-exposure'
  | 'controlled-detonation'
  | 'full-exposure';

export type TruthRouteId =
  | 'force-the-truth-to-surface'
  | 'authenticate-with-stolen-authority'
  | 'complete-the-proof-chain-cleanly'
  | 'risky-proof-acquisition'
  | 'survival-heavy-clear';

export type QuarterlyTierId = 'incident-file' | 'board-watch' | 'crisis-cell';

export type ProfileSettingsState = {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  profanityFilterEnabled: boolean;
  themePreset: ThemePresetId;
  textSize: TextSizeSetting;
  highContrastEnabled: boolean;
  reducedMotionEnabled: boolean;
  colorAssistEnabled: boolean;
  dyslexiaAssistEnabled: boolean;
  screenReaderHintsEnabled: boolean;
  dominantHand: DominantHand;
  controllerHintsEnabled: boolean;
  combatActionOrder: CombatActionId[];
};

export type ProfileStats = {
  totalRuns: number;
  totalWins: number;
  totalDeaths: number;
  totalBossesKilled: number;
};

export type ProfileOnboardingState = {
  narrativeIntroSeen: boolean;
};

export type TruthLadderState = {
  discoveredEndingIds: EndingStateId[];
  fullExposureClassIds: string[];
  lastEndingId: EndingStateId | null;
};

export type RosterLadderState = {
  totalBonusCurrency: number;
  winsFundingUnlocks: number;
  lastAffordableUnlockId: string | null;
  lastAffordableUnlockKind: 'class' | 'companion' | null;
};

export type RelationshipLadderState = {
  archivedCompanionIds: string[];
  synergyPairIds: string[];
  unlockedBondSceneIds: string[];
  totalBondLevelsEarned: number;
};

export type QuarterlyTierHistoryEntry = {
  quarterId: string;
  bestScore: number;
  unlockedTierIds: QuarterlyTierId[];
  closedAt: string;
};

export type QuarterlyChallengeState = {
  activeQuarterId: string;
  score: number;
  bestScore: number;
  unlockedTierIds: QuarterlyTierId[];
  lastScoredAt: string | null;
  history: QuarterlyTierHistoryEntry[];
};

export type ProbationContractState = {
  status: 'inactive' | 'active';
  startedAt: string | null;
  startRunCount: number;
  deadlineRunCount: number;
  targetRuns: number;
  rewardCurrency: number;
  failurePenalty: number;
  successfulCompletions: number;
  failedReviews: number;
  lastOutcome: 'success' | 'failed' | 'cancelled' | null;
  lastResolvedAt: string | null;
};

export type MomentumBonusState = {
  targetRuns: number;
  runsSinceLastWin: number;
  streakBonusesEarned: number;
};

export type RetentionState = {
  truth: TruthLadderState;
  roster: RosterLadderState;
  relationship: RelationshipLadderState;
  quarterly: QuarterlyChallengeState;
  probation: ProbationContractState;
  momentum: MomentumBonusState;
};

export type ArchivedRunRetentionSummary = {
  endingId: EndingStateId;
  truthEndingUnlocked: boolean;
  totalEndingStatesLogged: number;
  totalFullExposureClasses: number;
  fullExposureClassUnlocked: string | null;
  rosterBonusCurrency: number;
  rosterUnlockReadyId: string | null;
  rosterUnlockReadyKind: 'class' | 'companion' | null;
  relationshipSceneIds: string[];
  relationshipArchiveCoverageAdded: string[];
  relationshipSynergyPairIds: string[];
  quarterlyQuarterId: string;
  quarterlyPointsAwarded: number;
  quarterlyScoreAfterRun: number;
  quarterlyDecayApplied: number;
  quarterlyUnlockedTierIds: QuarterlyTierId[];
  probationOutcome: 'inactive' | 'active' | 'success' | 'failed';
  probationRunsRemaining: number | null;
  probationRewardCurrency: number;
  probationPenaltyApplied: number;
  momentumQualified: boolean;
  momentumRunsUsed: number;
  momentumTargetRuns: number;
  momentumBonusCurrency: number;
  totalBonusCurrency: number;
};

export type ProfileState = {
  profileId: string;
  schemaVersion: number;
  metaCurrency: number;
  unlockedClassIds: string[];
  unlockedCompanionIds: string[];
  unlockedItemIds: string[];
  unlockedEventIds: string[];
  bondLevels: Record<string, number>;
  metaUpgradeLevels: MetaUpgradeLevels;
  onboarding: ProfileOnboardingState;
  settings: ProfileSettingsState;
  stats: ProfileStats;
  retention: RetentionState;
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_PROFILE_SETTINGS: ProfileSettingsState = {
  sfxEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  masterVolume: 100,
  sfxVolume: 85,
  musicVolume: 70,
  voiceVolume: 85,
  ambientVolume: 65,
  profanityFilterEnabled: false,
  themePreset: 'corporate-hell',
  textSize: 'default',
  highContrastEnabled: false,
  reducedMotionEnabled: false,
  colorAssistEnabled: false,
  dyslexiaAssistEnabled: false,
  screenReaderHintsEnabled: true,
  dominantHand: 'right',
  controllerHintsEnabled: true,
  combatActionOrder: ['patch', 'escalate', 'stabilize', 'dodge'],
};

export const DEFAULT_PROFILE_STATS: ProfileStats = {
  totalRuns: 0,
  totalWins: 0,
  totalDeaths: 0,
  totalBossesKilled: 0,
};

export const DEFAULT_PROFILE_ONBOARDING: ProfileOnboardingState = {
  narrativeIntroSeen: false,
};

export const DEFAULT_META_UPGRADE_LEVELS: MetaUpgradeLevels = {
  'incident-insurance': 0,
  'expense-padding': 0,
  'breakroom-trauma-kit': 0,
};

export const DEFAULT_RETENTION_STATE: RetentionState = {
  truth: {
    discoveredEndingIds: [],
    fullExposureClassIds: [],
    lastEndingId: null,
  },
  roster: {
    totalBonusCurrency: 0,
    winsFundingUnlocks: 0,
    lastAffordableUnlockId: null,
    lastAffordableUnlockKind: null,
  },
  relationship: {
    archivedCompanionIds: [],
    synergyPairIds: [],
    unlockedBondSceneIds: [],
    totalBondLevelsEarned: 0,
  },
  quarterly: {
    activeQuarterId: '1970-Q1',
    score: 0,
    bestScore: 0,
    unlockedTierIds: [],
    lastScoredAt: null,
    history: [],
  },
  probation: {
    status: 'inactive',
    startedAt: null,
    startRunCount: 0,
    deadlineRunCount: 0,
    targetRuns: 3,
    rewardCurrency: 18,
    failurePenalty: 12,
    successfulCompletions: 0,
    failedReviews: 0,
    lastOutcome: null,
    lastResolvedAt: null,
  },
  momentum: {
    targetRuns: 3,
    runsSinceLastWin: 0,
    streakBonusesEarned: 0,
  },
};

export const DEFAULT_PROFILE_STATE: Omit<
  ProfileState,
  'profileId' | 'schemaVersion' | 'createdAt' | 'updatedAt'
> = {
  metaCurrency: 0,
  unlockedClassIds: ['it-support'],
  unlockedCompanionIds: [
    'former-executive-assistant',
    'facilities-goblin',
    'security-skeleton',
  ],
  unlockedItemIds: [],
  unlockedEventIds: [],
  bondLevels: {
    'former-executive-assistant': 1,
    'facilities-goblin': 1,
    'security-skeleton': 1,
  },
  metaUpgradeLevels: DEFAULT_META_UPGRADE_LEVELS,
  onboarding: DEFAULT_PROFILE_ONBOARDING,
  settings: DEFAULT_PROFILE_SETTINGS,
  stats: DEFAULT_PROFILE_STATS,
  retention: DEFAULT_RETENTION_STATE,
};
