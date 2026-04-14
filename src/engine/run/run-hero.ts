import {
  getMetaUpgradeMaxHpBonus,
  normalizeMetaUpgradeLevels,
} from '@/src/engine/meta/meta-upgrade-engine';
import type { MetaUpgradeLevels } from '@/src/types/profile';
import type { RunHeroState, RunState } from '@/src/types/run';

export type ClassCombatProfile = {
  maxHp: number;
  patchDamage: [number, number];
  escalateDamage: [number, number];
  escalateSelfDamage: [number, number];
  stabilizeHealing: [number, number];
};

export type RunCombatModifiers = {
  maxHpBonus: number;
  patchDamageBonus: number;
  escalateDamageBonus: number;
  stabilizeHealingBonus: number;
  incomingDamageReduction: number;
  combatStartHeal: number;
  rewardHealingBonus: number;
  openingActionDamageBonus: number;
  repeatPatchDamageBonus: number;
  highHpEscalateDamageBonus: number;
  escalateSelfDamageBonus: number;
  patchRetaliationReduction: number;
  escalateRetaliationReduction: number;
  lowHpStabilizeHealingBonus: number;
  stabilizeDamageBonus: number;
};

export type RunItemModifiers = RunCombatModifiers;

const defaultRunCombatModifiers: RunCombatModifiers = {
  maxHpBonus: 0,
  patchDamageBonus: 0,
  escalateDamageBonus: 0,
  stabilizeHealingBonus: 0,
  incomingDamageReduction: 0,
  combatStartHeal: 0,
  rewardHealingBonus: 0,
  openingActionDamageBonus: 0,
  repeatPatchDamageBonus: 0,
  highHpEscalateDamageBonus: 0,
  escalateSelfDamageBonus: 0,
  patchRetaliationReduction: 0,
  escalateRetaliationReduction: 0,
  lowHpStabilizeHealingBonus: 0,
  stabilizeDamageBonus: 0,
};

const classCombatProfiles: Record<string, ClassCombatProfile> = {
  'it-support': {
    maxHp: 38,
    patchDamage: [6, 9],
    escalateDamage: [10, 13],
    escalateSelfDamage: [1, 2],
    stabilizeHealing: [5, 7],
  },
  'customer-service-rep': {
    maxHp: 42,
    patchDamage: [5, 8],
    escalateDamage: [9, 12],
    escalateSelfDamage: [1, 2],
    stabilizeHealing: [6, 8],
  },
  'sales-rep': {
    maxHp: 34,
    patchDamage: [7, 9],
    escalateDamage: [11, 14],
    escalateSelfDamage: [2, 3],
    stabilizeHealing: [4, 6],
  },
  intern: {
    maxHp: 32,
    patchDamage: [5, 8],
    escalateDamage: [12, 15],
    escalateSelfDamage: [2, 4],
    stabilizeHealing: [4, 7],
  },
  paralegal: {
    maxHp: 36,
    patchDamage: [7, 10],
    escalateDamage: [9, 12],
    escalateSelfDamage: [1, 2],
    stabilizeHealing: [5, 6],
  },
};

const runItemModifiersById: Record<string, Partial<RunItemModifiers>> = {
  'reply-all-amulet': {
    patchDamageBonus: 1,
    repeatPatchDamageBonus: 2,
  },
  'bottomless-breakroom-coffee': {
    combatStartHeal: 4,
    escalateSelfDamageBonus: 1,
  },
  'suspicious-kpi-dashboard': {
    escalateDamageBonus: 1,
    highHpEscalateDamageBonus: 2,
  },
  'motivational-katana': {
    patchDamageBonus: 1,
    escalateDamageBonus: 1,
    openingActionDamageBonus: 2,
  },
  'corporate-card-of-dubious-origin': {
    maxHpBonus: 4,
    openingActionDamageBonus: 1,
    escalateSelfDamageBonus: 1,
  },
  'printer-toner-grenade': {
    patchDamageBonus: 1,
    patchRetaliationReduction: 2,
  },
  'pto-voucher': {
    rewardHealingBonus: 4,
    lowHpStabilizeHealingBonus: 3,
  },
  'stress-ball-of-impact': {
    stabilizeHealingBonus: 1,
    stabilizeDamageBonus: 2,
  },
  'synergy-stone': {
    maxHpBonus: 2,
    incomingDamageReduction: 1,
    highHpEscalateDamageBonus: 1,
  },
  'calendar-invite-from-hell': {
    escalateDamageBonus: 1,
    incomingDamageReduction: 1,
    escalateRetaliationReduction: 2,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function sumRunCombatModifiers(
  modifierSets: (Partial<RunCombatModifiers> | null | undefined)[]
): RunCombatModifiers {
  return modifierSets.reduce<RunCombatModifiers>(
    (totals, modifiers) => {
      if (!modifiers) {
        return totals;
      }

      return {
        maxHpBonus: totals.maxHpBonus + (modifiers.maxHpBonus ?? 0),
        patchDamageBonus:
          totals.patchDamageBonus + (modifiers.patchDamageBonus ?? 0),
        escalateDamageBonus:
          totals.escalateDamageBonus + (modifiers.escalateDamageBonus ?? 0),
        stabilizeHealingBonus:
          totals.stabilizeHealingBonus + (modifiers.stabilizeHealingBonus ?? 0),
        incomingDamageReduction:
          totals.incomingDamageReduction +
          (modifiers.incomingDamageReduction ?? 0),
        combatStartHeal: totals.combatStartHeal + (modifiers.combatStartHeal ?? 0),
        rewardHealingBonus:
          totals.rewardHealingBonus + (modifiers.rewardHealingBonus ?? 0),
        openingActionDamageBonus:
          totals.openingActionDamageBonus +
          (modifiers.openingActionDamageBonus ?? 0),
        repeatPatchDamageBonus:
          totals.repeatPatchDamageBonus +
          (modifiers.repeatPatchDamageBonus ?? 0),
        highHpEscalateDamageBonus:
          totals.highHpEscalateDamageBonus +
          (modifiers.highHpEscalateDamageBonus ?? 0),
        escalateSelfDamageBonus:
          totals.escalateSelfDamageBonus +
          (modifiers.escalateSelfDamageBonus ?? 0),
        patchRetaliationReduction:
          totals.patchRetaliationReduction +
          (modifiers.patchRetaliationReduction ?? 0),
        escalateRetaliationReduction:
          totals.escalateRetaliationReduction +
          (modifiers.escalateRetaliationReduction ?? 0),
        lowHpStabilizeHealingBonus:
          totals.lowHpStabilizeHealingBonus +
          (modifiers.lowHpStabilizeHealingBonus ?? 0),
        stabilizeDamageBonus:
          totals.stabilizeDamageBonus + (modifiers.stabilizeDamageBonus ?? 0),
      };
    },
    { ...defaultRunCombatModifiers }
  );
}

export function getClassCombatProfile(classId: string) {
  return classCombatProfiles[classId] ?? classCombatProfiles['it-support'];
}

export function getRunItemModifiers(itemIds: string[]): RunItemModifiers {
  const uniqueItemIds = Array.from(new Set(itemIds));

  return sumRunCombatModifiers(
    uniqueItemIds.map((itemId) => runItemModifiersById[itemId] ?? null)
  );
}

export function getRunHeroMaxHp(
  classId: string,
  inventoryItemIds: string[],
  metaUpgradeLevels?: MetaUpgradeLevels
) {
  const baseProfile = getClassCombatProfile(classId);
  const itemModifiers = getRunItemModifiers(inventoryItemIds);
  const metaUpgradeBonus = getMetaUpgradeMaxHpBonus(
    normalizeMetaUpgradeLevels(metaUpgradeLevels)
  );

  return Math.max(1, baseProfile.maxHp + itemModifiers.maxHpBonus + metaUpgradeBonus);
}

export function createInitialRunHeroState(
  classId: string,
  metaUpgradeLevels?: MetaUpgradeLevels
): RunHeroState {
  const maxHp = getRunHeroMaxHp(classId, [], metaUpgradeLevels);

  return {
    currentHp: maxHp,
    maxHp,
  };
}

export function normalizeRunHeroState({
  classId,
  inventoryItemIds,
  metaUpgradeLevels,
  hero,
  fallbackCurrentHp,
}: {
  classId: string;
  inventoryItemIds: string[];
  metaUpgradeLevels?: MetaUpgradeLevels;
  hero?: Partial<RunHeroState> | null;
  fallbackCurrentHp?: number | null;
}): RunHeroState {
  const maxHp = getRunHeroMaxHp(
    classId,
    inventoryItemIds,
    metaUpgradeLevels
  );
  const rawCurrentHp =
    typeof fallbackCurrentHp === 'number' ? fallbackCurrentHp : hero?.currentHp;
  const resolvedCurrentHp =
    typeof rawCurrentHp === 'number' && Number.isFinite(rawCurrentHp)
      ? Math.floor(rawCurrentHp)
      : maxHp;
  const currentHp = clamp(
    resolvedCurrentHp,
    0,
    maxHp
  );

  return {
    currentHp,
    maxHp,
  };
}

export function syncRunHeroState(run: RunState, currentHp: number): RunState {
  return {
    ...run,
    hero: normalizeRunHeroState({
      classId: run.heroClassId,
      inventoryItemIds: run.inventoryItemIds,
      metaUpgradeLevels: run.metaUpgradeLevels,
      hero: run.hero,
      fallbackCurrentHp: currentHp,
    }),
  };
}
