import { generateRunMap } from '@/src/engine/run/generate-run-map';
import { applyBondProgressionForArchivedRun } from '@/src/engine/bond/bond-progression';
import { normalizeRunCompanionBondLevels } from '@/src/engine/bond/companion-perks';
import {
  isCombatStatusId,
  normalizeCombatStatuses,
} from '@/src/engine/battle/combat-statuses';
import { getClassDefinition } from '@/src/content/classes';
import { getCompanionDefinition } from '@/src/content/companions';
import {
  getDefaultMetaUpgradeLevels,
  normalizeMetaUpgradeLevels,
} from '@/src/engine/meta/meta-upgrade-engine';
import { syncPendingRewardSelection } from '@/src/engine/reward/create-pending-reward';
import { applyArchivedRunRetention } from '@/src/engine/retention/retention-engine';
import { normalizeRunHeroState } from '@/src/engine/run/run-hero';
import {
  createEmptyRunProgressStats,
  normalizeRunProgressStats,
} from '@/src/engine/run/run-summary';
import { getDatabaseAsync } from '@/src/save/db';
import { loadOrSeedProfileAsync, saveProfileAsync } from '@/src/save/profileRepo';
import { LATEST_SCHEMA_VERSION } from '@/src/save/migrations';
import type {
  CombatState,
  CombatStatusState,
} from '@/src/types/combat';
import { isCombatActionId } from '@/src/types/combat';
import type { ActiveRunSummary } from '@/src/types/save';
import type {
  ArchivedRunDefeatSummary,
  ArchivedRunBondGain,
  ArchivedRunRecap,
  ArchivedRunOutcomeNote,
  ArchivedRunResult,
  PendingRewardOptionState,
  PendingRewardState,
  RunFloorState,
  RunFloorStatus,
  RunHeroState,
  RunHistoryEntry,
  RunMapState,
  RunNodeKind,
  RunNodeState,
  RunNodeStatus,
  RunProgressStats,
  RunState,
  RunStatus,
} from '@/src/types/run';
import { humanizeId } from '@/src/utils/strings';
import { createTimestamp, formatSaveTimestampLabel } from '@/src/utils/time';

const ACTIVE_RUN_SLOT = 'primary';
const BACKUP_RUN_SLOT = 'autosave';

type RunSlotTableName = 'active_run_slots' | 'run_backup_slots';

type RunSlotRow = {
  slot: string;
  run_id: string;
  hero_class_id: string;
  active_companion_id: string;
  floor_index: number;
  run_status: string;
  payload: string;
  created_at: string;
  updated_at: string;
};

type RunHistoryRow = {
  id: number;
  run_id: string;
  result: ArchivedRunResult;
  class_id: string;
  class_name: string;
  floor_reached: number;
  summary_payload: string | null;
  updated_at: string;
  created_at: string;
};

type LoadRunResult = {
  run: RunState | null;
  isInvalid: boolean;
};

type PersistedPendingRewardOptionState = PendingRewardOptionState;

type PersistedCombatState = Omit<CombatState, 'heroStatuses' | 'enemyStatuses'> & {
  heroStatuses?: CombatStatusState[] | null;
  enemyStatuses?: CombatStatusState[] | null;
};

type PersistedRunState = Omit<
  RunState,
  | 'hero'
  | 'inventoryItemIds'
  | 'companionBondLevels'
  | 'metaUpgradeLevels'
  | 'combatState'
> & {
  hero?: RunHeroState | null;
  inventoryItemIds?: string[] | null;
  companionBondLevels?: Record<string, number> | null;
  metaUpgradeLevels?: Record<string, number> | null;
  stats?: RunProgressStats | null;
  combatState?: PersistedCombatState | null;
  pendingReward?:
    | (Omit<PendingRewardState, 'runHealing' | 'selectedOptionId' | 'options'> & {
        runHealing?: number | null;
        selectedOptionId?: string | null;
        options?: PersistedPendingRewardOptionState[] | null;
      })
    | null;
};

type ClearActiveRunOptions = {
  archive?: {
    result: ArchivedRunResult;
    run: RunState;
    bossesKilledDelta?: number;
    outcome?: ArchivedRunOutcomeNote;
    defeatSummary?: ArchivedRunDefeatSummary | null;
  };
};

type PersistedArchivedRunRecap = {
  activeCompanionId: string;
  finalHero: RunHeroState;
  inventoryItemIds: string[];
  metaUpgradeLevels?: Record<string, number> | null;
  stats?: RunProgressStats | null;
  outcome?: ArchivedRunOutcomeNote | null;
  defeatSummary?: ArchivedRunDefeatSummary | null;
  bondGains?: ArchivedRunBondGain[] | null;
  retention?: ArchivedRunRecap['retention'] | null;
};

type LegacyRunNodeStatus = 'pending' | 'active' | 'resolved';
type LegacyRunNodeKind = 'map' | RunNodeKind;

type LegacyRunNodeState = {
  id: string;
  kind: LegacyRunNodeKind;
  label: string;
  status: LegacyRunNodeStatus;
};

type LegacyRunState = {
  runId: string;
  schemaVersion?: number;
  seed: string;
  heroClassId: string;
  chosenCompanionIds: string[];
  activeCompanionId: string;
  floorIndex: number;
  currentNode: LegacyRunNodeState;
  runStatus: RunStatus;
  combatState?: PersistedCombatState | null;
  createdAt: string;
  updatedAt: string;
};

const validRunStatuses = new Set<RunStatus>([
  'in_progress',
  'paused',
  'completed',
  'failed',
]);

const validNodeKinds = new Set<RunNodeKind>([
  'battle',
  'event',
  'reward',
  'boss',
]);

const validNodeStatuses = new Set<RunNodeStatus>([
  'locked',
  'active',
  'resolved',
]);

const validFloorStatuses = new Set<RunFloorStatus>([
  'locked',
  'active',
  'resolved',
]);

const validCombatPhases = new Set<CombatState['phase']>([
  'setup',
  'player-turn',
  'victory',
  'defeat',
]);

const validRewardSourceKinds = new Set<PendingRewardState['sourceKind']>([
  'battle-victory',
  'reward-node',
]);

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isNumberRecord(value: unknown): value is Record<string, number> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every(
    (item) => typeof item === 'number'
  );
}

function isCombatState(value: unknown): value is CombatState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PersistedCombatState>;

  return (
    typeof candidate.combatId === 'string' &&
    typeof candidate.nodeId === 'string' &&
    typeof candidate.turnNumber === 'number' &&
    typeof candidate.heroHp === 'number' &&
    typeof candidate.heroMaxHp === 'number' &&
    typeof candidate.phase === 'string' &&
    validCombatPhases.has(candidate.phase) &&
    (candidate.heroStatuses == null ||
      (Array.isArray(candidate.heroStatuses) &&
        candidate.heroStatuses.every(isCombatStatusState))) &&
    (candidate.enemyStatuses == null ||
      (Array.isArray(candidate.enemyStatuses) &&
        candidate.enemyStatuses.every(isCombatStatusState))) &&
    typeof candidate.rollCursor === 'number' &&
    Array.isArray(candidate.log) &&
    candidate.log.every((item) => typeof item === 'string') &&
    (candidate.lastActionId == null || isCombatActionId(candidate.lastActionId)) &&
    Boolean(candidate.enemy) &&
    typeof candidate.enemy === 'object' &&
    typeof candidate.enemy.enemyId === 'string' &&
    typeof candidate.enemy.name === 'string' &&
    typeof candidate.enemy.tier === 'string' &&
    ['normal', 'miniboss', 'boss'].includes(candidate.enemy.tier) &&
    typeof candidate.enemy.currentHp === 'number' &&
    typeof candidate.enemy.maxHp === 'number' &&
    typeof candidate.enemy.intent === 'string'
  );
}

function isCombatStatusState(value: unknown): value is CombatStatusState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<CombatStatusState>;

  return (
    isCombatStatusId(candidate.id) &&
    typeof candidate.turnsRemaining === 'number'
  );
}

function isPersistedPendingRewardState(
  value: unknown
): value is PersistedRunState['pendingReward'] {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<
    PersistedRunState['pendingReward'] extends infer T ? NonNullable<T> : never
  >;

  return (
    typeof candidate.rewardId === 'string' &&
    typeof candidate.sourceNodeId === 'string' &&
    typeof candidate.sourceKind === 'string' &&
    validRewardSourceKinds.has(candidate.sourceKind) &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    (typeof candidate.selectedOptionId === 'string' ||
      candidate.selectedOptionId == null) &&
    (candidate.options == null ||
      (Array.isArray(candidate.options) &&
        candidate.options.every(isPendingRewardOptionState))) &&
    typeof candidate.metaCurrency === 'number' &&
    (typeof candidate.runHealing === 'number' || candidate.runHealing == null) &&
    (typeof candidate.itemId === 'string' || candidate.itemId == null) &&
    typeof candidate.createdAt === 'string'
  );
}

function isPendingRewardOptionState(value: unknown): value is PendingRewardOptionState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PendingRewardOptionState>;

  return (
    typeof candidate.optionId === 'string' &&
    typeof candidate.label === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.metaCurrency === 'number' &&
    typeof candidate.runHealing === 'number' &&
    (typeof candidate.itemId === 'string' || candidate.itemId == null) &&
    (typeof candidate.companionBonusLabel === 'string' ||
      candidate.companionBonusLabel == null) &&
    (typeof candidate.synergyBonusLabel === 'string' ||
      candidate.synergyBonusLabel == null)
  );
}

function isRunHeroState(value: unknown): value is RunHeroState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<RunHeroState>;

  return (
    typeof candidate.currentHp === 'number' &&
    typeof candidate.maxHp === 'number'
  );
}

function isRunProgressStats(value: unknown): value is RunProgressStats {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<RunProgressStats>;

  return (
    typeof candidate.nodesResolved === 'number' &&
    typeof candidate.battlesWon === 'number' &&
    typeof candidate.eventsResolved === 'number' &&
    typeof candidate.rewardsClaimed === 'number' &&
    typeof candidate.metaCurrencyEarned === 'number' &&
    typeof candidate.damageTaken === 'number' &&
    typeof candidate.healingReceived === 'number' &&
    isStringArray(candidate.collectedItemIds)
  );
}

function isArchivedRunOutcomeNote(value: unknown): value is ArchivedRunOutcomeNote {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ArchivedRunOutcomeNote>;

  return (
    typeof candidate.title === 'string' &&
    typeof candidate.detail === 'string'
  );
}

function isArchivedRunBondGain(value: unknown): value is ArchivedRunBondGain {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ArchivedRunBondGain>;

  return (
    typeof candidate.companionId === 'string' &&
    (candidate.role === 'active' || candidate.role === 'reserve') &&
    typeof candidate.levelBefore === 'number' &&
    typeof candidate.levelAfter === 'number' &&
    typeof candidate.levelsEarned === 'number'
  );
}

function isArchivedRunDefeatSummary(value: unknown): value is ArchivedRunDefeatSummary {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<ArchivedRunDefeatSummary>;

  return (
    typeof candidate.nodeLabel === 'string' &&
    typeof candidate.enemyName === 'string' &&
    typeof candidate.enemyIntent === 'string' &&
    typeof candidate.finalBlow === 'string' &&
    isStringArray(candidate.heroStatusLabels) &&
    isStringArray(candidate.enemyStatusLabels) &&
    (candidate.heroStatusNotes == null || isStringArray(candidate.heroStatusNotes)) &&
    (candidate.enemyStatusNotes == null || isStringArray(candidate.enemyStatusNotes)) &&
    typeof candidate.recommendation === 'string'
  );
}

function isArchivedRunRecap(value: unknown): value is PersistedArchivedRunRecap {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PersistedArchivedRunRecap>;

  return (
    typeof candidate.activeCompanionId === 'string' &&
    isRunHeroState(candidate.finalHero) &&
    isStringArray(candidate.inventoryItemIds) &&
    (candidate.metaUpgradeLevels == null ||
      isNumberRecord(candidate.metaUpgradeLevels)) &&
    (candidate.stats == null || isRunProgressStats(candidate.stats)) &&
    (candidate.outcome == null || isArchivedRunOutcomeNote(candidate.outcome)) &&
    (candidate.defeatSummary == null ||
      isArchivedRunDefeatSummary(candidate.defeatSummary)) &&
    (candidate.bondGains == null ||
      (Array.isArray(candidate.bondGains) &&
        candidate.bondGains.every(isArchivedRunBondGain)))
  );
}

function isRunNodeState(value: unknown): value is RunNodeState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<RunNodeState>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.floorNumber === 'number' &&
    typeof candidate.sequence === 'number' &&
    typeof candidate.label === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.kind === 'string' &&
    typeof candidate.status === 'string' &&
    validNodeKinds.has(candidate.kind) &&
    validNodeStatuses.has(candidate.status)
  );
}

function isRunFloorState(value: unknown): value is RunFloorState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<RunFloorState>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.floorNumber === 'number' &&
    typeof candidate.label === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.status === 'string' &&
    validFloorStatuses.has(candidate.status) &&
    Array.isArray(candidate.nodes) &&
    candidate.nodes.every(isRunNodeState)
  );
}

function isRunMapState(value: unknown): value is RunMapState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<RunMapState>;
  return Array.isArray(candidate.floors) && candidate.floors.every(isRunFloorState);
}

function isLegacyRunNodeState(value: unknown): value is LegacyRunNodeState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LegacyRunNodeState>;

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.label === 'string' &&
    typeof candidate.kind === 'string' &&
    (candidate.kind === 'map' || validNodeKinds.has(candidate.kind as RunNodeKind)) &&
    typeof candidate.status === 'string' &&
    ['pending', 'active', 'resolved'].includes(candidate.status)
  );
}

function isLegacyRunState(value: unknown): value is LegacyRunState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LegacyRunState>;

  return (
    typeof candidate.runId === 'string' &&
    typeof candidate.seed === 'string' &&
    typeof candidate.heroClassId === 'string' &&
    isStringArray(candidate.chosenCompanionIds) &&
    typeof candidate.activeCompanionId === 'string' &&
    typeof candidate.floorIndex === 'number' &&
    isLegacyRunNodeState(candidate.currentNode) &&
    typeof candidate.runStatus === 'string' &&
    validRunStatuses.has(candidate.runStatus) &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    (candidate.combatState == null || isCombatState(candidate.combatState))
  );
}

function isPersistedRunState(value: unknown): value is PersistedRunState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<PersistedRunState>;

  return (
    typeof candidate.runId === 'string' &&
    typeof candidate.schemaVersion === 'number' &&
    typeof candidate.seed === 'string' &&
    typeof candidate.heroClassId === 'string' &&
    (candidate.hero == null || isRunHeroState(candidate.hero)) &&
    isStringArray(candidate.chosenCompanionIds) &&
    (candidate.companionBondLevels == null ||
      isNumberRecord(candidate.companionBondLevels)) &&
    (candidate.metaUpgradeLevels == null ||
      isNumberRecord(candidate.metaUpgradeLevels)) &&
    typeof candidate.activeCompanionId === 'string' &&
    (candidate.inventoryItemIds == null || isStringArray(candidate.inventoryItemIds)) &&
    typeof candidate.floorIndex === 'number' &&
    (typeof candidate.currentNodeId === 'string' || candidate.currentNodeId == null) &&
    isRunMapState(candidate.map) &&
    typeof candidate.runStatus === 'string' &&
    validRunStatuses.has(candidate.runStatus) &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    (candidate.stats == null || isRunProgressStats(candidate.stats)) &&
    (candidate.combatState == null || isCombatState(candidate.combatState)) &&
    (candidate.pendingReward == null ||
      isPersistedPendingRewardState(candidate.pendingReward))
  );
}

function normalizePendingRewardState(
  pendingReward: PersistedRunState['pendingReward']
): PendingRewardState | null {
  if (!pendingReward) {
    return null;
  }

  const normalizedReward: PendingRewardState = {
    ...pendingReward,
    selectedOptionId:
      typeof pendingReward.selectedOptionId === 'string'
        ? pendingReward.selectedOptionId
        : null,
    options:
      pendingReward.options && pendingReward.options.length > 0
        ? pendingReward.options
        : null,
    runHealing:
      typeof pendingReward.runHealing === 'number'
        ? pendingReward.runHealing
        : pendingReward.sourceKind === 'reward-node'
          ? 10
          : 7,
  };

  return syncPendingRewardSelection(normalizedReward);
}

function createDefaultArchivedRunOutcome(
  result: ArchivedRunResult
): ArchivedRunOutcomeNote {
  if (result === 'win') {
    return {
      title: 'Dive Cleared',
      detail: 'Legacy archive entry. Detailed victory notes were not stored yet.',
    };
  }

  if (result === 'loss') {
    return {
      title: 'Run Collapsed',
      detail: 'Legacy archive entry. Detailed defeat notes were not stored yet.',
    };
  }

  return {
    title: 'Dive Abandoned',
    detail: 'Legacy archive entry. Detailed abandon notes were not stored yet.',
  };
}

function buildArchivedRunRecap(
  run: RunState,
  outcome: ArchivedRunOutcomeNote,
  bondGains: ArchivedRunBondGain[],
  defeatSummary: ArchivedRunDefeatSummary | null = null,
  retention: ArchivedRunRecap['retention'] = null
): ArchivedRunRecap {
  return {
    activeCompanionId: run.activeCompanionId,
    finalHero: {
      currentHp: run.hero.currentHp,
      maxHp: run.hero.maxHp,
    },
    inventoryItemIds: Array.from(new Set(run.inventoryItemIds)),
    metaUpgradeLevels: normalizeMetaUpgradeLevels(run.metaUpgradeLevels),
    stats: normalizeRunProgressStats(run.stats),
    outcome,
    defeatSummary,
    bondGains,
    retention,
  };
}

function normalizeArchivedRunRecap(
  recap: PersistedArchivedRunRecap | null | undefined,
  classId: string,
  result: ArchivedRunResult
): ArchivedRunRecap | null {
  if (!recap) {
    return null;
  }

  const inventoryItemIds = Array.from(new Set(recap.inventoryItemIds));
  const metaUpgradeLevels = normalizeMetaUpgradeLevels(recap.metaUpgradeLevels);

  return {
    activeCompanionId: recap.activeCompanionId,
    finalHero: normalizeRunHeroState({
      classId,
      inventoryItemIds,
      metaUpgradeLevels,
      hero: recap.finalHero,
      fallbackCurrentHp: recap.finalHero.currentHp,
    }),
    inventoryItemIds,
    metaUpgradeLevels,
    stats: normalizeRunProgressStats(recap.stats),
    outcome: recap.outcome ?? createDefaultArchivedRunOutcome(result),
    defeatSummary: recap.defeatSummary ?? null,
    bondGains: (recap.bondGains ?? []).map((bondGain) => ({
      companionId: bondGain.companionId,
      role: bondGain.role,
      levelBefore: Math.max(1, Math.floor(bondGain.levelBefore)),
      levelAfter: Math.max(1, Math.floor(bondGain.levelAfter)),
      levelsEarned: Math.max(0, Math.floor(bondGain.levelsEarned)),
    })),
    retention: recap.retention ?? null,
  };
}

function parseArchivedRunRecap(
  summaryPayload: string | null,
  classId: string,
  result: ArchivedRunResult
): ArchivedRunRecap | null {
  if (!summaryPayload) {
    return null;
  }

  try {
    const parsed = JSON.parse(summaryPayload) as unknown;

    if (!isArchivedRunRecap(parsed)) {
      return null;
    }

    return normalizeArchivedRunRecap(parsed, classId, result);
  } catch {
    return null;
  }
}

function cloneMap(map: RunMapState): RunMapState {
  return {
    floors: map.floors.map((floor) => ({
      ...floor,
      nodes: floor.nodes.map((node) => ({ ...node })),
    })),
  };
}

function findNodeById(map: RunMapState, nodeId: string | null) {
  if (!nodeId) {
    return null;
  }

  for (const floor of map.floors) {
    const node = floor.nodes.find((item) => item.id === nodeId);

    if (node) {
      return node;
    }
  }

  return null;
}

function findFirstActiveNode(map: RunMapState) {
  for (const floor of map.floors) {
    const node = floor.nodes.find((item) => item.status === 'active');

    if (node) {
      return node;
    }
  }

  return null;
}

function findFallbackCurrentNode(map: RunMapState, floorIndex: number) {
  const targetFloor =
    map.floors.find((floor) => floor.floorNumber === floorIndex) ?? map.floors[0] ?? null;

  if (!targetFloor) {
    return null;
  }

  return (
    targetFloor.nodes.find((node) => node.status === 'active') ??
    targetFloor.nodes.find((node) => node.status !== 'resolved') ??
    targetFloor.nodes[targetFloor.nodes.length - 1] ??
    null
  );
}

function normalizeMapState(
  map: RunMapState | null | undefined,
  seed: string,
  floorIndex: number,
  currentNodeId: string | null,
  runStatus: RunStatus
) {
  const nextMap = map ? cloneMap(map) : generateRunMap(seed);
  const explicitCurrentNode = findNodeById(nextMap, currentNodeId);
  const activeNode = explicitCurrentNode ?? findFirstActiveNode(nextMap);
  const fallbackNode =
    activeNode ?? (runStatus === 'completed' ? null : findFallbackCurrentNode(nextMap, floorIndex));

  return {
    map: nextMap,
    currentNodeId: fallbackNode?.id ?? null,
  };
}

function normalizeRunState(run: PersistedRunState): RunState {
  const createdAt = run.createdAt || createTimestamp();
  const inventoryItemIds = Array.from(new Set(run.inventoryItemIds ?? []));
  const chosenCompanionIds = Array.from(new Set(run.chosenCompanionIds));
  const metaUpgradeLevels = normalizeMetaUpgradeLevels(run.metaUpgradeLevels);
  const floorIndex = Math.max(1, Math.floor(run.floorIndex));
  const { map, currentNodeId } = normalizeMapState(
    run.map,
    run.seed,
    floorIndex,
    run.currentNodeId,
    run.runStatus
  );
  const hero = normalizeRunHeroState({
    classId: run.heroClassId,
    inventoryItemIds,
    metaUpgradeLevels,
    hero: run.hero,
    fallbackCurrentHp: run.combatState?.heroHp,
  });
  const combatState = run.combatState
    ? {
        ...run.combatState,
        heroHp: Math.min(hero.maxHp, Math.max(0, run.combatState.heroHp)),
        heroMaxHp: hero.maxHp,
        heroStatuses: normalizeCombatStatuses(run.combatState.heroStatuses),
        enemyStatuses: normalizeCombatStatuses(run.combatState.enemyStatuses),
      }
    : null;

  return {
    ...run,
    schemaVersion: LATEST_SCHEMA_VERSION,
    hero,
    chosenCompanionIds,
    companionBondLevels: normalizeRunCompanionBondLevels(
      chosenCompanionIds,
      run.companionBondLevels
    ),
    metaUpgradeLevels,
    inventoryItemIds,
    stats: normalizeRunProgressStats(run.stats),
    floorIndex,
    currentNodeId: run.runStatus === 'completed' ? null : currentNodeId,
    map,
    combatState,
    pendingReward: normalizePendingRewardState(run.pendingReward),
    createdAt,
    updatedAt: run.updatedAt || createdAt,
  };
}

function migrateLegacyRunState(
  legacyRun: LegacyRunState,
  row: RunSlotRow
): RunState {
  const generatedMap = generateRunMap(legacyRun.seed);
  const requestedFloor = Math.min(
    Math.max(1, Math.floor(legacyRun.floorIndex)),
    generatedMap.floors.length
  );
  const nextMap = cloneMap(generatedMap);

  nextMap.floors.forEach((floor) => {
    if (floor.floorNumber < requestedFloor) {
      floor.status = 'resolved';

      for (const node of floor.nodes) {
        node.status = 'resolved';
      }

      return;
    }

    if (floor.floorNumber === requestedFloor) {
      floor.status = 'active';

      for (const node of floor.nodes) {
        node.status = 'locked';
      }

      if (floor.nodes[0]) {
        floor.nodes[0].status = 'active';
      }

      return;
    }

    floor.status = 'locked';

    for (const node of floor.nodes) {
      node.status = 'locked';
    }
  });

  return normalizeRunState({
    runId: row.run_id,
    schemaVersion: LATEST_SCHEMA_VERSION,
    seed: legacyRun.seed,
    heroClassId: row.hero_class_id,
    hero: null,
    chosenCompanionIds: legacyRun.chosenCompanionIds,
    companionBondLevels: normalizeRunCompanionBondLevels(
      legacyRun.chosenCompanionIds
    ),
    metaUpgradeLevels: getDefaultMetaUpgradeLevels(),
    activeCompanionId: row.active_companion_id,
    inventoryItemIds: [],
    floorIndex: requestedFloor,
    currentNodeId: nextMap.floors[requestedFloor - 1]?.nodes[0]?.id ?? null,
    map: nextMap,
    runStatus: legacyRun.runStatus,
    combatState: legacyRun.combatState ?? null,
    pendingReward: null,
    stats: createEmptyRunProgressStats(),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function parseRunSlotRow(row: RunSlotRow | null): LoadRunResult {
  if (!row) {
    return { run: null, isInvalid: false };
  }

  try {
    const parsed = JSON.parse(row.payload) as unknown;

    if (isPersistedRunState(parsed)) {
      return {
        run: normalizeRunState({
          ...parsed,
          runId: row.run_id,
          heroClassId: row.hero_class_id,
          activeCompanionId: row.active_companion_id,
          floorIndex: row.floor_index,
          runStatus: row.run_status as RunStatus,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }),
        isInvalid: false,
      };
    }

    if (isLegacyRunState(parsed)) {
      return {
        run: migrateLegacyRunState(parsed, row),
        isInvalid: false,
      };
    }

    return { run: null, isInvalid: true };
  } catch {
    return { run: null, isInvalid: true };
  }
}

function buildRunHistoryEntry(
  run: RunState,
  result: ArchivedRunResult,
  outcome: ArchivedRunOutcomeNote,
  bondGains: ArchivedRunBondGain[],
  defeatSummary: ArchivedRunDefeatSummary | null = null,
  retention: ArchivedRunRecap['retention'] = null
): Omit<RunHistoryEntry, 'id'> {
  const className =
    getClassDefinition(run.heroClassId)?.name ?? humanizeId(run.heroClassId);

  return {
    runId: run.runId,
    result,
    classId: run.heroClassId,
    className,
    floorReached: run.floorIndex,
    recap: buildArchivedRunRecap(run, outcome, bondGains, defeatSummary, retention),
    updatedAt: createTimestamp(),
    createdAt: run.createdAt,
  };
}

function toRunHistoryEntry(row: RunHistoryRow): RunHistoryEntry {
  return {
    id: row.id,
    runId: row.run_id,
    result: row.result,
    classId: row.class_id,
    className: row.class_name,
    floorReached: row.floor_reached,
    recap: parseArchivedRunRecap(row.summary_payload, row.class_id, row.result),
    updatedAt: row.updated_at,
    createdAt: row.created_at,
  };
}

async function loadRunSlotAsync(tableName: RunSlotTableName, slot: string) {
  const db = await getDatabaseAsync();
  const row = await db.getFirstAsync<RunSlotRow>(
    `
      SELECT slot, run_id, hero_class_id, active_companion_id, floor_index, run_status, payload, created_at, updated_at
      FROM ${tableName}
      WHERE slot = ?;
    `,
    [slot]
  );

  return parseRunSlotRow(row ?? null);
}

async function loadRunSlotRowAsync(tableName: RunSlotTableName, slot: string) {
  const db = await getDatabaseAsync();

  return db.getFirstAsync<RunSlotRow>(
    `
      SELECT slot, run_id, hero_class_id, active_companion_id, floor_index, run_status, payload, created_at, updated_at
      FROM ${tableName}
      WHERE slot = ?;
    `,
    [slot]
  );
}

async function writeRunSlotAsync(
  tableName: RunSlotTableName,
  slot: string,
  run: RunState,
  options?: { touchUpdatedAt?: boolean }
) {
  const db = await getDatabaseAsync();
  const normalized = normalizeRunState(run);
  const nextRun: RunState =
    options?.touchUpdatedAt === false
      ? normalized
      : {
          ...normalized,
          updatedAt: createTimestamp(),
        };

  await db.runAsync(
    `
      INSERT INTO ${tableName} (
        slot,
        run_id,
        hero_class_id,
        active_companion_id,
        floor_index,
        run_status,
        payload,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slot) DO UPDATE SET
        run_id = excluded.run_id,
        hero_class_id = excluded.hero_class_id,
        active_companion_id = excluded.active_companion_id,
        floor_index = excluded.floor_index,
        run_status = excluded.run_status,
        payload = excluded.payload,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at;
    `,
    [
      slot,
      nextRun.runId,
      nextRun.heroClassId,
      nextRun.activeCompanionId,
      nextRun.floorIndex,
      nextRun.runStatus,
      JSON.stringify(nextRun),
      nextRun.createdAt,
      nextRun.updatedAt,
    ]
  );

  return nextRun;
}

async function copyRunSlotAsync(
  sourceTableName: RunSlotTableName,
  sourceSlot: string,
  destinationTableName: RunSlotTableName,
  destinationSlot: string
) {
  const db = await getDatabaseAsync();
  const row = await loadRunSlotRowAsync(sourceTableName, sourceSlot);

  if (!row) {
    return false;
  }

  await db.runAsync(
    `
      INSERT INTO ${destinationTableName} (
        slot,
        run_id,
        hero_class_id,
        active_companion_id,
        floor_index,
        run_status,
        payload,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(slot) DO UPDATE SET
        run_id = excluded.run_id,
        hero_class_id = excluded.hero_class_id,
        active_companion_id = excluded.active_companion_id,
        floor_index = excluded.floor_index,
        run_status = excluded.run_status,
        payload = excluded.payload,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at;
    `,
    [
      destinationSlot,
      row.run_id,
      row.hero_class_id,
      row.active_companion_id,
      row.floor_index,
      row.run_status,
      row.payload,
      row.created_at,
      row.updated_at,
    ]
  );

  return true;
}

async function clearRunSlotAsync(tableName: RunSlotTableName, slot: string) {
  const db = await getDatabaseAsync();
  await db.runAsync(`DELETE FROM ${tableName} WHERE slot = ?;`, [slot]);
}

async function recordArchivedRunAsync(
  result: ArchivedRunResult,
  run: RunState,
  outcome: ArchivedRunOutcomeNote,
  bossesKilledDelta = 0,
  defeatSummary: ArchivedRunDefeatSummary | null = null
) {
  const db = await getDatabaseAsync();
  const profile = await loadOrSeedProfileAsync();
  const bondProgression = applyBondProgressionForArchivedRun(profile, run, result);
  const retentionProgression = applyArchivedRunRetention({
    profile: bondProgression.profile,
    run,
    result,
    bondGains: bondProgression.bondGains,
  });
  const nextEntry = buildRunHistoryEntry(
    retentionProgression.run,
    result,
    outcome,
    bondProgression.bondGains,
    defeatSummary,
    retentionProgression.summary
  );

  await db.runAsync(
    `
      INSERT INTO run_history (
        run_id,
        result,
        class_id,
        class_name,
        floor_reached,
        summary_payload,
        updated_at,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      nextEntry.runId,
      nextEntry.result,
      nextEntry.classId,
      nextEntry.className,
      nextEntry.floorReached,
      JSON.stringify(nextEntry.recap),
      nextEntry.updatedAt,
      nextEntry.createdAt,
    ]
  );

  await saveProfileAsync({
    ...retentionProgression.profile,
    stats: {
      ...retentionProgression.profile.stats,
      totalRuns: retentionProgression.profile.stats.totalRuns + 1,
      totalWins:
        retentionProgression.profile.stats.totalWins + (result === 'win' ? 1 : 0),
      totalDeaths:
        retentionProgression.profile.stats.totalDeaths + (result === 'loss' ? 1 : 0),
      totalBossesKilled:
        retentionProgression.profile.stats.totalBossesKilled +
        Math.max(0, Math.floor(bossesKilledDelta)),
    },
  });
}

export async function loadActiveRunAsync() {
  const result = await loadRunSlotAsync('active_run_slots', ACTIVE_RUN_SLOT);
  return result.run;
}

export async function loadBackupRunAsync() {
  const result = await loadRunSlotAsync('run_backup_slots', BACKUP_RUN_SLOT);
  return result.run;
}

export async function loadActiveRunSummaryAsync() {
  const run = await resumeActiveRunAsync();
  return run ? deriveActiveRunSummary(run) : null;
}

export async function hasActiveRunAsync() {
  const summary = await loadActiveRunSummaryAsync();
  return Boolean(summary);
}

export async function saveActiveRunAsync(run: RunState) {
  await copyRunSlotAsync(
    'active_run_slots',
    ACTIVE_RUN_SLOT,
    'run_backup_slots',
    BACKUP_RUN_SLOT
  );

  return writeRunSlotAsync('active_run_slots', ACTIVE_RUN_SLOT, run);
}

export async function saveBackupRunAsync(run: RunState) {
  return writeRunSlotAsync('run_backup_slots', BACKUP_RUN_SLOT, run);
}

export async function clearActiveRunAsync(options?: ClearActiveRunOptions) {
  if (options?.archive) {
    await recordArchivedRunAsync(
      options.archive.result,
      options.archive.run,
      options.archive.outcome ?? createDefaultArchivedRunOutcome(options.archive.result),
      options.archive.bossesKilledDelta ?? 0,
      options.archive.defeatSummary ?? null
    );
  }

  await clearRunSlotAsync('active_run_slots', ACTIVE_RUN_SLOT);
  await clearRunSlotAsync('run_backup_slots', BACKUP_RUN_SLOT);
}

export async function clearBackupRunAsync() {
  await clearRunSlotAsync('run_backup_slots', BACKUP_RUN_SLOT);
}

export async function replaceActiveRunWithBackupAsync() {
  return copyRunSlotAsync(
    'run_backup_slots',
    BACKUP_RUN_SLOT,
    'active_run_slots',
    ACTIVE_RUN_SLOT
  );
}

export async function loadRecoverableRunAsync() {
  const activeResult = await loadRunSlotAsync('active_run_slots', ACTIVE_RUN_SLOT);

  if (activeResult.run) {
    return {
      activeRun: activeResult.run,
      recoveredFromBackup: false,
    };
  }

  const backupResult = await loadRunSlotAsync('run_backup_slots', BACKUP_RUN_SLOT);

  if (backupResult.run) {
    await replaceActiveRunWithBackupAsync();

    return {
      activeRun: backupResult.run,
      recoveredFromBackup: true,
    };
  }

  if (activeResult.isInvalid) {
    await clearRunSlotAsync('active_run_slots', ACTIVE_RUN_SLOT);
  }

  if (backupResult.isInvalid) {
    await clearRunSlotAsync('run_backup_slots', BACKUP_RUN_SLOT);
  }

  return {
    activeRun: null,
    recoveredFromBackup: false,
  };
}

export async function resumeActiveRunAsync() {
  const { activeRun } = await loadRecoverableRunAsync();
  return activeRun;
}

export async function loadRunHistoryAsync(limit = 10) {
  const db = await getDatabaseAsync();
  const safeLimit = Math.max(1, Math.floor(limit));
  const rows = db.getAllSync<RunHistoryRow>(
    `
      SELECT id, run_id, result, class_id, class_name, floor_reached, summary_payload, updated_at, created_at
      FROM run_history
      ORDER BY id DESC
      LIMIT ${safeLimit};
    `
  );

  return rows.map(toRunHistoryEntry);
}

export async function loadRunHistoryEntryByRunIdAsync(runId: string) {
  const db = await getDatabaseAsync();
  const row = await db.getFirstAsync<RunHistoryRow>(
    `
      SELECT id, run_id, result, class_id, class_name, floor_reached, summary_payload, updated_at, created_at
      FROM run_history
      WHERE run_id = ?
      ORDER BY id DESC
      LIMIT 1;
    `,
    [runId]
  );

  return row ? toRunHistoryEntry(row) : null;
}

export async function loadLatestRunHistoryEntryAsync() {
  const db = await getDatabaseAsync();
  const row = await db.getFirstAsync<RunHistoryRow>(
    `
      SELECT id, run_id, result, class_id, class_name, floor_reached, summary_payload, updated_at, created_at
      FROM run_history
      ORDER BY id DESC
      LIMIT 1;
    `
  );

  return row ? toRunHistoryEntry(row) : null;
}

export function deriveActiveRunSummary(run: RunState): ActiveRunSummary {
  const className =
    getClassDefinition(run.heroClassId)?.name ?? humanizeId(run.heroClassId);
  const activeCompanionName =
    getCompanionDefinition(run.activeCompanionId)?.name ??
    humanizeId(run.activeCompanionId);

  return {
    runId: run.runId,
    floorIndex: run.floorIndex,
    className,
    activeCompanionName,
    lastSavedAtLabel: formatSaveTimestampLabel(run.updatedAt),
  };
}
