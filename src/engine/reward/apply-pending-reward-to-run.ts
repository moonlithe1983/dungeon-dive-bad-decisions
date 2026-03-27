import { getMetaUpgradeRewardHealingBonus } from '@/src/engine/meta/meta-upgrade-engine';
import {
  sumRunCombatModifiers,
  getRunItemModifiers,
  normalizeRunHeroState,
} from '@/src/engine/run/run-hero';
import { getRunCompanionModifiers } from '@/src/engine/bond/companion-perks';
import type { PendingRewardState, RunState } from '@/src/types/run';

export type RunRewardApplicationResult = {
  run: RunState;
  addedRunItemId: string | null;
  healingApplied: number;
  maxHpDelta: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function applyPendingRewardToRun(
  run: RunState,
  reward: PendingRewardState
): RunRewardApplicationResult {
  const nextInventoryItemIds = reward.itemId
    ? Array.from(new Set([...run.inventoryItemIds, reward.itemId]))
    : run.inventoryItemIds;
  const addedRunItemId =
    reward.itemId && !run.inventoryItemIds.includes(reward.itemId)
      ? reward.itemId
      : null;
  const nextHeroBase = normalizeRunHeroState({
    classId: run.heroClassId,
    inventoryItemIds: nextInventoryItemIds,
    metaUpgradeLevels: run.metaUpgradeLevels,
    hero: run.hero,
    fallbackCurrentHp: run.hero.currentHp,
  });
  const maxHpDelta = nextHeroBase.maxHp - run.hero.maxHp;
  const rewardHealingBonus = sumRunCombatModifiers([
    getRunItemModifiers(nextInventoryItemIds),
    getRunCompanionModifiers(run),
  ]).rewardHealingBonus;
  const rawHealing =
    Math.max(0, Math.floor(reward.runHealing)) +
    rewardHealingBonus +
    getMetaUpgradeRewardHealingBonus(run.metaUpgradeLevels);
  const healedCurrentHp = clamp(
    nextHeroBase.currentHp + Math.max(0, maxHpDelta) + rawHealing,
    0,
    nextHeroBase.maxHp
  );

  return {
    run: {
      ...run,
      hero: {
        currentHp: healedCurrentHp,
        maxHp: nextHeroBase.maxHp,
      },
      inventoryItemIds: nextInventoryItemIds,
    },
    addedRunItemId,
    healingApplied: healedCurrentHp - run.hero.currentHp,
    maxHpDelta,
  };
}
