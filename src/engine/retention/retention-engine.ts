import { getBondScenesUnlockedByBondGains } from '@/src/content/bond-scenes';
import { getClassDefinition } from '@/src/content/classes';
import { getCompanionDefinition } from '@/src/content/companions';
import {
  buildRequisitionCatalog,
  type RequisitionKind,
} from '@/src/engine/meta/requisition-engine';
import {
  DEFAULT_RETENTION_STATE,
  type ArchivedRunRetentionSummary,
  type EndingStateId,
  type MomentumBonusState,
  type ProbationContractState,
  type ProfileState,
  type QuarterlyChallengeState,
  type QuarterlyTierHistoryEntry,
  type QuarterlyTierId,
  type RelationshipLadderState,
  type RetentionState,
  type RosterLadderState,
  type TruthLadderState,
  type TruthRouteId,
} from '@/src/types/profile';
import type { ArchivedRunBondGain, ArchivedRunResult, RunState } from '@/src/types/run';
import { createTimestamp } from '@/src/utils/time';

const DECAY_STEP_DAYS = 3;
const DECAY_POINTS_PER_STEP = 5;
const ROSTER_BASE_BONUS = 12;
const ROSTER_SHORTAGE_BUFFER = 6;
const MOMENTUM_DEFAULT_TARGET_RUNS = 3;
const MOMENTUM_DEFAULT_BONUS = 8;
const PROBATION_DEFAULT_TARGET_RUNS = 3;
const PROBATION_DEFAULT_REWARD = 18;
const PROBATION_DEFAULT_PENALTY = 12;
const QUARTERLY_HISTORY_LIMIT = 8;
const PAIR_SEPARATOR = '::';
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type TruthRouteDefinition = {
  routeId: TruthRouteId;
  label: string;
  shortLabel: string;
  body: string;
};

type EndingStateDefinition = {
  id: EndingStateId;
  label: string;
  body: string;
};

type QuarterlyTierDefinition = {
  id: QuarterlyTierId;
  label: string;
  threshold: number;
  rewardCurrency: number;
};

type QuarterlyStateComputation = {
  state: QuarterlyChallengeState;
  decayApplied: number;
};

type RetentionApplyResult = {
  profile: ProfileState;
  run: RunState;
  summary: ArchivedRunRetentionSummary;
};

const truthRouteDefinitions: Record<string, TruthRouteDefinition> = {
  'it-support': {
    routeId: 'force-the-truth-to-surface',
    label: 'Force the truth to surface',
    shortLabel: 'Truth route',
    body:
      'Best at dragging buried damage into daylight and turning a clean clear into a testimony run.',
  },
  'sales-rep': {
    routeId: 'authenticate-with-stolen-authority',
    label: 'Authenticate with stolen authority',
    shortLabel: 'Authority route',
    body:
      'Best at weaponizing access, bluff, and executive theater to turn stolen clearance into a finish.',
  },
  paralegal: {
    routeId: 'complete-the-proof-chain-cleanly',
    label: 'Complete the proof chain cleanly',
    shortLabel: 'Proof-chain route',
    body:
      'Best at preserving a clean record so the archive can connect every contradiction without the case collapsing.',
  },
  intern: {
    routeId: 'risky-proof-acquisition',
    label: 'Risky proof acquisition',
    shortLabel: 'Scavenger route',
    body:
      'Best at weird salvage runs, volatile shortcuts, and finding the evidence nobody should have survived retrieving.',
  },
  'customer-service-rep': {
    routeId: 'survival-heavy-clear',
    label: 'Survival-heavy clear',
    shortLabel: 'Survival route',
    body:
      'Best at ugly clears where endurance, damage control, and keeping the room together matters more than elegance.',
  },
};

export const endingStateDefinitions: EndingStateDefinition[] = [
  {
    id: 'quiet-survival',
    label: 'Quiet Survival',
    body: 'You got out alive and left testimony unfinished, but not erased.',
  },
  {
    id: 'licensed-survival',
    label: 'Licensed Survival',
    body: 'The record still tries to localize the damage and keep the badge polished.',
  },
  {
    id: 'partial-exposure',
    label: 'Partial Exposure',
    body: 'You climbed high enough for the confession to start forming before it broke apart.',
  },
  {
    id: 'controlled-detonation',
    label: 'Controlled Detonation',
    body: 'You closed the incident, but the blast radius stayed narrower than a total exposure ending.',
  },
  {
    id: 'full-exposure',
    label: 'Full Exposure',
    body: 'The archive fully admits the company itself is the harm source.',
  },
];

export const quarterlyTierDefinitions: QuarterlyTierDefinition[] = [
  {
    id: 'incident-file',
    label: 'Incident File',
    threshold: 25,
    rewardCurrency: 6,
  },
  {
    id: 'board-watch',
    label: 'Board Watch',
    threshold: 60,
    rewardCurrency: 10,
  },
  {
    id: 'crisis-cell',
    label: 'Crisis Cell',
    threshold: 100,
    rewardCurrency: 14,
  },
];

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function toUniqueStrings(value: unknown) {
  return isStringArray(value) ? Array.from(new Set(value.filter(Boolean))) : [];
}

function sanitizeQuarterlyTierIds(value: unknown) {
  const validIds = new Set(quarterlyTierDefinitions.map((tier) => tier.id));
  return toUniqueStrings(value).filter((tierId): tierId is QuarterlyTierId =>
    validIds.has(tierId as QuarterlyTierId)
  );
}

function sanitizeEndingStateIds(value: unknown) {
  const validIds = new Set(endingStateDefinitions.map((ending) => ending.id));
  return toUniqueStrings(value).filter((endingId): endingId is EndingStateId =>
    validIds.has(endingId as EndingStateId)
  );
}

function sanitizeTruthState(value: unknown): TruthLadderState {
  const candidate = value && typeof value === 'object' ? (value as Partial<TruthLadderState>) : {};

  return {
    discoveredEndingIds: sanitizeEndingStateIds(candidate.discoveredEndingIds),
    fullExposureClassIds: toUniqueStrings(candidate.fullExposureClassIds),
    lastEndingId:
      typeof candidate.lastEndingId === 'string' &&
      endingStateDefinitions.some((ending) => ending.id === candidate.lastEndingId)
        ? (candidate.lastEndingId as EndingStateId)
        : null,
  };
}

function sanitizeRosterState(value: unknown): RosterLadderState {
  const candidate = value && typeof value === 'object' ? (value as Partial<RosterLadderState>) : {};
  const kind =
    candidate.lastAffordableUnlockKind === 'class' ||
    candidate.lastAffordableUnlockKind === 'companion'
      ? candidate.lastAffordableUnlockKind
      : null;

  return {
    totalBonusCurrency: Math.max(0, Math.floor(candidate.totalBonusCurrency ?? 0)),
    winsFundingUnlocks: Math.max(0, Math.floor(candidate.winsFundingUnlocks ?? 0)),
    lastAffordableUnlockId:
      typeof candidate.lastAffordableUnlockId === 'string'
        ? candidate.lastAffordableUnlockId
        : null,
    lastAffordableUnlockKind: kind,
  };
}

function sanitizeRelationshipState(value: unknown): RelationshipLadderState {
  const candidate =
    value && typeof value === 'object' ? (value as Partial<RelationshipLadderState>) : {};

  return {
    archivedCompanionIds: toUniqueStrings(candidate.archivedCompanionIds),
    synergyPairIds: toUniqueStrings(candidate.synergyPairIds),
    unlockedBondSceneIds: toUniqueStrings(candidate.unlockedBondSceneIds),
    totalBondLevelsEarned: Math.max(0, Math.floor(candidate.totalBondLevelsEarned ?? 0)),
  };
}

function sanitizeQuarterlyHistory(value: unknown): QuarterlyTierHistoryEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => {
      const candidate = entry as Partial<QuarterlyTierHistoryEntry>;
      return {
        quarterId:
          typeof candidate.quarterId === 'string' && candidate.quarterId.length > 0
            ? candidate.quarterId
            : '1970-Q1',
        bestScore: Math.max(0, Math.floor(candidate.bestScore ?? 0)),
        unlockedTierIds: sanitizeQuarterlyTierIds(candidate.unlockedTierIds),
        closedAt:
          typeof candidate.closedAt === 'string' && candidate.closedAt.length > 0
            ? candidate.closedAt
            : createTimestamp(),
      };
    })
    .slice(-QUARTERLY_HISTORY_LIMIT);
}

function sanitizeQuarterlyState(
  value: unknown,
  referenceTimestamp: string
): QuarterlyChallengeState {
  const candidate =
    value && typeof value === 'object' ? (value as Partial<QuarterlyChallengeState>) : {};

  return {
    activeQuarterId:
      typeof candidate.activeQuarterId === 'string' && candidate.activeQuarterId.length > 0
        ? candidate.activeQuarterId
        : getQuarterId(referenceTimestamp),
    score: Math.max(0, Math.floor(candidate.score ?? 0)),
    bestScore: Math.max(0, Math.floor(candidate.bestScore ?? 0)),
    unlockedTierIds: sanitizeQuarterlyTierIds(candidate.unlockedTierIds),
    lastScoredAt:
      typeof candidate.lastScoredAt === 'string' && candidate.lastScoredAt.length > 0
        ? candidate.lastScoredAt
        : null,
    history: sanitizeQuarterlyHistory(candidate.history),
  };
}

function sanitizeProbationState(value: unknown): ProbationContractState {
  const candidate =
    value && typeof value === 'object' ? (value as Partial<ProbationContractState>) : {};

  return {
    status: candidate.status === 'active' ? 'active' : 'inactive',
    startedAt:
      typeof candidate.startedAt === 'string' && candidate.startedAt.length > 0
        ? candidate.startedAt
        : null,
    startRunCount: Math.max(0, Math.floor(candidate.startRunCount ?? 0)),
    deadlineRunCount: Math.max(0, Math.floor(candidate.deadlineRunCount ?? 0)),
    targetRuns: Math.max(
      1,
      Math.floor(candidate.targetRuns ?? PROBATION_DEFAULT_TARGET_RUNS)
    ),
    rewardCurrency: Math.max(
      0,
      Math.floor(candidate.rewardCurrency ?? PROBATION_DEFAULT_REWARD)
    ),
    failurePenalty: Math.max(
      0,
      Math.floor(candidate.failurePenalty ?? PROBATION_DEFAULT_PENALTY)
    ),
    successfulCompletions: Math.max(
      0,
      Math.floor(candidate.successfulCompletions ?? 0)
    ),
    failedReviews: Math.max(0, Math.floor(candidate.failedReviews ?? 0)),
    lastOutcome:
      candidate.lastOutcome === 'success' ||
      candidate.lastOutcome === 'failed' ||
      candidate.lastOutcome === 'cancelled'
        ? candidate.lastOutcome
        : null,
    lastResolvedAt:
      typeof candidate.lastResolvedAt === 'string' && candidate.lastResolvedAt.length > 0
        ? candidate.lastResolvedAt
        : null,
  };
}

function sanitizeMomentumState(value: unknown): MomentumBonusState {
  const candidate =
    value && typeof value === 'object' ? (value as Partial<MomentumBonusState>) : {};

  return {
    targetRuns: Math.max(
      1,
      Math.floor(candidate.targetRuns ?? MOMENTUM_DEFAULT_TARGET_RUNS)
    ),
    runsSinceLastWin: Math.max(0, Math.floor(candidate.runsSinceLastWin ?? 0)),
    streakBonusesEarned: Math.max(
      0,
      Math.floor(candidate.streakBonusesEarned ?? 0)
    ),
  };
}

export function normalizeRetentionState(
  value: unknown,
  referenceTimestamp = createTimestamp()
): RetentionState {
  const candidate = value && typeof value === 'object' ? (value as Partial<RetentionState>) : {};

  return {
    truth: sanitizeTruthState(candidate.truth),
    roster: sanitizeRosterState(candidate.roster),
    relationship: sanitizeRelationshipState(candidate.relationship),
    quarterly: sanitizeQuarterlyState(candidate.quarterly, referenceTimestamp),
    probation: sanitizeProbationState(candidate.probation),
    momentum: sanitizeMomentumState(candidate.momentum),
  };
}

export function getQuarterId(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return DEFAULT_RETENTION_STATE.quarterly.activeQuarterId;
  }

  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `${date.getUTCFullYear()}-Q${quarter}`;
}

export function formatQuarterIdLabel(quarterId: string) {
  const match = /^(\d{4})-Q([1-4])$/.exec(quarterId);

  if (!match) {
    return quarterId;
  }

  return `Q${match[2]} ${match[1]}`;
}

export function getEndingStateIdForRun(
  result: ArchivedRunResult,
  floorReached: number
): EndingStateId {
  if (result === 'abandon') {
    return 'quiet-survival';
  }

  if (result === 'win' && floorReached >= 10) {
    return 'full-exposure';
  }

  if (result === 'win') {
    return 'controlled-detonation';
  }

  if (floorReached >= 8) {
    return 'partial-exposure';
  }

  return 'licensed-survival';
}

export function getEndingStateDefinition(endingId: EndingStateId) {
  return (
    endingStateDefinitions.find((ending) => ending.id === endingId) ??
    endingStateDefinitions[0]
  );
}

export function getClassTruthRouteSummary(classId: string): TruthRouteDefinition {
  return (
    truthRouteDefinitions[classId] ?? {
      routeId: 'force-the-truth-to-surface',
      label: 'Force the truth to surface',
      shortLabel: 'Truth route',
      body: 'Use this class to force a different reading of the tower than your last clear.',
    }
  );
}

export function getQuarterlyTierDefinition(tierId: QuarterlyTierId) {
  return quarterlyTierDefinitions.find((tier) => tier.id === tierId) ?? quarterlyTierDefinitions[0];
}

function archiveQuarterIfNeeded(
  quarterly: QuarterlyChallengeState,
  currentQuarterId: string,
  referenceTimestamp: string
): QuarterlyChallengeState {
  if (quarterly.activeQuarterId === currentQuarterId) {
    return quarterly;
  }

  const shouldArchiveCurrent =
    quarterly.bestScore > 0 ||
    quarterly.score > 0 ||
    quarterly.unlockedTierIds.length > 0;
  const nextHistory = shouldArchiveCurrent
    ? [
        ...quarterly.history,
        {
          quarterId: quarterly.activeQuarterId,
          bestScore: quarterly.bestScore,
          unlockedTierIds: quarterly.unlockedTierIds,
          closedAt: referenceTimestamp,
        },
      ].slice(-QUARTERLY_HISTORY_LIMIT)
    : quarterly.history;

  return {
    activeQuarterId: currentQuarterId,
    score: 0,
    bestScore: 0,
    unlockedTierIds: [],
    lastScoredAt: null,
    history: nextHistory,
  };
}

function applyQuarterlyDecay(
  quarterly: QuarterlyChallengeState,
  referenceTimestamp: string
): QuarterlyStateComputation {
  const currentQuarterId = getQuarterId(referenceTimestamp);
  const rolledQuarter = archiveQuarterIfNeeded(
    quarterly,
    currentQuarterId,
    referenceTimestamp
  );

  if (!rolledQuarter.lastScoredAt) {
    return {
      state: rolledQuarter,
      decayApplied: 0,
    };
  }

  const lastScoredAt = new Date(rolledQuarter.lastScoredAt);
  const referenceDate = new Date(referenceTimestamp);

  if (
    Number.isNaN(lastScoredAt.getTime()) ||
    Number.isNaN(referenceDate.getTime()) ||
    referenceDate.getTime() <= lastScoredAt.getTime()
  ) {
    return {
      state: rolledQuarter,
      decayApplied: 0,
    };
  }

  const elapsedMs = referenceDate.getTime() - lastScoredAt.getTime();
  const elapsedSteps = Math.floor(elapsedMs / (DECAY_STEP_DAYS * DAY_IN_MS));
  const decayApplied = Math.min(
    rolledQuarter.score,
    elapsedSteps * DECAY_POINTS_PER_STEP
  );

  if (decayApplied === 0) {
    return {
      state: rolledQuarter,
      decayApplied: 0,
    };
  }

  return {
    state: {
      ...rolledQuarter,
      score: Math.max(0, rolledQuarter.score - decayApplied),
    },
    decayApplied,
  };
}

export function getQuarterlyChallengeSnapshot(
  retention: RetentionState,
  referenceTimestamp = createTimestamp()
) {
  const { state } = applyQuarterlyDecay(retention.quarterly, referenceTimestamp);
  const nextTier = quarterlyTierDefinitions.find(
    (tier) => !state.unlockedTierIds.includes(tier.id)
  );

  return {
    quarterId: state.activeQuarterId,
    score: state.score,
    bestScore: state.bestScore,
    unlockedTierIds: state.unlockedTierIds,
    nextTier,
  };
}

function sortOffer(left: { cost: number }, right: { cost: number }) {
  return left.cost - right.cost;
}

function getLockedRosterOffers(profile: ProfileState) {
  const requisitionCatalog = buildRequisitionCatalog(profile);
  return [
    ...requisitionCatalog.classes.filter((offer) => !offer.owned),
    ...requisitionCatalog.companions.filter((offer) => !offer.owned),
  ].sort(sortOffer);
}

function buildPairId(leftId: string, rightId: string) {
  return [leftId, rightId].sort().join(PAIR_SEPARATOR);
}

function getPairIds(companionIds: string[]) {
  const uniqueIds = Array.from(new Set(companionIds));
  const pairIds: string[] = [];

  for (let index = 0; index < uniqueIds.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < uniqueIds.length; nextIndex += 1) {
      pairIds.push(buildPairId(uniqueIds[index]!, uniqueIds[nextIndex]!));
    }
  }

  return pairIds;
}

export function formatSynergyPairLabel(pairId: string) {
  const [leftId, rightId] = pairId.split(PAIR_SEPARATOR);
  const leftName = leftId ? getCompanionDefinition(leftId)?.name ?? leftId : 'Unknown';
  const rightName = rightId
    ? getCompanionDefinition(rightId)?.name ?? rightId
    : 'Unknown';

  return `${leftName} + ${rightName}`;
}

function addUniqueStrings(values: string[], additions: string[]) {
  return Array.from(new Set([...values, ...additions]));
}

function calculateQuarterlyPoints(input: {
  result: ArchivedRunResult;
  floorIndex: number;
  unlockedNewEnding: boolean;
  newSynergyPairIds: string[];
  unlockedBondSceneIds: string[];
}) {
  const basePoints =
    input.result === 'win' ? 22 : input.result === 'loss' ? 10 : 6;

  return (
    basePoints +
    Math.max(1, Math.min(10, Math.floor(input.floorIndex))) +
    (input.unlockedNewEnding ? 5 : 0) +
    input.newSynergyPairIds.length * 4 +
    input.unlockedBondSceneIds.length * 3
  );
}

function applyQuarterlyTierRewards(input: {
  quarterly: QuarterlyChallengeState;
  scoreAfterRun: number;
}) {
  const unlockedTierIds = [...input.quarterly.unlockedTierIds];
  const newlyUnlockedTierIds: QuarterlyTierId[] = [];
  let rewardCurrency = 0;

  for (const tier of quarterlyTierDefinitions) {
    if (input.scoreAfterRun < tier.threshold || unlockedTierIds.includes(tier.id)) {
      continue;
    }

    unlockedTierIds.push(tier.id);
    newlyUnlockedTierIds.push(tier.id);
    rewardCurrency += tier.rewardCurrency;
  }

  return {
    unlockedTierIds,
    newlyUnlockedTierIds,
    rewardCurrency,
  };
}

function getReadableUnlockLabel(kind: RequisitionKind | null, id: string | null) {
  if (!kind || !id) {
    return null;
  }

  return kind === 'class'
    ? getClassDefinition(id)?.name ?? id
    : getCompanionDefinition(id)?.name ?? id;
}

export function activateProbationContract(profile: ProfileState): ProfileState {
  const retention = normalizeRetentionState(profile.retention);
  const timestamp = createTimestamp();

  if (retention.probation.status === 'active') {
    return profile;
  }

  return {
    ...profile,
    retention: {
      ...retention,
      probation: {
        ...retention.probation,
        status: 'active',
        startedAt: timestamp,
        startRunCount: profile.stats.totalRuns,
        deadlineRunCount: profile.stats.totalRuns + retention.probation.targetRuns,
        lastOutcome: null,
        lastResolvedAt: null,
      },
    },
  };
}

export function cancelProbationContract(profile: ProfileState): ProfileState {
  const retention = normalizeRetentionState(profile.retention);

  if (retention.probation.status !== 'active') {
    return profile;
  }

  return {
    ...profile,
    retention: {
      ...retention,
      probation: {
        ...retention.probation,
        status: 'inactive',
        startedAt: null,
        startRunCount: profile.stats.totalRuns,
        deadlineRunCount: profile.stats.totalRuns,
        lastOutcome: 'cancelled',
        lastResolvedAt: createTimestamp(),
      },
    },
  };
}

export function applyArchivedRunRetention(input: {
  profile: ProfileState;
  run: RunState;
  result: ArchivedRunResult;
  bondGains: ArchivedRunBondGain[];
  timestamp?: string;
}): RetentionApplyResult {
  const timestamp = input.timestamp ?? createTimestamp();
  const retention = normalizeRetentionState(input.profile.retention, timestamp);
  const endingId = getEndingStateIdForRun(input.result, input.run.floorIndex);
  const unlockedNewEnding = !retention.truth.discoveredEndingIds.includes(endingId);
  const discoveredEndingIds = unlockedNewEnding
    ? [...retention.truth.discoveredEndingIds, endingId]
    : retention.truth.discoveredEndingIds;
  const fullExposureClassUnlocked =
    endingId === 'full-exposure' &&
    input.result === 'win' &&
    !retention.truth.fullExposureClassIds.includes(input.run.heroClassId)
      ? input.run.heroClassId
      : null;
  const fullExposureClassIds = fullExposureClassUnlocked
    ? [...retention.truth.fullExposureClassIds, fullExposureClassUnlocked]
    : retention.truth.fullExposureClassIds;

  const unlockedBondScenes = getBondScenesUnlockedByBondGains(input.bondGains);
  const unlockedBondSceneIds = unlockedBondScenes.map((scene) => scene.id);
  const totalBondLevelsEarned = input.bondGains.reduce(
    (sum, bondGain) => sum + Math.max(0, bondGain.levelsEarned),
    0
  );
  const archiveCoverageAdded = Array.from(
    new Set(input.run.chosenCompanionIds)
  ).filter(
    (companionId) => !retention.relationship.archivedCompanionIds.includes(companionId)
  );
  const synergyPairIds = getPairIds(input.run.chosenCompanionIds);
  const newSynergyPairIds = synergyPairIds.filter(
    (pairId) => !retention.relationship.synergyPairIds.includes(pairId)
  );

  const lockedRosterOffers = getLockedRosterOffers(input.profile);
  const cheapestLockedOffer = lockedRosterOffers[0] ?? null;
  const rosterBonusCurrency =
    input.result === 'win' && cheapestLockedOffer
      ? Math.max(
          ROSTER_BASE_BONUS,
          cheapestLockedOffer.cost - ROSTER_SHORTAGE_BUFFER - input.profile.metaCurrency,
          0
        )
      : 0;
  const currencyAfterRosterBonus = input.profile.metaCurrency + rosterBonusCurrency;
  const unlockReadyOffer =
    input.result === 'win'
      ? lockedRosterOffers.find((offer) => offer.cost <= currencyAfterRosterBonus) ?? null
      : null;

  const momentumRunsUsed = retention.momentum.runsSinceLastWin + 1;
  const momentumQualified =
    input.result === 'win' && momentumRunsUsed <= retention.momentum.targetRuns;
  const momentumBonusCurrency = momentumQualified ? MOMENTUM_DEFAULT_BONUS : 0;

  const quarterlyStateWithDecay = applyQuarterlyDecay(retention.quarterly, timestamp);
  const quarterlyPointsAwarded = calculateQuarterlyPoints({
    result: input.result,
    floorIndex: input.run.floorIndex,
    unlockedNewEnding,
    newSynergyPairIds,
    unlockedBondSceneIds,
  });
  const quarterlyScoreBeforePenalty =
    quarterlyStateWithDecay.state.score + quarterlyPointsAwarded;
  const quarterlyRewards = applyQuarterlyTierRewards({
    quarterly: quarterlyStateWithDecay.state,
    scoreAfterRun: quarterlyScoreBeforePenalty,
  });

  const nextTotalRuns = input.profile.stats.totalRuns + 1;
  let probationOutcome: ArchivedRunRetentionSummary['probationOutcome'] = 'inactive';
  let probationRunsRemaining: number | null = null;
  let probationRewardCurrency = 0;
  let probationPenaltyApplied = 0;
  let nextProbationState: ProbationContractState = retention.probation;

  if (retention.probation.status === 'active') {
    if (input.result === 'win' && nextTotalRuns <= retention.probation.deadlineRunCount) {
      probationOutcome = 'success';
      probationRewardCurrency = retention.probation.rewardCurrency;
      nextProbationState = {
        ...retention.probation,
        status: 'inactive',
        successfulCompletions: retention.probation.successfulCompletions + 1,
        startedAt: null,
        startRunCount: nextTotalRuns,
        deadlineRunCount: nextTotalRuns,
        lastOutcome: 'success',
        lastResolvedAt: timestamp,
      };
    } else if (nextTotalRuns >= retention.probation.deadlineRunCount) {
      probationOutcome = 'failed';
      probationPenaltyApplied = retention.probation.failurePenalty;
      nextProbationState = {
        ...retention.probation,
        status: 'inactive',
        failedReviews: retention.probation.failedReviews + 1,
        startedAt: null,
        startRunCount: nextTotalRuns,
        deadlineRunCount: nextTotalRuns,
        lastOutcome: 'failed',
        lastResolvedAt: timestamp,
      };
    } else {
      probationOutcome = 'active';
      probationRunsRemaining = Math.max(
        0,
        retention.probation.deadlineRunCount - nextTotalRuns
      );
      nextProbationState = retention.probation;
    }
  }

  const quarterlyScoreAfterRun = Math.max(
    0,
    quarterlyScoreBeforePenalty - probationPenaltyApplied
  );
  const totalBonusCurrency =
    rosterBonusCurrency +
    momentumBonusCurrency +
    quarterlyRewards.rewardCurrency +
    probationRewardCurrency;

  const updatedProfile: ProfileState = {
    ...input.profile,
    metaCurrency: input.profile.metaCurrency + totalBonusCurrency,
    retention: {
      truth: {
        discoveredEndingIds,
        fullExposureClassIds,
        lastEndingId: endingId,
      },
      roster: {
        totalBonusCurrency:
          retention.roster.totalBonusCurrency + rosterBonusCurrency,
        winsFundingUnlocks:
          retention.roster.winsFundingUnlocks + (rosterBonusCurrency > 0 ? 1 : 0),
        lastAffordableUnlockId: unlockReadyOffer?.id ?? null,
        lastAffordableUnlockKind: unlockReadyOffer?.kind ?? null,
      },
      relationship: {
        archivedCompanionIds: addUniqueStrings(
          retention.relationship.archivedCompanionIds,
          archiveCoverageAdded
        ),
        synergyPairIds: addUniqueStrings(
          retention.relationship.synergyPairIds,
          newSynergyPairIds
        ),
        unlockedBondSceneIds: addUniqueStrings(
          retention.relationship.unlockedBondSceneIds,
          unlockedBondSceneIds
        ),
        totalBondLevelsEarned:
          retention.relationship.totalBondLevelsEarned + totalBondLevelsEarned,
      },
      quarterly: {
        ...quarterlyStateWithDecay.state,
        score: quarterlyScoreAfterRun,
        bestScore: Math.max(
          quarterlyStateWithDecay.state.bestScore,
          quarterlyScoreAfterRun
        ),
        unlockedTierIds: quarterlyRewards.unlockedTierIds,
        lastScoredAt: timestamp,
      },
      probation: nextProbationState,
      momentum: {
        ...retention.momentum,
        runsSinceLastWin:
          input.result === 'win'
            ? 0
            : retention.momentum.runsSinceLastWin + 1,
        streakBonusesEarned:
          retention.momentum.streakBonusesEarned + (momentumQualified ? 1 : 0),
      },
    },
  };

  const updatedRun: RunState =
    totalBonusCurrency > 0
      ? {
          ...input.run,
          stats: {
            ...input.run.stats,
            metaCurrencyEarned:
              input.run.stats.metaCurrencyEarned + totalBonusCurrency,
          },
        }
      : input.run;

  return {
    profile: updatedProfile,
    run: updatedRun,
    summary: {
      endingId,
      truthEndingUnlocked: unlockedNewEnding,
      totalEndingStatesLogged: discoveredEndingIds.length,
      totalFullExposureClasses: fullExposureClassIds.length,
      fullExposureClassUnlocked,
      rosterBonusCurrency,
      rosterUnlockReadyId: unlockReadyOffer?.id ?? null,
      rosterUnlockReadyKind: unlockReadyOffer?.kind ?? null,
      relationshipSceneIds: unlockedBondSceneIds,
      relationshipArchiveCoverageAdded: archiveCoverageAdded,
      relationshipSynergyPairIds: newSynergyPairIds,
      quarterlyQuarterId: quarterlyStateWithDecay.state.activeQuarterId,
      quarterlyPointsAwarded,
      quarterlyScoreAfterRun,
      quarterlyDecayApplied: quarterlyStateWithDecay.decayApplied,
      quarterlyUnlockedTierIds: quarterlyRewards.newlyUnlockedTierIds,
      probationOutcome,
      probationRunsRemaining,
      probationRewardCurrency,
      probationPenaltyApplied,
      momentumQualified,
      momentumRunsUsed,
      momentumTargetRuns: retention.momentum.targetRuns,
      momentumBonusCurrency,
      totalBonusCurrency,
    },
  };
}

export function getRosterUnlockReadyLabel(summary: ArchivedRunRetentionSummary) {
  return getReadableUnlockLabel(
    summary.rosterUnlockReadyKind,
    summary.rosterUnlockReadyId
  );
}

export function getMissingEndingStateIds(profile: ProfileState) {
  return endingStateDefinitions
    .map((ending) => ending.id)
    .filter((endingId) => !profile.retention.truth.discoveredEndingIds.includes(endingId));
}

export function getNextQuarterlyTier(profile: ProfileState) {
  const snapshot = getQuarterlyChallengeSnapshot(profile.retention);
  return snapshot.nextTier ?? null;
}

