import { classDefinitions, defaultUnlockedClassIds } from '@/src/content/classes';
import {
  companionDefinitions,
  defaultUnlockedCompanionIds,
} from '@/src/content/companions';
import { itemDefinitions } from '@/src/content/items';
import { normalizeMetaUpgradeLevels } from '@/src/engine/meta/meta-upgrade-engine';
import { getDatabaseAsync } from '@/src/save/db';
import { LATEST_SCHEMA_VERSION } from '@/src/save/migrations';
import {
  DEFAULT_META_UPGRADE_LEVELS,
  DEFAULT_PROFILE_ONBOARDING,
  DEFAULT_PROFILE_SETTINGS,
  DEFAULT_PROFILE_STATE,
  DEFAULT_PROFILE_STATS,
  type MetaUpgradeLevels,
  type ProfileOnboardingState,
  type ProfileSettingsState,
  type ProfileState,
  type ProfileStats,
  type TextSizeSetting,
  type ThemePresetId,
} from '@/src/types/profile';
import { createTimestamp } from '@/src/utils/time';

const PRIMARY_PROFILE_ID = 'primary-profile';

type ProfileRow = {
  id: string;
  payload: string;
  schema_version: number;
  created_at: string;
  updated_at: string;
};

const validClassIds = new Set(classDefinitions.map((item) => item.id));
const validCompanionIds = new Set(companionDefinitions.map((item) => item.id));
const validItemIds = new Set(itemDefinitions.map((item) => item.id));
const MAX_BOND_LEVEL = 5;
const minimumUnlockedCompanionIds = defaultUnlockedCompanionIds;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNumberRecord(
  value: unknown
): value is Record<string, number> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every(
    (item) => typeof item === 'number'
  );
}

function isMetaUpgradeLevels(value: unknown): value is MetaUpgradeLevels {
  return isNumberRecord(value);
}

function isProfileSettingsState(
  value: unknown
): value is ProfileSettingsState {
  const candidate = value as Partial<ProfileSettingsState>;

  return (
    Boolean(value) &&
    typeof value === 'object' &&
    typeof candidate.sfxEnabled === 'boolean' &&
    typeof candidate.musicEnabled === 'boolean' &&
    typeof candidate.profanityFilterEnabled === 'boolean' &&
    typeof candidate.themePreset === 'string' &&
    typeof candidate.textSize === 'string' &&
    typeof candidate.highContrastEnabled === 'boolean' &&
    typeof candidate.reducedMotionEnabled === 'boolean' &&
    typeof candidate.colorAssistEnabled === 'boolean' &&
    typeof candidate.dyslexiaAssistEnabled === 'boolean' &&
    typeof candidate.screenReaderHintsEnabled === 'boolean'
  );
}

function isProfileStats(value: unknown): value is ProfileStats {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    typeof (value as Partial<ProfileStats>).totalRuns === 'number' &&
    typeof (value as Partial<ProfileStats>).totalWins === 'number' &&
    typeof (value as Partial<ProfileStats>).totalDeaths === 'number' &&
    typeof (value as Partial<ProfileStats>).totalBossesKilled === 'number'
  );
}

function isProfileOnboardingState(
  value: unknown
): value is ProfileOnboardingState {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    typeof (value as Partial<ProfileOnboardingState>).narrativeIntroSeen ===
      'boolean'
  );
}

function sanitizeIds(
  value: string[],
  validIds: Set<string>,
  fallback: string[]
) {
  const uniqueIds = Array.from(
    new Set(value.filter((item) => validIds.has(item)))
  );

  return uniqueIds.length > 0 ? uniqueIds : fallback;
}

function sanitizeFreeformIds(value: string[]) {
  return Array.from(new Set(value.filter((item) => item.trim().length > 0)));
}

function ensureMinimumUnlockedCompanions(value: string[]) {
  const nextIds = [...value];

  for (const companionId of minimumUnlockedCompanionIds) {
    if (!nextIds.includes(companionId)) {
      nextIds.push(companionId);
    }
  }

  return nextIds;
}

function normalizeBondLevels(value: Record<string, number>) {
  const sanitizedEntries = Object.entries(value)
    .filter(([companionId]) => validCompanionIds.has(companionId))
    .map(([companionId, level]) => [
      companionId,
      Math.min(
        MAX_BOND_LEVEL,
        Math.max(0, Math.floor(Number.isFinite(level) ? level : 0))
      ),
    ]);

  return {
    ...DEFAULT_PROFILE_STATE.bondLevels,
    ...Object.fromEntries(sanitizedEntries),
  };
}

function normalizeSettings(
  settings: ProfileSettingsState
): ProfileSettingsState {
  const themePreset: ThemePresetId =
    settings.themePreset === 'amber-terminal' ||
    settings.themePreset === 'night-shift' ||
    settings.themePreset === 'ada-contrast'
      ? settings.themePreset
      : 'corporate-hell';
  const textSize: TextSizeSetting =
    settings.textSize === 'large' || settings.textSize === 'largest'
      ? settings.textSize
      : 'default';

  return {
    sfxEnabled: settings.sfxEnabled,
    musicEnabled: settings.musicEnabled,
    profanityFilterEnabled: settings.profanityFilterEnabled,
    themePreset,
    textSize,
    highContrastEnabled: settings.highContrastEnabled,
    reducedMotionEnabled: settings.reducedMotionEnabled,
    colorAssistEnabled: settings.colorAssistEnabled,
    dyslexiaAssistEnabled: settings.dyslexiaAssistEnabled,
    screenReaderHintsEnabled: settings.screenReaderHintsEnabled,
  };
}

function normalizeStats(stats: ProfileStats): ProfileStats {
  return {
    totalRuns: Math.max(0, Math.floor(stats.totalRuns)),
    totalWins: Math.max(0, Math.floor(stats.totalWins)),
    totalDeaths: Math.max(0, Math.floor(stats.totalDeaths)),
    totalBossesKilled: Math.max(0, Math.floor(stats.totalBossesKilled)),
  };
}

function normalizeOnboarding(
  onboarding: ProfileOnboardingState,
  stats: ProfileStats
): ProfileOnboardingState {
  return {
    narrativeIntroSeen:
      onboarding.narrativeIntroSeen || stats.totalRuns > 0 || stats.totalWins > 0,
  };
}

function normalizeProfileState(profile: ProfileState): ProfileState {
  const createdAt = profile.createdAt || createTimestamp();
  const updatedAt = profile.updatedAt || createdAt;
  const normalizedStats = normalizeStats(profile.stats);

  return {
    profileId: profile.profileId,
    schemaVersion: LATEST_SCHEMA_VERSION,
    metaCurrency: Number.isFinite(profile.metaCurrency)
      ? Math.max(0, Math.floor(profile.metaCurrency))
      : 0,
    unlockedClassIds: sanitizeIds(
      profile.unlockedClassIds,
      validClassIds,
      defaultUnlockedClassIds
    ),
    unlockedCompanionIds: sanitizeIds(
      ensureMinimumUnlockedCompanions(profile.unlockedCompanionIds),
      validCompanionIds,
      defaultUnlockedCompanionIds
    ),
    unlockedItemIds: sanitizeIds(
      profile.unlockedItemIds,
      validItemIds,
      DEFAULT_PROFILE_STATE.unlockedItemIds
    ),
    unlockedEventIds: sanitizeFreeformIds(profile.unlockedEventIds),
    bondLevels: normalizeBondLevels(profile.bondLevels),
    metaUpgradeLevels: normalizeMetaUpgradeLevels(profile.metaUpgradeLevels),
    onboarding: normalizeOnboarding(profile.onboarding, normalizedStats),
    settings: normalizeSettings(profile.settings),
    stats: normalizedStats,
    createdAt,
    updatedAt,
  };
}

function createDefaultProfile(): ProfileState {
  const timestamp = createTimestamp();

  return {
    profileId: PRIMARY_PROFILE_ID,
    schemaVersion: LATEST_SCHEMA_VERSION,
    metaCurrency: DEFAULT_PROFILE_STATE.metaCurrency,
    unlockedClassIds:
      DEFAULT_PROFILE_STATE.unlockedClassIds.length > 0
        ? DEFAULT_PROFILE_STATE.unlockedClassIds
        : defaultUnlockedClassIds,
    unlockedCompanionIds:
      DEFAULT_PROFILE_STATE.unlockedCompanionIds.length > 0
        ? DEFAULT_PROFILE_STATE.unlockedCompanionIds
        : defaultUnlockedCompanionIds,
    unlockedItemIds: DEFAULT_PROFILE_STATE.unlockedItemIds,
    unlockedEventIds: DEFAULT_PROFILE_STATE.unlockedEventIds,
    bondLevels: DEFAULT_PROFILE_STATE.bondLevels,
    metaUpgradeLevels: DEFAULT_META_UPGRADE_LEVELS,
    onboarding: DEFAULT_PROFILE_ONBOARDING,
    settings: DEFAULT_PROFILE_SETTINGS,
    stats: DEFAULT_PROFILE_STATS,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function parseProfileRow(row: ProfileRow | null) {
  if (!row) {
    return null;
  }

  try {
    const parsed = JSON.parse(row.payload) as unknown;

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const candidate = parsed as Partial<ProfileState>;

    return normalizeProfileState({
      profileId:
        typeof candidate.profileId === 'string' ? candidate.profileId : row.id,
      schemaVersion:
        typeof candidate.schemaVersion === 'number'
          ? candidate.schemaVersion
          : row.schema_version,
      metaCurrency:
        typeof candidate.metaCurrency === 'number'
          ? candidate.metaCurrency
          : DEFAULT_PROFILE_STATE.metaCurrency,
      unlockedClassIds: isStringArray(candidate.unlockedClassIds)
        ? candidate.unlockedClassIds
        : defaultUnlockedClassIds,
      unlockedCompanionIds: isStringArray(candidate.unlockedCompanionIds)
        ? candidate.unlockedCompanionIds
        : defaultUnlockedCompanionIds,
      unlockedItemIds: isStringArray(candidate.unlockedItemIds)
        ? candidate.unlockedItemIds
        : DEFAULT_PROFILE_STATE.unlockedItemIds,
      unlockedEventIds: isStringArray(candidate.unlockedEventIds)
        ? candidate.unlockedEventIds
        : DEFAULT_PROFILE_STATE.unlockedEventIds,
      bondLevels: isNumberRecord(candidate.bondLevels)
        ? candidate.bondLevels
        : DEFAULT_PROFILE_STATE.bondLevels,
      metaUpgradeLevels: isMetaUpgradeLevels(candidate.metaUpgradeLevels)
        ? candidate.metaUpgradeLevels
        : DEFAULT_META_UPGRADE_LEVELS,
      onboarding: isProfileOnboardingState(candidate.onboarding)
        ? candidate.onboarding
        : DEFAULT_PROFILE_ONBOARDING,
      settings: isProfileSettingsState(candidate.settings)
        ? candidate.settings
        : DEFAULT_PROFILE_SETTINGS,
      stats: isProfileStats(candidate.stats)
        ? candidate.stats
        : DEFAULT_PROFILE_STATS,
      createdAt:
        typeof candidate.createdAt === 'string'
          ? candidate.createdAt
          : row.created_at,
      updatedAt:
        typeof candidate.updatedAt === 'string'
          ? candidate.updatedAt
          : row.updated_at,
    });
  } catch {
    return null;
  }
}

export async function loadProfileAsync() {
  const db = await getDatabaseAsync();
  const row = await db.getFirstAsync<ProfileRow>(
    `
      SELECT id, payload, schema_version, created_at, updated_at
      FROM profiles
      WHERE id = ?;
    `,
    [PRIMARY_PROFILE_ID]
  );

  return parseProfileRow(row ?? null);
}

export async function saveProfileAsync(profile: ProfileState) {
  const db = await getDatabaseAsync();
  const normalized = normalizeProfileState(profile);
  const timestamp = createTimestamp();
  const nextProfile: ProfileState = {
    ...normalized,
    updatedAt: timestamp,
  };

  await db.runAsync(
    `
      INSERT INTO profiles (id, payload, schema_version, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        payload = excluded.payload,
        schema_version = excluded.schema_version,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at;
    `,
    [
      nextProfile.profileId,
      JSON.stringify(nextProfile),
      nextProfile.schemaVersion,
      nextProfile.createdAt,
      nextProfile.updatedAt,
    ]
  );

  return nextProfile;
}

export async function loadOrSeedProfileAsync() {
  const existingProfile = await loadProfileAsync();

  if (existingProfile) {
    return existingProfile;
  }

  return saveProfileAsync(createDefaultProfile());
}
