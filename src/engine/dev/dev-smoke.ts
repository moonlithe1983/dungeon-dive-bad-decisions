import { createCombatStateForCurrentNode } from '@/src/engine/battle/combat-engine';
import { createInitialRun } from '@/src/engine/run/create-initial-run';
import { syncRunHeroState } from '@/src/engine/run/run-hero';
import type { RunMapState, RunProgressStats, RunState } from '@/src/types/run';

export type DevSmokeScenarioId = 'near-win' | 'near-loss';

type CreateDevSmokeRunInput = {
  scenarioId: DevSmokeScenarioId;
  companionBondLevels?: Record<string, number>;
};

const DEV_SMOKE_CLASS_ID = 'it-support';
const DEV_SMOKE_COMPANION_IDS = [
  'facilities-goblin',
  'former-executive-assistant',
];
const FINAL_FLOOR_NUMBER = 10;
const FINAL_BOSS_SEQUENCE = 2;

const DEV_SMOKE_STATS: RunProgressStats = {
  nodesResolved: 19,
  battlesWon: 9,
  eventsResolved: 4,
  rewardsClaimed: 13,
  metaCurrencyEarned: 104,
  damageTaken: 88,
  healingReceived: 66,
  collectedItemIds: [
    'reply-all-amulet',
    'calendar-invite-from-hell',
    'pto-voucher',
  ],
};

function cloneMap(map: RunMapState): RunMapState {
  return {
    floors: map.floors.map((floor) => ({
      ...floor,
      nodes: floor.nodes.map((node) => ({ ...node })),
    })),
  };
}

function moveRunToFinalBoss(run: RunState): RunState {
  const nextMap = cloneMap(run.map);
  const finalFloor = nextMap.floors.find(
    (floor) => floor.floorNumber === FINAL_FLOOR_NUMBER
  );
  const finalBossNode = finalFloor?.nodes.find(
    (node) => node.sequence === FINAL_BOSS_SEQUENCE && node.kind === 'boss'
  );

  if (!finalFloor || !finalBossNode) {
    throw new Error('The smoke helper could not find the final boss node.');
  }

  nextMap.floors.forEach((floor) => {
    if (floor.floorNumber < FINAL_FLOOR_NUMBER) {
      floor.status = 'resolved';
      floor.nodes.forEach((node) => {
        node.status = 'resolved';
      });
      return;
    }

    if (floor.floorNumber === FINAL_FLOOR_NUMBER) {
      floor.status = 'active';
      floor.nodes.forEach((node) => {
        if (node.sequence < FINAL_BOSS_SEQUENCE) {
          node.status = 'resolved';
          return;
        }

        if (node.sequence === FINAL_BOSS_SEQUENCE) {
          node.status = 'active';
          return;
        }

        node.status = 'locked';
      });
      return;
    }

    floor.status = 'locked';
    floor.nodes.forEach((node) => {
      node.status = 'locked';
    });
  });

  return {
    ...run,
    floorIndex: FINAL_FLOOR_NUMBER,
    currentNodeId: finalBossNode.id,
    map: nextMap,
    pendingReward: null,
    runStatus: 'in_progress',
    stats: {
      ...DEV_SMOKE_STATS,
      collectedItemIds: [...DEV_SMOKE_STATS.collectedItemIds],
    },
  };
}

export function createDevSmokeRun({
  scenarioId,
  companionBondLevels,
}: CreateDevSmokeRunInput): RunState {
  const seededRun = moveRunToFinalBoss(
    createInitialRun({
      heroClassId: DEV_SMOKE_CLASS_ID,
      chosenCompanionIds: DEV_SMOKE_COMPANION_IDS,
      companionBondLevels,
    })
  );
  const seededCombat = createCombatStateForCurrentNode(seededRun);
  const nextCombat =
    scenarioId === 'near-win'
      ? {
          ...seededCombat,
          turnNumber: 6,
          heroHp: 14,
          enemy: {
            ...seededCombat.enemy,
            currentHp: 1,
          },
          log: [
            ...seededCombat.log,
            'Smoke Lab: the final boss is at 1 HP. Patch will finish the run and archive a win.',
          ],
        }
      : {
          ...seededCombat,
          turnNumber: 5,
          heroHp: 1,
          enemy: {
            ...seededCombat.enemy,
            currentHp: Math.max(20, seededCombat.enemy.maxHp - 8),
          },
          log: [
            ...seededCombat.log,
            'Smoke Lab: you are at 1 HP. Escalate will trigger a real defeat and archive a loss.',
          ],
        };

  return syncRunHeroState(
    {
      ...seededRun,
      combatState: nextCombat,
    },
    nextCombat.heroHp
  );
}
