import { getCompanionDefinition } from '@/src/content/companions';
import type { RunCombatModifiers } from '@/src/engine/run/run-hero';
import { sumRunCombatModifiers } from '@/src/engine/run/run-hero';

type CompanionSupportRole = 'active' | 'reserve';
type BondMilestone = 1 | 3 | 5;

type CompanionPerkDefinition = {
  title: string;
  summary: string;
  modifiers: Partial<RunCombatModifiers>;
};

type RunCompanionPerkInput = {
  chosenCompanionIds: string[];
  activeCompanionId: string;
  companionBondLevels: Record<string, number>;
};

export type CompanionSupportCard = {
  companionId: string;
  companionName: string;
  role: CompanionSupportRole;
  bondLevel: number;
  title: string;
  summary: string;
  nextUpgradeSummary: string | null;
};

function clampBondLevel(level: number) {
  return Math.max(1, Math.floor(Number.isFinite(level) ? level : 1));
}

function getBondMilestone(level: number): BondMilestone {
  if (level >= 5) {
    return 5;
  }

  if (level >= 3) {
    return 3;
  }

  return 1;
}

function getNextBondMilestone(level: number): BondMilestone | null {
  if (level < 3) {
    return 3;
  }

  if (level < 5) {
    return 5;
  }

  return null;
}

function getPerkMagnitude(milestone: BondMilestone, values: Record<BondMilestone, number>) {
  return values[milestone];
}

function buildFormerExecutiveAssistantPerk(
  role: CompanionSupportRole,
  milestone: BondMilestone
): CompanionPerkDefinition {
  if (role === 'active') {
    const bonus = getPerkMagnitude(milestone, {
      1: 1,
      3: 2,
      5: 3,
    });

    return {
      title: 'Executive Read',
      summary: `First action each combat deals +${bonus} damage.`,
      modifiers: {
        openingActionDamageBonus: bonus,
      },
    };
  }

  const reduction = getPerkMagnitude(milestone, {
    1: 1,
    3: 1,
    5: 2,
  });

  return {
    title: 'Delegated Cover',
    summary: `Patch retaliation is reduced by ${reduction}.`,
    modifiers: {
      patchRetaliationReduction: reduction,
    },
  };
}

function buildFacilitiesGoblinPerk(
  role: CompanionSupportRole,
  milestone: BondMilestone
): CompanionPerkDefinition {
  if (role === 'active') {
    const healing = getPerkMagnitude(milestone, {
      1: 2,
      3: 4,
      5: 6,
    });

    return {
      title: 'Improvised Maintenance',
      summary: `Each combat starts with +${healing} HP recovery.`,
      modifiers: {
        combatStartHeal: healing,
      },
    };
  }

  const rewardHealing = getPerkMagnitude(milestone, {
    1: 2,
    3: 3,
    5: 4,
  });

  return {
    title: 'Stolen Supplies',
    summary: `Rewards restore +${rewardHealing} extra HP.`,
    modifiers: {
      rewardHealingBonus: rewardHealing,
    },
  };
}

function buildSecuritySkeletonPerk(
  role: CompanionSupportRole,
  milestone: BondMilestone
): CompanionPerkDefinition {
  if (role === 'active') {
    const reduction = getPerkMagnitude(milestone, {
      1: 1,
      3: 2,
      5: 3,
    });

    return {
      title: 'Policy Shield',
      summary: `All incoming enemy damage is reduced by ${reduction}.`,
      modifiers: {
        incomingDamageReduction: reduction,
      },
    };
  }

  const reduction = getPerkMagnitude(milestone, {
    1: 1,
    3: 1,
    5: 2,
  });

  return {
    title: 'Threat Assessment',
    summary: `Escalate retaliation is reduced by ${reduction}.`,
    modifiers: {
      escalateRetaliationReduction: reduction,
    },
  };
}

function buildPossessedCopierPerk(
  role: CompanionSupportRole,
  milestone: BondMilestone
): CompanionPerkDefinition {
  if (role === 'active') {
    const bonus = getPerkMagnitude(milestone, {
      1: 1,
      3: 2,
      5: 3,
    });

    return {
      title: 'Duplicate Ticket',
      summary: `Repeated Patch actions deal +${bonus} damage.`,
      modifiers: {
        repeatPatchDamageBonus: bonus,
      },
    };
  }

  const damage = getPerkMagnitude(milestone, {
    1: 2,
    3: 3,
    5: 4,
  });

  return {
    title: 'Collateral Copy',
    summary: `Stabilize deals +${damage} backlash damage.`,
    modifiers: {
      stabilizeDamageBonus: damage,
    },
  };
}

function buildDisillusionedTempPerk(
  role: CompanionSupportRole,
  milestone: BondMilestone
): CompanionPerkDefinition {
  if (role === 'active') {
    const healing = getPerkMagnitude(milestone, {
      1: 2,
      3: 3,
      5: 4,
    });

    return {
      title: 'Bare-Minimum Survival',
      summary: `Low-HP Stabilize gets +${healing} healing.`,
      modifiers: {
        lowHpStabilizeHealingBonus: healing,
      },
    };
  }

  const bonus = getPerkMagnitude(milestone, {
    1: 1,
    3: 2,
    5: 3,
  });

  return {
    title: 'Last-Minute Assist',
    summary: `Escalate against healthy targets deals +${bonus} damage.`,
    modifiers: {
      highHpEscalateDamageBonus: bonus,
    },
  };
}

function buildFallbackPerk(
  role: CompanionSupportRole,
  milestone: BondMilestone
): CompanionPerkDefinition {
  if (role === 'active') {
    const bonus = getPerkMagnitude(milestone, {
      1: 1,
      3: 2,
      5: 2,
    });

    return {
      title: 'General Support',
      summary: `Opening actions deal +${bonus} damage.`,
      modifiers: {
        openingActionDamageBonus: bonus,
      },
    };
  }

  const healing = getPerkMagnitude(milestone, {
    1: 1,
    3: 2,
    5: 3,
  });

  return {
    title: 'Backline Support',
    summary: `Rewards restore +${healing} extra HP.`,
    modifiers: {
      rewardHealingBonus: healing,
    },
  };
}

function getCompanionPerkDefinition(
  companionId: string,
  role: CompanionSupportRole,
  level: number
): CompanionPerkDefinition {
  const milestone = getBondMilestone(level);

  if (companionId === 'former-executive-assistant') {
    return buildFormerExecutiveAssistantPerk(role, milestone);
  }

  if (companionId === 'facilities-goblin') {
    return buildFacilitiesGoblinPerk(role, milestone);
  }

  if (companionId === 'security-skeleton') {
    return buildSecuritySkeletonPerk(role, milestone);
  }

  if (companionId === 'possessed-copier') {
    return buildPossessedCopierPerk(role, milestone);
  }

  if (companionId === 'disillusioned-temp') {
    return buildDisillusionedTempPerk(role, milestone);
  }

  return buildFallbackPerk(role, milestone);
}

function getCompanionRole(run: RunCompanionPerkInput, companionId: string): CompanionSupportRole {
  return companionId === run.activeCompanionId ? 'active' : 'reserve';
}

export function normalizeRunCompanionBondLevels(
  chosenCompanionIds: string[],
  companionBondLevels?: Record<string, number> | null
) {
  return chosenCompanionIds.reduce<Record<string, number>>((totals, companionId) => {
    totals[companionId] = clampBondLevel(companionBondLevels?.[companionId] ?? 1);
    return totals;
  }, {});
}

export function getRunCompanionModifiers(run: RunCompanionPerkInput): RunCombatModifiers {
  const normalizedBondLevels = normalizeRunCompanionBondLevels(
    run.chosenCompanionIds,
    run.companionBondLevels
  );
  const modifiers = run.chosenCompanionIds.map((companionId) =>
    getCompanionPerkDefinition(
      companionId,
      getCompanionRole(run, companionId),
      normalizedBondLevels[companionId] ?? 1
    ).modifiers
  );

  return sumRunCombatModifiers(modifiers);
}

export function getCompanionSupportSummary(
  companionId: string,
  role: CompanionSupportRole,
  bondLevel: number
) {
  return getCompanionPerkDefinition(companionId, role, bondLevel);
}

export function getNextCompanionSupportSummary(
  companionId: string,
  role: CompanionSupportRole,
  bondLevel: number
) {
  const nextMilestone = getNextBondMilestone(bondLevel);

  if (!nextMilestone) {
    return null;
  }

  return getCompanionPerkDefinition(companionId, role, nextMilestone);
}

export function getRunCompanionSupportCards(
  run: RunCompanionPerkInput
): CompanionSupportCard[] {
  const normalizedBondLevels = normalizeRunCompanionBondLevels(
    run.chosenCompanionIds,
    run.companionBondLevels
  );

  return run.chosenCompanionIds.map((companionId) => {
    const role = getCompanionRole(run, companionId);
    const bondLevel = normalizedBondLevels[companionId] ?? 1;
    const definition = getCompanionPerkDefinition(companionId, role, bondLevel);
    const nextUpgrade = getNextCompanionSupportSummary(companionId, role, bondLevel);

    return {
      companionId,
      companionName:
        getCompanionDefinition(companionId)?.name ?? companionId,
      role,
      bondLevel,
      title: definition.title,
      summary: definition.summary,
      nextUpgradeSummary: nextUpgrade
        ? `Bond ${bondLevel < 3 ? 3 : 5}: ${nextUpgrade.summary}`
        : null,
    };
  });
}
