export type MetaUpgradeId =
  | 'incident-insurance'
  | 'expense-padding'
  | 'breakroom-trauma-kit';

export type MetaUpgradeLevels = Record<MetaUpgradeId, number>;

export type ProfileSettingsState = {
  sfxEnabled: boolean;
  musicEnabled: boolean;
  profanityFilterEnabled: boolean;
};

export type ProfileStats = {
  totalRuns: number;
  totalWins: number;
  totalDeaths: number;
  totalBossesKilled: number;
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
  settings: ProfileSettingsState;
  stats: ProfileStats;
  createdAt: string;
  updatedAt: string;
};

export const DEFAULT_PROFILE_SETTINGS: ProfileSettingsState = {
  sfxEnabled: true,
  musicEnabled: true,
  profanityFilterEnabled: false,
};

export const DEFAULT_PROFILE_STATS: ProfileStats = {
  totalRuns: 0,
  totalWins: 0,
  totalDeaths: 0,
  totalBossesKilled: 0,
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
  ],
  unlockedItemIds: [],
  unlockedEventIds: [],
  bondLevels: {
    'former-executive-assistant': 1,
    'facilities-goblin': 1,
  },
  metaUpgradeLevels: DEFAULT_META_UPGRADE_LEVELS,
  settings: DEFAULT_PROFILE_SETTINGS,
  stats: DEFAULT_PROFILE_STATS,
};
