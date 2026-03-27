export type RunBiomeId =
  | 'open-plan-pits'
  | 'team-building-catacombs'
  | 'executive-suite';

export type ClassDefinition = {
  id: string;
  name: string;
  combatIdentity: string;
  description: string;
  unlockedByDefault?: boolean;
  unlockCost?: number;
};

export type CompanionDefinition = {
  id: string;
  name: string;
  specialty: string;
  description: string;
  unlockedByDefault?: boolean;
  unlockCost?: number;
};

export type EnemyDefinition = {
  id: string;
  name: string;
  tier: 'normal' | 'miniboss' | 'boss';
  baseHealth: number;
  intent: string;
};

export type ItemDefinition = {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare';
  effectSummary: string;
};

export type EventDefinition = {
  id: string;
  title: string;
  description: string;
  biomes: RunBiomeId[];
};

export type StatusDefinition = {
  id: string;
  name: string;
  polarity: 'buff' | 'debuff' | 'neutral';
  effectSummary: string;
};
