import {
  createCombatActionLogEntry,
  createCombatIntroLogEntries,
} from '@/src/content/combat-banter';
import { getClassActionPreview } from '@/src/content/class-actions';
import { createClassCombatIntroLine } from '@/src/content/company-lore';
import {
  getEnemyTeamCountermeasureDamageBonus,
  getEnemyTeamCountermeasureMaxHpBonus,
  getEnemyTeamCountermeasures,
} from '@/src/content/enemy-team-reactions';
import { getTeamCombatSynergyBonuses } from '@/src/content/team-synergies';
import { getStatusDefinition } from '@/src/content/statuses';
import {
  applyCombatStatus,
  consumeCombatStatusTurns,
  formatCombatStatusLabel,
  getCombatStatusIncomingDamageBonus,
  getCombatStatusOutgoingDamagePenalty,
  getCombatStatusOutgoingHealingPenalty,
  hasCombatStatus,
  removeCombatStatus,
} from '@/src/engine/battle/combat-statuses';
import { enemyDefinitions } from '@/src/content/enemies';
import { getRunCompanionModifiers } from '@/src/engine/bond/companion-perks';
import {
  getReserveCompanionId,
  getRunNodeById,
} from '@/src/engine/run/progress-run';
import {
  getClassCombatProfile,
  getRunHeroMaxHp,
  getRunItemModifiers,
  sumRunCombatModifiers,
  syncRunHeroState,
  type ClassCombatProfile,
} from '@/src/engine/run/run-hero';
import type {
  CombatActionId,
  CombatEnemyState,
  CombatState,
  CombatStatusId,
  CombatStatusState,
} from '@/src/types/combat';
import type { RunNodeState, RunState } from '@/src/types/run';
import { createId } from '@/src/utils/ids';

type CombatActionDefinition = {
  id: CombatActionId;
  label: string;
  description: string;
};

type CombatStatusApplication = {
  statusId: CombatStatusId;
  turnsRemaining: number;
  logLine: string;
};

type PerformCombatActionResult = {
  run: RunState;
  combat: CombatState;
  outcome: 'ongoing' | 'victory' | 'defeat';
};

type EncounterTuning = {
  healthMultiplier: number;
  enemyDamageRange: [number, number];
};

type CombatPreviewContext = {
  turnNumber: number;
  heroHp: number;
  heroMaxHp: number;
  lastActionId: CombatActionId | null;
  enemyCurrentHp: number;
  enemyMaxHp: number;
};

type CombatActionEffects = {
  damageBonus: number;
  healingBonus: number;
  recoilBonus: number;
  retaliationReduction: number;
  stabilizeDamage: number;
  directHeal: number;
  notes: string[];
};

const MAX_LOG_ENTRIES = 8;

const encounterTuningByTier: Record<CombatEnemyState['tier'], EncounterTuning> = {
  normal: {
    healthMultiplier: 1.05,
    enemyDamageRange: [5, 8],
  },
  miniboss: {
    healthMultiplier: 1.15,
    enemyDamageRange: [6, 9],
  },
  boss: {
    healthMultiplier: 0.95,
    enemyDamageRange: [6, 9],
  },
};

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createDeterministicRoll(
  combat: CombatState,
  key: string,
  min: number,
  max: number
) {
  const span = Math.max(1, max - min + 1);
  const hash = hashString(
    `${combat.combatId}:${combat.nodeId}:${combat.turnNumber}:${combat.rollCursor}:${key}`
  );

  return {
    value: min + (hash % span),
    nextCursor: combat.rollCursor + 1,
  };
}

function appendLog(log: string[], nextEntry: string) {
  return [...log, nextEntry].slice(-MAX_LOG_ENTRIES);
}

function applyStatusWithLog(
  log: string[],
  statuses: CombatStatusState[],
  statusApplication: CombatStatusApplication | null
) {
  if (!statusApplication) {
    return {
      log,
      statuses,
    };
  }

  return {
    log: appendLog(log, statusApplication.logLine),
    statuses: applyCombatStatus(
      statuses,
      statusApplication.statusId,
      statusApplication.turnsRemaining
    ),
  };
}

function removeFirstHeroStatus(combat: CombatState) {
  const statusToRemove = combat.heroStatuses[0] ?? null;

  if (!statusToRemove) {
    return {
      combat,
      removedStatus: null as CombatStatusState | null,
    };
  }

  return {
    combat: {
      ...combat,
      heroStatuses: removeCombatStatus(combat.heroStatuses, statusToRemove.id),
    },
    removedStatus: statusToRemove,
  };
}

function getClassActionStatusNote(run: RunState, actionId: CombatActionId) {
  if (run.heroClassId === 'it-support' && actionId === 'patch') {
    return 'Inflicts On Hold for the enemy retaliation window.';
  }

  if (run.heroClassId === 'it-support' && actionId === 'stabilize') {
    return 'Also clears one hero status after the heal resolves.';
  }

  if (run.heroClassId === 'customer-service-rep' && actionId === 'patch') {
    return "Applies CC'd to widen the consequences.";
  }

  if (run.heroClassId === 'sales-rep' && actionId === 'escalate') {
    return 'Applies Escalated to amplify follow-up hits.';
  }

  if (run.heroClassId === 'intern' && actionId === 'stabilize') {
    return 'Also inflicts Burnout on the enemy while you keep somehow surviving.';
  }

  if (run.heroClassId === 'paralegal' && actionId === 'patch') {
    return 'Applies Micromanaged to punish the next response.';
  }

  if (run.heroClassId === 'paralegal' && actionId === 'stabilize') {
    return 'Also places the enemy On Hold for the retaliation window.';
  }

  return null;
}

function createClassActionStatusApplication(
  run: RunState,
  actionId: CombatActionId,
  enemyName: string
): CombatStatusApplication | null {
  if (run.heroClassId === 'it-support' && actionId === 'patch') {
    return {
      statusId: 'on-hold',
      turnsRemaining: 1,
      logLine: `${enemyName} is placed On Hold.`,
    };
  }

  if (run.heroClassId === 'customer-service-rep' && actionId === 'patch') {
    return {
      statusId: 'ccd',
      turnsRemaining: 2,
      logLine: `${enemyName} gets CC'd into a bigger problem.`,
    };
  }

  if (run.heroClassId === 'sales-rep' && actionId === 'escalate') {
    return {
      statusId: 'escalated',
      turnsRemaining: 2,
      logLine: `${enemyName} is now Escalated.`,
    };
  }

  if (run.heroClassId === 'intern' && actionId === 'stabilize') {
    return {
      statusId: 'burnout',
      turnsRemaining: 2,
      logLine: `${enemyName} picks up Burnout while you somehow recover.`,
    };
  }

  if (run.heroClassId === 'paralegal' && actionId === 'patch') {
    return {
      statusId: 'micromanaged',
      turnsRemaining: 2,
      logLine: `${enemyName} is now Micromanaged.`,
    };
  }

  if (run.heroClassId === 'paralegal' && actionId === 'stabilize') {
    return {
      statusId: 'on-hold',
      turnsRemaining: 1,
      logLine: `${enemyName} is locked On Hold.`,
    };
  }

  return null;
}

function createEnemyStatusApplication(
  enemyId: string,
  enemyName: string
): CombatStatusApplication | null {
  if (
    enemyId === 'meeting-leech' ||
    enemyId === 'survey-revenant' ||
    enemyId === 'performance-review-slime'
  ) {
    return {
      statusId: 'burnout',
      turnsRemaining: 2,
      logLine: `You pick up Burnout from ${enemyName}.`,
    };
  }

  if (
    enemyId === 'policy-wisp' ||
    enemyId === 'compliance-mite' ||
    enemyId === 'middle-manager-echo'
  ) {
    return {
      statusId: 'micromanaged',
      turnsRemaining: 2,
      logLine: `You are now Micromanaged by ${enemyName}.`,
    };
  }

  if (
    enemyId === 'calendar-worm' ||
    enemyId === 'procurement-horror' ||
    enemyId === 'legacy-system-beast'
  ) {
    return {
      statusId: 'on-hold',
      turnsRemaining: 1,
      logLine: `${enemyName} puts your next move On Hold.`,
    };
  }

  if (
    enemyId === 'escalation-hound' ||
    enemyId === 'mandatory-fun-coordinator' ||
    enemyId === 'hr-compliance-director'
  ) {
    return {
      statusId: 'escalated',
      turnsRemaining: 2,
      logLine: `${enemyName} leaves you Escalated.`,
    };
  }

  if (
    enemyId === 'budget-ghoul' ||
    enemyId === 'vendor-shade' ||
    enemyId === 'payroll-abomination' ||
    enemyId === 'ticket-swarm'
  ) {
    return {
      statusId: 'ccd',
      turnsRemaining: 2,
      logLine: `${enemyName} drags too many people into it. You are now CC'd.`,
    };
  }

  return null;
}

function shouldEnemyApplyStatus(combat: CombatState, damageDealt: number) {
  if (damageDealt <= 0) {
    return false;
  }

  if (combat.enemy.tier !== 'normal') {
    return true;
  }

  return combat.turnNumber === 1;
}

function applyMinimumToRange(
  range: [number, number],
  delta: number,
  minimum: number
): [number, number] {
  return [
    Math.max(minimum, range[0] + delta),
    Math.max(minimum, range[1] + delta),
  ];
}

function getNodeCombatTier(node: RunNodeState): CombatEnemyState['tier'] {
  if (node.kind === 'boss') {
    return 'boss';
  }

  return node.sequence >= 4 ? 'miniboss' : 'normal';
}

function normalizeEnemyLookupLabel(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function pickEnemyDefinition(run: RunState, node: RunNodeState) {
  const explicitMatch = enemyDefinitions.find(
    (enemy) =>
      normalizeEnemyLookupLabel(enemy.name) ===
      normalizeEnemyLookupLabel(node.label)
  );

  if (explicitMatch) {
    return explicitMatch;
  }

  const tier = getNodeCombatTier(node);
  const candidates = enemyDefinitions.filter((enemy) => enemy.tier === tier);
  const index = hashString(`${run.seed}:${node.id}:enemy`) % candidates.length;
  return candidates[index] ?? candidates[0];
}

function getFloorDifficultyStep(floorNumber: number) {
  return Math.max(0, floorNumber - 1);
}

function getEncounterTuning(
  tier: CombatEnemyState['tier'],
  floorNumber: number
) {
  const baseTuning = encounterTuningByTier[tier];
  const floorStep = getFloorDifficultyStep(floorNumber);
  const damageBonus = Math.floor(floorStep / 3);

  return {
    healthMultiplier: baseTuning.healthMultiplier + floorStep * 0.05,
    enemyDamageRange: [
      baseTuning.enemyDamageRange[0] + damageBonus,
      baseTuning.enemyDamageRange[1] + damageBonus,
    ] as [number, number],
  };
}

function getTunedEnemyMaxHp(
  baseHealth: number,
  tier: CombatEnemyState['tier'],
  floorNumber: number
) {
  const tuning = getEncounterTuning(tier, floorNumber);
  return Math.max(1, Math.floor(baseHealth * tuning.healthMultiplier));
}

function createInitialCombatLog(run: RunState, enemy: CombatEnemyState) {
  const baseLog = [
    `${enemy.name} arrives with terrible intent and a calendar full of violence.`,
    createClassCombatIntroLine(run.heroClassId, enemy.name),
    ...createCombatIntroLogEntries({
      enemy,
      activeCompanionId: run.activeCompanionId,
      reserveCompanionId: getReserveCompanionId(run),
      companionBondLevels: run.companionBondLevels,
    }),
  ];
  const countermeasureLogEntries = getEnemyTeamCountermeasures(run, enemy.enemyId).flatMap(
    (countermeasure) => [
      countermeasure.introLine,
      ...(countermeasure.startingHeroStatuses?.map((status) => status.logLine) ?? []),
    ]
  );

  return [...baseLog, ...countermeasureLogEntries].slice(-MAX_LOG_ENTRIES);
}

function addRangeBonus(range: [number, number], bonus: number): [number, number] {
  return [range[0] + bonus, range[1] + bonus];
}

function createEmptyCombatActionEffects(): CombatActionEffects {
  return {
    damageBonus: 0,
    healingBonus: 0,
    recoilBonus: 0,
    retaliationReduction: 0,
    stabilizeDamage: 0,
    directHeal: 0,
    notes: [],
  };
}

function combineCombatActionEffects(effects: CombatActionEffects[]) {
  return effects.reduce<CombatActionEffects>(
    (combined, nextEffects) => ({
      damageBonus: combined.damageBonus + nextEffects.damageBonus,
      healingBonus: combined.healingBonus + nextEffects.healingBonus,
      recoilBonus: combined.recoilBonus + nextEffects.recoilBonus,
      retaliationReduction:
        combined.retaliationReduction + nextEffects.retaliationReduction,
      stabilizeDamage: combined.stabilizeDamage + nextEffects.stabilizeDamage,
      directHeal: combined.directHeal + nextEffects.directHeal,
      notes: [...combined.notes, ...nextEffects.notes],
    }),
    createEmptyCombatActionEffects()
  );
}

function createCombatPreviewContext(run: RunState): CombatPreviewContext {
  if (run.combatState) {
    return {
      turnNumber: run.combatState.turnNumber,
      heroHp: run.combatState.heroHp,
      heroMaxHp: run.combatState.heroMaxHp,
      lastActionId: run.combatState.lastActionId,
      enemyCurrentHp: run.combatState.enemy.currentHp,
      enemyMaxHp: run.combatState.enemy.maxHp,
    };
  }

  return {
    turnNumber: 1,
    heroHp: run.hero.currentHp,
    heroMaxHp: run.hero.maxHp,
    lastActionId: null,
    enemyCurrentHp: 1,
    enemyMaxHp: 1,
  };
}

function getEffectiveCombatProfile(run: RunState): ClassCombatProfile {
  const profile = getClassCombatProfile(run.heroClassId);
  const modifiers = sumRunCombatModifiers([
    getRunItemModifiers(run.inventoryItemIds),
    getRunCompanionModifiers(run),
  ]);

  return {
    maxHp: getRunHeroMaxHp(run.heroClassId, run.inventoryItemIds),
    patchDamage: addRangeBonus(profile.patchDamage, modifiers.patchDamageBonus),
    escalateDamage: addRangeBonus(
      profile.escalateDamage,
      modifiers.escalateDamageBonus
    ),
    escalateSelfDamage: profile.escalateSelfDamage,
    stabilizeHealing: addRangeBonus(
      profile.stabilizeHealing,
      modifiers.stabilizeHealingBonus
    ),
  };
}

function createCombatActionItemEffects(
  preview: CombatPreviewContext,
  actionId: CombatActionId,
  itemModifiers: ReturnType<typeof getRunItemModifiers>
): CombatActionEffects {
  const nextEffects = createEmptyCombatActionEffects();
  const isOpeningAction = preview.turnNumber === 1;
  const isLowHp = preview.heroHp * 2 <= preview.heroMaxHp;
  const enemyAboveHalf = preview.enemyCurrentHp * 2 > preview.enemyMaxHp;

  if (actionId !== 'stabilize' && isOpeningAction && itemModifiers.openingActionDamageBonus > 0) {
    nextEffects.damageBonus += itemModifiers.openingActionDamageBonus;
    nextEffects.notes.push(
      `Opening burst +${itemModifiers.openingActionDamageBonus} damage.`
    );
  }

  if (actionId === 'patch') {
    if (preview.lastActionId === 'patch' && itemModifiers.repeatPatchDamageBonus > 0) {
      nextEffects.damageBonus += itemModifiers.repeatPatchDamageBonus;
      nextEffects.notes.push(
        `Reply-all follow-up +${itemModifiers.repeatPatchDamageBonus} damage.`
      );
    }

    if (itemModifiers.patchRetaliationReduction > 0) {
      nextEffects.retaliationReduction += itemModifiers.patchRetaliationReduction;
      nextEffects.notes.push(
        `Retaliation reduced by ${itemModifiers.patchRetaliationReduction}.`
      );
    }
  }

  if (actionId === 'escalate') {
    if (enemyAboveHalf && itemModifiers.highHpEscalateDamageBonus > 0) {
      nextEffects.damageBonus += itemModifiers.highHpEscalateDamageBonus;
      nextEffects.notes.push(
        `Healthy-target pressure +${itemModifiers.highHpEscalateDamageBonus} damage.`
      );
    }

    if (itemModifiers.escalateSelfDamageBonus > 0) {
      nextEffects.recoilBonus += itemModifiers.escalateSelfDamageBonus;
      nextEffects.notes.push(
        `Escalate recoil +${itemModifiers.escalateSelfDamageBonus}.`
      );
    }

    if (itemModifiers.escalateRetaliationReduction > 0) {
      nextEffects.retaliationReduction += itemModifiers.escalateRetaliationReduction;
      nextEffects.notes.push(
        `Retaliation reduced by ${itemModifiers.escalateRetaliationReduction}.`
      );
    }
  }

  if (actionId === 'stabilize') {
    if (isLowHp && itemModifiers.lowHpStabilizeHealingBonus > 0) {
      nextEffects.healingBonus += itemModifiers.lowHpStabilizeHealingBonus;
      nextEffects.notes.push(
        `Low-HP recovery +${itemModifiers.lowHpStabilizeHealingBonus}.`
      );
    }

    if (itemModifiers.stabilizeDamageBonus > 0) {
      nextEffects.stabilizeDamage += itemModifiers.stabilizeDamageBonus;
      nextEffects.notes.push(
        `Stress backlash deals ${itemModifiers.stabilizeDamageBonus} damage.`
      );
    }
  }

  return nextEffects;
}

function createCombatActionClassEffects(
  run: RunState,
  preview: CombatPreviewContext,
  actionId: CombatActionId,
  heroStatuses: CombatStatusState[],
  enemyStatuses: CombatStatusState[]
): CombatActionEffects {
  const nextEffects = createEmptyCombatActionEffects();
  const heroStatusPressure = heroStatuses.length > 0;
  const enemyHasAnyStatus = enemyStatuses.length > 0;
  const enemyEscalated = hasCombatStatus(enemyStatuses, 'escalated');
  const enemyOnHold = hasCombatStatus(enemyStatuses, 'on-hold');
  const enemyMicromanaged = hasCombatStatus(enemyStatuses, 'micromanaged');
  const enemyCcd = hasCombatStatus(enemyStatuses, 'ccd');
  const heroUnderHalf = preview.heroHp * 2 <= preview.heroMaxHp;
  const compromisedTarget = enemyOnHold || enemyMicromanaged || enemyCcd;

  if (run.heroClassId === 'it-support') {
    if (actionId === 'escalate' && enemyHasAnyStatus) {
      nextEffects.damageBonus += 2;
      nextEffects.notes.push('Disrupted-target routing adds 2 damage.');
    }

    if (actionId === 'stabilize' && heroStatusPressure) {
      nextEffects.healingBonus += 1;
      nextEffects.notes.push('Status triage adds 1 healing.');
    }

    return nextEffects;
  }

  if (run.heroClassId === 'customer-service-rep') {
    if (actionId === 'patch') {
      nextEffects.directHeal += 2;
      nextEffects.notes.push('Scripted reassurance restores 2 HP.');
    }

    if (actionId === 'escalate') {
      nextEffects.retaliationReduction += 1;
      nextEffects.notes.push('Call deflection reduces retaliation by 1.');

      if (enemyCcd) {
        nextEffects.retaliationReduction += 2;
        nextEffects.notes.push("CC'd target reduces retaliation by 2 more.");
      }
    }

    if (actionId === 'stabilize' && enemyCcd) {
      nextEffects.healingBonus += 3;
      nextEffects.notes.push("CC'd target recovery adds 3 healing.");
    }

    return nextEffects;
  }

  if (run.heroClassId === 'sales-rep') {
    if (actionId === 'patch' && enemyEscalated) {
      nextEffects.damageBonus += 3;
      nextEffects.notes.push('Hot lead cashout adds 3 damage.');
    }

    if (actionId === 'escalate' && enemyEscalated) {
      nextEffects.damageBonus += 3;
      nextEffects.notes.push('Momentum close adds 3 damage.');
    }

    if (actionId === 'stabilize' && enemyEscalated) {
      nextEffects.stabilizeDamage += 2;
      nextEffects.notes.push('The pitch stays hot for 2 pressure damage.');
    }

    return nextEffects;
  }

  if (run.heroClassId === 'intern') {
    if (actionId === 'patch') {
      nextEffects.directHeal += 2;
      nextEffects.notes.push('Accidental survival restores 2 HP.');
    }

    if (actionId === 'escalate') {
      const scalingDamageBonus = Math.min(3, Math.max(0, preview.turnNumber - 1));

      if (scalingDamageBonus > 0) {
        nextEffects.damageBonus += scalingDamageBonus;
        nextEffects.notes.push(
          `Chaos scaling adds ${scalingDamageBonus} damage on turn ${preview.turnNumber}.`
        );
      }

      nextEffects.recoilBonus += 1;
      nextEffects.notes.push('Touch Everything adds 1 extra recoil.');
    }

    if (actionId === 'stabilize' && heroUnderHalf) {
      nextEffects.healingBonus += 2;
      nextEffects.notes.push('Panic recovery adds 2 healing below half HP.');
    }

    return nextEffects;
  }

  if (run.heroClassId === 'paralegal') {
    if (actionId === 'patch' && (enemyOnHold || enemyMicromanaged)) {
      nextEffects.damageBonus += 3;
      nextEffects.notes.push('Clause exploit adds 3 precision damage.');
    }

    if (actionId === 'escalate' && compromisedTarget) {
      nextEffects.damageBonus += 2;
      nextEffects.retaliationReduction += 2;
      nextEffects.notes.push(
        'Discovery leverage adds 2 damage and reduces retaliation by 2.'
      );
    }

    return nextEffects;
  }

  return nextEffects;
}

function createCombatActionTeamSynergyEffects(
  run: RunState,
  actionId: CombatActionId
): CombatActionEffects {
  const nextEffects = createEmptyCombatActionEffects();
  const synergyBonuses = getTeamCombatSynergyBonuses(run, actionId);

  for (const bonus of synergyBonuses) {
    nextEffects.damageBonus += bonus.damageBonus ?? 0;
    nextEffects.healingBonus += bonus.healingBonus ?? 0;
    nextEffects.recoilBonus += bonus.recoilBonus ?? 0;
    nextEffects.retaliationReduction += bonus.retaliationReduction ?? 0;
    nextEffects.stabilizeDamage += bonus.stabilizeDamage ?? 0;
    nextEffects.directHeal += bonus.directHeal ?? 0;
    nextEffects.notes.push(bonus.note);
  }

  return nextEffects;
}

function createActionDescription(base: string, notes: string[]) {
  if (notes.length === 0) {
    return base;
  }

  return `${base} Active modifiers: ${notes.join(' ')}`;
}

export function getCombatActionDefinitions(run: RunState): CombatActionDefinition[] {
  const profile = getEffectiveCombatProfile(run);
  const modifiers = sumRunCombatModifiers([
    getRunItemModifiers(run.inventoryItemIds),
    getRunCompanionModifiers(run),
  ]);
  const preview = createCombatPreviewContext(run);
  const heroStatuses = run.combatState?.heroStatuses ?? [];
  const enemyStatuses = run.combatState?.enemyStatuses ?? [];
  const patchEffects = combineCombatActionEffects([
    createCombatActionItemEffects(preview, 'patch', modifiers),
    createCombatActionClassEffects(
      run,
      preview,
      'patch',
      heroStatuses,
      enemyStatuses
    ),
    createCombatActionTeamSynergyEffects(run, 'patch'),
  ]);
  const escalateEffects = combineCombatActionEffects([
    createCombatActionItemEffects(preview, 'escalate', modifiers),
    createCombatActionClassEffects(
      run,
      preview,
      'escalate',
      heroStatuses,
      enemyStatuses
    ),
    createCombatActionTeamSynergyEffects(run, 'escalate'),
  ]);
  const stabilizeEffects = combineCombatActionEffects([
    createCombatActionItemEffects(preview, 'stabilize', modifiers),
    createCombatActionClassEffects(
      run,
      preview,
      'stabilize',
      heroStatuses,
      enemyStatuses
    ),
    createCombatActionTeamSynergyEffects(run, 'stabilize'),
  ]);
  const outgoingDamagePenalty = getCombatStatusOutgoingDamagePenalty(heroStatuses);
  const outgoingHealingPenalty = getCombatStatusOutgoingHealingPenalty(heroStatuses);
  const enemyIncomingDamageBonus = getCombatStatusIncomingDamageBonus(enemyStatuses);
  const statusNotes = [
    heroStatuses.length > 0
      ? `Hero status loadout: ${heroStatuses.map(formatCombatStatusLabel).join(', ')}.`
      : null,
    enemyStatuses.length > 0
      ? `Enemy status loadout: ${enemyStatuses.map(formatCombatStatusLabel).join(', ')}.`
      : null,
  ].filter((note): note is string => Boolean(note));

  return [
    {
      id: 'patch',
      label:
        getClassActionPreview(run.heroClassId, 'patch')?.label ?? 'Patch Notes',
      description: createActionDescription(
        `Deal ${
          Math.max(
            1,
            profile.patchDamage[0] +
              patchEffects.damageBonus +
              enemyIncomingDamageBonus -
              outgoingDamagePenalty
          )
        }-${Math.max(
          1,
          profile.patchDamage[1] +
            patchEffects.damageBonus +
            enemyIncomingDamageBonus -
            outgoingDamagePenalty
        )} damage with a clean, boring fix.`,
        [
          ...patchEffects.notes,
          ...statusNotes,
          ...(getClassActionStatusNote(run, 'patch')
            ? [getClassActionStatusNote(run, 'patch') as string]
            : []),
        ]
      ),
    },
    {
      id: 'escalate',
      label:
        getClassActionPreview(run.heroClassId, 'escalate')?.label ??
        'Escalate Ticket',
      description: createActionDescription(
        `Deal ${
          Math.max(
            1,
            profile.escalateDamage[0] +
              escalateEffects.damageBonus +
              enemyIncomingDamageBonus -
              outgoingDamagePenalty
          )
        }-${Math.max(
          1,
          profile.escalateDamage[1] +
            escalateEffects.damageBonus +
            enemyIncomingDamageBonus -
            outgoingDamagePenalty
        )} damage and take ${
          profile.escalateSelfDamage[0] + escalateEffects.recoilBonus
        }-${profile.escalateSelfDamage[1] + escalateEffects.recoilBonus} recoil.`,
        [
          ...escalateEffects.notes,
          ...statusNotes,
          ...(getClassActionStatusNote(run, 'escalate')
            ? [getClassActionStatusNote(run, 'escalate') as string]
            : []),
        ]
      ),
    },
    {
      id: 'stabilize',
      label:
        getClassActionPreview(run.heroClassId, 'stabilize')?.label ??
        'Stabilize Systems',
      description: createActionDescription(
        `Recover ${
          Math.max(
            1,
            profile.stabilizeHealing[0] +
              stabilizeEffects.healingBonus -
              outgoingHealingPenalty
          )
        }-${Math.max(
          1,
          profile.stabilizeHealing[1] +
            stabilizeEffects.healingBonus -
            outgoingHealingPenalty
        )} HP${
          stabilizeEffects.stabilizeDamage > 0
            ? ` and deal ${stabilizeEffects.stabilizeDamage} backlash damage`
            : ''
        } before the next policy disaster lands.`,
        [
          ...stabilizeEffects.notes,
          ...statusNotes,
          ...(getClassActionStatusNote(run, 'stabilize')
            ? [getClassActionStatusNote(run, 'stabilize') as string]
            : []),
        ]
      ),
    },
  ];
}

export function createCombatStateForCurrentNode(run: RunState): CombatState {
  if (!run.currentNodeId) {
    throw new Error('There is no active node available for combat.');
  }

  const currentNode = getRunNodeById(run, run.currentNodeId);

  if (!currentNode || (currentNode.kind !== 'battle' && currentNode.kind !== 'boss')) {
    throw new Error('The current node is not a combat encounter.');
  }

  const enemyDefinition = pickEnemyDefinition(run, currentNode);
  const profile = getEffectiveCombatProfile(run);
  const modifiers = sumRunCombatModifiers([
    getRunItemModifiers(run.inventoryItemIds),
    getRunCompanionModifiers(run),
  ]);
  const enemyCountermeasures = getEnemyTeamCountermeasures(run, enemyDefinition.id);
  const enemyMaxHp = Math.max(
    1,
    getTunedEnemyMaxHp(
      enemyDefinition.baseHealth,
      enemyDefinition.tier,
      currentNode.floorNumber
    ) +
      getEnemyTeamCountermeasureMaxHpBonus(run, enemyDefinition.id)
  );
  const startingHeroHp = Math.min(
    profile.maxHp,
    Math.max(0, run.hero.currentHp) + modifiers.combatStartHeal
  );

  if (startingHeroHp <= 0) {
    throw new Error('The active hero cannot enter combat with zero HP.');
  }

  return {
    combatId: createId('combat'),
    nodeId: currentNode.id,
    phase: 'player-turn',
    turnNumber: 1,
    heroHp: startingHeroHp,
    heroMaxHp: profile.maxHp,
    enemy: {
      enemyId: enemyDefinition.id,
      name: enemyDefinition.name,
      tier: enemyDefinition.tier,
      currentHp: enemyMaxHp,
      maxHp: enemyMaxHp,
      intent: enemyDefinition.intent,
    },
    heroStatuses: enemyCountermeasures.flatMap(
      (countermeasure) =>
        countermeasure.startingHeroStatuses?.map((status) => ({
          id: status.id,
          turnsRemaining: status.turnsRemaining,
        })) ?? []
    ),
    enemyStatuses: [],
    rollCursor: 0,
    log: createInitialCombatLog(run, {
      enemyId: enemyDefinition.id,
      name: enemyDefinition.name,
      tier: enemyDefinition.tier,
      currentHp: enemyMaxHp,
      maxHp: enemyMaxHp,
      intent: enemyDefinition.intent,
    }),
    lastActionId: null,
  };
}

export function performCombatAction(
  run: RunState,
  actionId: CombatActionId
): PerformCombatActionResult {
  const combat = run.combatState;

  if (!combat || combat.phase !== 'player-turn') {
    throw new Error('Combat is not ready for a player action.');
  }

  const profile = getEffectiveCombatProfile(run);
  const modifiers = sumRunCombatModifiers([
    getRunItemModifiers(run.inventoryItemIds),
    getRunCompanionModifiers(run),
  ]);
  const preview = createCombatPreviewContext(run);
  const nextCombat: CombatState = {
    ...combat,
    enemy: { ...combat.enemy },
    heroStatuses: [...combat.heroStatuses],
    enemyStatuses: [...combat.enemyStatuses],
    log: [...combat.log],
    lastActionId: actionId,
  };
  const actionEffects = combineCombatActionEffects([
    createCombatActionItemEffects(preview, actionId, modifiers),
    createCombatActionClassEffects(
      run,
      preview,
      actionId,
      nextCombat.heroStatuses,
      nextCombat.enemyStatuses
    ),
    createCombatActionTeamSynergyEffects(run, actionId),
  ]);
  const actionLabel =
    getClassActionPreview(run.heroClassId, actionId)?.label ??
    (actionId === 'patch'
      ? 'Patch Notes'
      : actionId === 'escalate'
        ? 'Escalate Ticket'
        : 'Stabilize Systems');
  const heroOutgoingDamagePenalty = getCombatStatusOutgoingDamagePenalty(
    nextCombat.heroStatuses
  );
  const heroOutgoingHealingPenalty = getCombatStatusOutgoingHealingPenalty(
    nextCombat.heroStatuses
  );
  const enemyIncomingDamageBonus = getCombatStatusIncomingDamageBonus(
    nextCombat.enemyStatuses
  );

  if (actionId === 'patch') {
    const patchDamageRange = applyMinimumToRange(
      [
        profile.patchDamage[0] + actionEffects.damageBonus,
        profile.patchDamage[1] + actionEffects.damageBonus,
      ],
      enemyIncomingDamageBonus - heroOutgoingDamagePenalty,
      1
    );
    const damageRoll = createDeterministicRoll(
      nextCombat,
      'patch-damage',
      patchDamageRange[0],
      patchDamageRange[1]
    );

    nextCombat.rollCursor = damageRoll.nextCursor;
    nextCombat.enemy.currentHp = Math.max(0, nextCombat.enemy.currentHp - damageRoll.value);
    nextCombat.log = appendLog(
      nextCombat.log,
      `${actionLabel} lands for ${damageRoll.value} damage.`
    );
  }

  if (actionId === 'escalate') {
    const escalateDamageRange = applyMinimumToRange(
      [
        profile.escalateDamage[0] + actionEffects.damageBonus,
        profile.escalateDamage[1] + actionEffects.damageBonus,
      ],
      enemyIncomingDamageBonus - heroOutgoingDamagePenalty,
      1
    );
    const damageRoll = createDeterministicRoll(
      nextCombat,
      'escalate-damage',
      escalateDamageRange[0],
      escalateDamageRange[1]
    );
    const recoilRoll = createDeterministicRoll(
      {
        ...nextCombat,
        rollCursor: damageRoll.nextCursor,
      },
      'escalate-recoil',
      profile.escalateSelfDamage[0] + actionEffects.recoilBonus,
      profile.escalateSelfDamage[1] + actionEffects.recoilBonus
    );

    nextCombat.rollCursor = recoilRoll.nextCursor;
    nextCombat.enemy.currentHp = Math.max(0, nextCombat.enemy.currentHp - damageRoll.value);
    nextCombat.heroHp = Math.max(0, nextCombat.heroHp - recoilRoll.value);
    nextCombat.log = appendLog(
      nextCombat.log,
      `${actionLabel} hits for ${damageRoll.value}, but the recoil costs ${recoilRoll.value} HP.`
    );
  }

  if (actionId === 'stabilize') {
    const stabilizeHealingRange = applyMinimumToRange(
      [
        profile.stabilizeHealing[0] + actionEffects.healingBonus,
        profile.stabilizeHealing[1] + actionEffects.healingBonus,
      ],
      -heroOutgoingHealingPenalty,
      1
    );
    const healRoll = createDeterministicRoll(
      nextCombat,
      'stabilize-heal',
      stabilizeHealingRange[0],
      stabilizeHealingRange[1]
    );

    nextCombat.rollCursor = healRoll.nextCursor;
    nextCombat.heroHp = Math.min(nextCombat.heroMaxHp, nextCombat.heroHp + healRoll.value);
    nextCombat.log = appendLog(
      nextCombat.log,
      `${actionLabel} restores ${healRoll.value} HP.`
    );

    if (actionEffects.stabilizeDamage > 0) {
      nextCombat.enemy.currentHp = Math.max(
        0,
        nextCombat.enemy.currentHp - actionEffects.stabilizeDamage
      );
      nextCombat.log = appendLog(
        nextCombat.log,
        `${actionLabel} keeps pressure on for ${actionEffects.stabilizeDamage} damage.`
      );
    }
  }

  if (actionEffects.directHeal > 0) {
    nextCombat.heroHp = Math.min(
      nextCombat.heroMaxHp,
      nextCombat.heroHp + actionEffects.directHeal
    );
    nextCombat.log = appendLog(
      nextCombat.log,
      `${actionLabel} restores ${actionEffects.directHeal} HP on contact.`
    );
  }

  for (const note of actionEffects.notes) {
    nextCombat.log = appendLog(nextCombat.log, note);
  }

  const classStatusApplication = createClassActionStatusApplication(
    run,
    actionId,
    nextCombat.enemy.name
  );
  const enemyStatusUpdate = applyStatusWithLog(
    nextCombat.log,
    nextCombat.enemyStatuses,
    classStatusApplication
  );
  nextCombat.log = enemyStatusUpdate.log;
  nextCombat.enemyStatuses = enemyStatusUpdate.statuses;

  if (run.heroClassId === 'it-support' && actionId === 'stabilize') {
    const cleanseResult = removeFirstHeroStatus(nextCombat);

    nextCombat.heroStatuses = cleanseResult.combat.heroStatuses;

    if (cleanseResult.removedStatus) {
      nextCombat.log = appendLog(
        nextCombat.log,
        `IT Support clears ${getStatusDefinition(cleanseResult.removedStatus.id)?.name ?? cleanseResult.removedStatus.id}.`
      );
    }
  }

  nextCombat.log = appendLog(
    nextCombat.log,
    createCombatActionLogEntry({
      enemy: nextCombat.enemy,
      actionId,
      activeCompanionId: run.activeCompanionId,
      reserveCompanionId: getReserveCompanionId(run),
      companionBondLevels: run.companionBondLevels,
      heroHp: nextCombat.heroHp,
      heroMaxHp: nextCombat.heroMaxHp,
      enemyCurrentHp: nextCombat.enemy.currentHp,
      enemyMaxHp: nextCombat.enemy.maxHp,
    })
  );
  nextCombat.heroStatuses = consumeCombatStatusTurns(nextCombat.heroStatuses);

  if (nextCombat.enemy.currentHp <= 0) {
    nextCombat.phase = 'victory';
    nextCombat.log = appendLog(
      nextCombat.log,
      `${nextCombat.enemy.name} folds under the paperwork.`
    );

    return {
      run: syncRunHeroState(
        {
          ...run,
          combatState: nextCombat,
        },
        nextCombat.heroHp
      ),
      combat: nextCombat,
      outcome: 'victory',
    };
  }

  if (nextCombat.heroHp <= 0) {
    nextCombat.phase = 'defeat';
    nextCombat.log = appendLog(
      nextCombat.log,
      'You collapse under the combined weight of process and consequences.'
    );

    return {
      run: syncRunHeroState(
        {
          ...run,
          runStatus: 'failed',
          combatState: nextCombat,
        },
        nextCombat.heroHp
      ),
      combat: nextCombat,
      outcome: 'defeat',
    };
  }

  const currentNode = getRunNodeById(run, nextCombat.nodeId);
  const enemyDamageRange = getEncounterTuning(
    nextCombat.enemy.tier,
    currentNode?.floorNumber ?? run.floorIndex
  ).enemyDamageRange;
  const enemyOutgoingDamagePenalty = getCombatStatusOutgoingDamagePenalty(
    nextCombat.enemyStatuses
  );
  const heroIncomingDamageBonus = getCombatStatusIncomingDamageBonus(
    nextCombat.heroStatuses
  );
  const enemyCountermeasureDamageBonus = getEnemyTeamCountermeasureDamageBonus(
    run,
    nextCombat.enemy.enemyId
  );
  const tunedEnemyDamageRange = applyMinimumToRange(
    enemyDamageRange,
    enemyCountermeasureDamageBonus -
      enemyOutgoingDamagePenalty +
      heroIncomingDamageBonus,
    0
  );
  const enemyDamageRoll = createDeterministicRoll(
    nextCombat,
    'enemy-damage',
    tunedEnemyDamageRange[0],
    tunedEnemyDamageRange[1]
  );
  const mitigatedEnemyDamage = Math.max(
    0,
    enemyDamageRoll.value -
      modifiers.incomingDamageReduction -
      actionEffects.retaliationReduction
  );

  nextCombat.rollCursor = enemyDamageRoll.nextCursor;
  nextCombat.heroHp = Math.max(0, nextCombat.heroHp - mitigatedEnemyDamage);
  nextCombat.log = appendLog(
    nextCombat.log,
    mitigatedEnemyDamage > 0
      ? `${nextCombat.enemy.name} hits back for ${mitigatedEnemyDamage} damage.`
      : `${nextCombat.enemy.name} tries to hit back, but the timing collapses into nothing.`
  );
  nextCombat.enemyStatuses = consumeCombatStatusTurns(nextCombat.enemyStatuses);
  const heroStatusApplication = createEnemyStatusApplication(
    nextCombat.enemy.enemyId,
    nextCombat.enemy.name
  );

  if (
    heroStatusApplication &&
    shouldEnemyApplyStatus(nextCombat, mitigatedEnemyDamage) &&
    !hasCombatStatus(nextCombat.heroStatuses, heroStatusApplication.statusId)
  ) {
    const heroStatusUpdate = applyStatusWithLog(
      nextCombat.log,
      nextCombat.heroStatuses,
      heroStatusApplication
    );

    nextCombat.log = heroStatusUpdate.log;
    nextCombat.heroStatuses = heroStatusUpdate.statuses;
  }

  if (nextCombat.heroHp <= 0) {
    nextCombat.phase = 'defeat';
    nextCombat.log = appendLog(
      nextCombat.log,
      'The office wins this round. Your run is over.'
    );

    return {
      run: syncRunHeroState(
        {
          ...run,
          runStatus: 'failed',
          combatState: nextCombat,
        },
        nextCombat.heroHp
      ),
      combat: nextCombat,
      outcome: 'defeat',
    };
  }

  nextCombat.phase = 'player-turn';
  nextCombat.turnNumber += 1;

  return {
    run: syncRunHeroState(
      {
        ...run,
        combatState: nextCombat,
      },
      nextCombat.heroHp
    ),
    combat: nextCombat,
    outcome: 'ongoing',
  };
}
