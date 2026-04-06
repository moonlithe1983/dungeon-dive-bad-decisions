import { createAuthoredDefeatRecommendation } from '@/src/content/authored-voice';
import {
  createTicketFailureLead,
  createTicketOutcomeCopy,
} from '@/src/content/company-lore';
import { formatCombatStatusLabel } from '@/src/engine/battle/combat-statuses';
import type { CombatState } from '@/src/types/combat';
import type {
  ArchivedRunDefeatSummary,
  ArchivedRunOutcomeNote,
  ArchivedRunResult,
  RunNodeKind,
  RunProgressStats,
  RunState,
} from '@/src/types/run';

type RunProgressDelta = {
  rewardsClaimed?: number;
  metaCurrencyEarned?: number;
  damageTaken?: number;
  healingReceived?: number;
  collectedItemId?: string | null;
};

function clampToNonNegativeInteger(value: number | null | undefined) {
  if (!Number.isFinite(value ?? Number.NaN)) {
    return 0;
  }

  return Math.max(0, Math.floor(value ?? 0));
}

export function createEmptyRunProgressStats(): RunProgressStats {
  return {
    nodesResolved: 0,
    battlesWon: 0,
    eventsResolved: 0,
    rewardsClaimed: 0,
    metaCurrencyEarned: 0,
    damageTaken: 0,
    healingReceived: 0,
    collectedItemIds: [],
  };
}

export function normalizeRunProgressStats(
  stats: RunProgressStats | null | undefined
): RunProgressStats {
  if (!stats) {
    return createEmptyRunProgressStats();
  }

  return {
    nodesResolved: clampToNonNegativeInteger(stats.nodesResolved),
    battlesWon: clampToNonNegativeInteger(stats.battlesWon),
    eventsResolved: clampToNonNegativeInteger(stats.eventsResolved),
    rewardsClaimed: clampToNonNegativeInteger(stats.rewardsClaimed),
    metaCurrencyEarned: clampToNonNegativeInteger(stats.metaCurrencyEarned),
    damageTaken: clampToNonNegativeInteger(stats.damageTaken),
    healingReceived: clampToNonNegativeInteger(stats.healingReceived),
    collectedItemIds: Array.from(
      new Set(
        (stats.collectedItemIds ?? []).filter(
          (itemId) => typeof itemId === 'string' && itemId.trim().length > 0
        )
      )
    ),
  };
}

export function applyRunProgressDelta(
  run: RunState,
  delta: RunProgressDelta
): RunState {
  const currentStats = normalizeRunProgressStats(run.stats);
  const nextCollectedItemIds = delta.collectedItemId
    ? Array.from(new Set([...currentStats.collectedItemIds, delta.collectedItemId]))
    : currentStats.collectedItemIds;

  return {
    ...run,
    stats: {
      ...currentStats,
      rewardsClaimed:
        currentStats.rewardsClaimed +
        clampToNonNegativeInteger(delta.rewardsClaimed),
      metaCurrencyEarned:
        currentStats.metaCurrencyEarned +
        clampToNonNegativeInteger(delta.metaCurrencyEarned),
      damageTaken:
        currentStats.damageTaken + clampToNonNegativeInteger(delta.damageTaken),
      healingReceived:
        currentStats.healingReceived +
        clampToNonNegativeInteger(delta.healingReceived),
      collectedItemIds: nextCollectedItemIds,
    },
  };
}

export function applyResolvedNodeProgress(
  run: RunState,
  resolvedNodeKind: RunNodeKind
): RunState {
  const currentStats = normalizeRunProgressStats(run.stats);

  return {
    ...run,
    stats: {
      ...currentStats,
      nodesResolved: currentStats.nodesResolved + 1,
      battlesWon:
        currentStats.battlesWon +
        (resolvedNodeKind === 'battle' || resolvedNodeKind === 'boss' ? 1 : 0),
      eventsResolved:
        currentStats.eventsResolved + (resolvedNodeKind === 'event' ? 1 : 0),
    },
  };
}

export function createArchivedRunOutcomeNote(input: {
  result: ArchivedRunResult;
  run: RunState;
  currentNodeLabel?: string | null;
  enemyName?: string | null;
  pendingRewardLost?: boolean;
}): ArchivedRunOutcomeNote {
  return createTicketOutcomeCopy({
    result: input.result,
    classId: input.run.heroClassId,
    floorIndex: input.run.floorIndex,
    currentNodeLabel: input.currentNodeLabel,
    enemyName: input.enemyName,
    pendingRewardLost: input.pendingRewardLost,
  });
}

function pickDefeatFinalBlow(combat: CombatState) {
  const meaningfulLine = [...combat.log]
    .reverse()
    .find(
      (entry) =>
        !entry.includes('The office wins this round') &&
        !entry.includes('You collapse under the combined weight') &&
        !entry.includes('Your run is over')
    );

  return meaningfulLine ?? `${combat.enemy.name} finished the exchange before you could recover.`;
}

function createDefeatRecommendation(combat: CombatState) {
  return createAuthoredDefeatRecommendation(combat);
}

export function createArchivedRunDefeatSummary(input: {
  run: RunState;
  combat: CombatState;
  currentNodeLabel: string;
}): ArchivedRunDefeatSummary {
  const stageLead = createTicketFailureLead({
    classId: input.run.heroClassId,
    floorIndex: input.run.floorIndex,
    currentNodeLabel: input.currentNodeLabel,
    enemyName: input.combat.enemy.name,
  });

  return {
    nodeLabel: input.currentNodeLabel,
    enemyName: input.combat.enemy.name,
    enemyIntent: input.combat.enemy.intent,
    finalBlow: pickDefeatFinalBlow(input.combat),
    heroStatusLabels: input.combat.heroStatuses.map(formatCombatStatusLabel),
    enemyStatusLabels: input.combat.enemyStatuses.map(formatCombatStatusLabel),
    recommendation: `${stageLead} ${createDefeatRecommendation(input.combat)}`,
  };
}
