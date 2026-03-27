import type {
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
  const locationLabel = input.currentNodeLabel
    ? ` in ${input.currentNodeLabel}`
    : '';

  if (input.result === 'win') {
    return {
      title: 'Dive Cleared',
      detail: input.currentNodeLabel
        ? `Finished the run by clearing ${input.currentNodeLabel} on floor ${input.run.floorIndex}.`
        : `Finished the run and exited alive on floor ${input.run.floorIndex}.`,
    };
  }

  if (input.result === 'loss') {
    return {
      title: 'Run Collapsed',
      detail: input.enemyName
        ? `Defeated by ${input.enemyName}${locationLabel} on floor ${input.run.floorIndex}.`
        : `Collapsed${locationLabel} on floor ${input.run.floorIndex}.`,
    };
  }

  return {
    title: 'Dive Abandoned',
    detail: `Archived voluntarily${locationLabel} on floor ${input.run.floorIndex}.${
      input.pendingRewardLost ? ' A pending reward was left behind.' : ''
    }`,
  };
}
