import { generateRunMap } from '@/src/engine/run/generate-run-map';
import { normalizeRunCompanionBondLevels } from '@/src/engine/bond/companion-perks';
import { normalizeMetaUpgradeLevels } from '@/src/engine/meta/meta-upgrade-engine';
import { createEmptyRunProgressStats } from '@/src/engine/run/run-summary';
import { createInitialRunHeroState } from '@/src/engine/run/run-hero';
import { LATEST_SCHEMA_VERSION } from '@/src/save/migrations';
import type { MetaUpgradeLevels } from '@/src/types/profile';
import type { RunState } from '@/src/types/run';
import { createId } from '@/src/utils/ids';
import { createTimestamp } from '@/src/utils/time';

type CreateInitialRunInput = {
  heroClassId: string;
  chosenCompanionIds: string[];
  companionBondLevels?: Record<string, number>;
  metaUpgradeLevels?: MetaUpgradeLevels;
};

export function createInitialRun({
  heroClassId,
  chosenCompanionIds,
  companionBondLevels,
  metaUpgradeLevels,
}: CreateInitialRunInput): RunState {
  if (chosenCompanionIds.length !== 2) {
    throw new Error('A new dive requires exactly two companions.');
  }

  const timestamp = createTimestamp();
  const seed = createId('seed');
  const map = generateRunMap(seed);
  const startingNodeId = map.floors[0]?.nodes[0]?.id ?? null;

  return {
    runId: createId('run'),
    schemaVersion: LATEST_SCHEMA_VERSION,
    seed,
    heroClassId,
    hero: createInitialRunHeroState(heroClassId, metaUpgradeLevels),
    chosenCompanionIds,
    companionBondLevels: normalizeRunCompanionBondLevels(
      chosenCompanionIds,
      companionBondLevels
    ),
    metaUpgradeLevels: normalizeMetaUpgradeLevels(metaUpgradeLevels),
    activeCompanionId: chosenCompanionIds[0],
    inventoryItemIds: [],
    floorIndex: 1,
    currentNodeId: startingNodeId,
    map,
    runStatus: 'in_progress',
    combatState: null,
    pendingReward: null,
    stats: createEmptyRunProgressStats(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}
