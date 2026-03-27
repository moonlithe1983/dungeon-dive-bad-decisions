import type {
  MetaUpgradeId,
  MetaUpgradeLevels,
  ProfileState,
} from '@/src/types/profile';

export type MetaUpgradeOffer = {
  kind: 'meta-upgrade';
  id: MetaUpgradeId;
  title: string;
  subtitle: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  nextCost: number | null;
  affordable: boolean;
  shortage: number;
  exhausted: boolean;
  currentEffectLabel: string;
  nextEffectLabel: string | null;
};

type MetaUpgradeDefinition = {
  id: MetaUpgradeId;
  title: string;
  subtitle: string;
  description: string;
  maxLevel: number;
  costs: number[];
  currentEffectLabel: (level: number) => string;
  nextEffectLabel: (level: number) => string | null;
};

const metaUpgradeDefinitions: MetaUpgradeDefinition[] = [
  {
    id: 'incident-insurance',
    title: 'Incident Insurance',
    subtitle: 'Permanent durability',
    description:
      'Raises base max HP for every future run before contraband or companion modifiers pile on.',
    maxLevel: 3,
    costs: [18, 30, 46],
    currentEffectLabel: (level) => `Current bonus: +${level * 2} max HP each run.`,
    nextEffectLabel: (level) =>
      level >= 3 ? null : `Next rank: +${(level + 1) * 2} max HP each run.`,
  },
  {
    id: 'expense-padding',
    title: 'Expense Padding',
    subtitle: 'Permanent payout growth',
    description:
      'Adds extra breakroom chits to every reward claim, including event payouts and duplicate salvage.',
    maxLevel: 3,
    costs: [14, 24, 38],
    currentEffectLabel: (level) => `Current bonus: +${level * 2} chits per reward.`,
    nextEffectLabel: (level) =>
      level >= 3 ? null : `Next rank: +${(level + 1) * 2} chits per reward.`,
  },
  {
    id: 'breakroom-trauma-kit',
    title: 'Breakroom Trauma Kit',
    subtitle: 'Permanent recovery support',
    description:
      'Improves the healing attached to reward claims so longer runs recover more cleanly between disasters.',
    maxLevel: 3,
    costs: [16, 28, 42],
    currentEffectLabel: (level) =>
      `Current bonus: +${level * 3} reward healing each claim.`,
    nextEffectLabel: (level) =>
      level >= 3
        ? null
        : `Next rank: +${(level + 1) * 3} reward healing each claim.`,
  },
];

const defaultMetaUpgradeLevels: MetaUpgradeLevels = {
  'incident-insurance': 0,
  'expense-padding': 0,
  'breakroom-trauma-kit': 0,
};

function clampLevel(value: number, maxLevel: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(maxLevel, Math.floor(value)));
}

export function getDefaultMetaUpgradeLevels(): MetaUpgradeLevels {
  return { ...defaultMetaUpgradeLevels };
}

export function normalizeMetaUpgradeLevels(
  value: Partial<Record<string, number>> | null | undefined
): MetaUpgradeLevels {
  return metaUpgradeDefinitions.reduce<MetaUpgradeLevels>((totals, definition) => {
    totals[definition.id] = clampLevel(
      value?.[definition.id] ?? defaultMetaUpgradeLevels[definition.id],
      definition.maxLevel
    );
    return totals;
  }, getDefaultMetaUpgradeLevels());
}

export function buildMetaUpgradeCatalog(
  profile: Pick<ProfileState, 'metaCurrency' | 'metaUpgradeLevels'>
): MetaUpgradeOffer[] {
  const levels = normalizeMetaUpgradeLevels(profile.metaUpgradeLevels);

  return metaUpgradeDefinitions.map((definition) => {
    const currentLevel = levels[definition.id];
    const exhausted = currentLevel >= definition.maxLevel;
    const nextCost = exhausted ? null : definition.costs[currentLevel] ?? null;
    const shortage =
      nextCost == null ? 0 : Math.max(0, nextCost - profile.metaCurrency);

    return {
      kind: 'meta-upgrade',
      id: definition.id,
      title: definition.title,
      subtitle: definition.subtitle,
      description: definition.description,
      currentLevel,
      maxLevel: definition.maxLevel,
      nextCost,
      affordable: !exhausted && shortage === 0,
      shortage,
      exhausted,
      currentEffectLabel: definition.currentEffectLabel(currentLevel),
      nextEffectLabel: definition.nextEffectLabel(currentLevel),
    };
  });
}

export function purchaseMetaUpgrade(
  profile: ProfileState,
  upgradeId: MetaUpgradeId
): ProfileState {
  const offer = buildMetaUpgradeCatalog(profile).find(
    (candidate) => candidate.id === upgradeId
  );

  if (!offer) {
    throw new Error('That operations upgrade could not be found.');
  }

  if (offer.exhausted) {
    throw new Error(`${offer.title} is already fully upgraded.`);
  }

  if (!offer.affordable || offer.nextCost == null) {
    throw new Error(
      `Need ${offer.shortage} more chit${offer.shortage === 1 ? '' : 's'} to improve ${offer.title}.`
    );
  }

  const levels = normalizeMetaUpgradeLevels(profile.metaUpgradeLevels);

  return {
    ...profile,
    metaCurrency: Math.max(0, profile.metaCurrency - offer.nextCost),
    metaUpgradeLevels: {
      ...levels,
      [upgradeId]: levels[upgradeId] + 1,
    },
  };
}

export function getMetaUpgradeMaxHpBonus(levels: MetaUpgradeLevels) {
  return normalizeMetaUpgradeLevels(levels)['incident-insurance'] * 2;
}

export function getMetaUpgradeRewardCurrencyBonus(levels: MetaUpgradeLevels) {
  return normalizeMetaUpgradeLevels(levels)['expense-padding'] * 2;
}

export function getMetaUpgradeRewardHealingBonus(levels: MetaUpgradeLevels) {
  return normalizeMetaUpgradeLevels(levels)['breakroom-trauma-kit'] * 3;
}
