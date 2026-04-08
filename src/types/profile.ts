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
};
