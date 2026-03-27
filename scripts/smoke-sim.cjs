const fs = require('fs');
const Module = require('module');
const path = require('path');
const ts = require('typescript');

const workspaceRoot = path.resolve(__dirname, '..');
const originalResolveFilename = Module._resolveFilename;
const originalTsHandler = require.extensions['.ts'];
const originalTsxHandler = require.extensions['.tsx'];

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (request.startsWith('@/')) {
    const nextRequest = path.join(workspaceRoot, request.slice(2));
    return originalResolveFilename.call(this, nextRequest, parent, isMain, options);
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

function compileTs(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
    fileName: filename,
  });

  module._compile(output.outputText, filename);
}

require.extensions['.ts'] = compileTs;
require.extensions['.tsx'] = compileTs;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function isCompanionCommsEntry(entry) {
  return (
    entry.startsWith('Lead Comms - ') || entry.startsWith('Reserve Comms - ')
  );
}

function getFirstCompanionCommsEntry(log, roleLabel) {
  return (
    log.find((entry) => entry.startsWith(`${roleLabel} - `)) ?? null
  );
}

function getLatestCompanionCommsEntry(log) {
  return (
    [...log].reverse().find((entry) => isCompanionCommsEntry(entry)) ?? null
  );
}

function buildCombatStateKey(combat) {
  const heroStatuses = (combat.heroStatuses ?? [])
    .map((status) => `${status.id}:${status.turnsRemaining}`)
    .join(',');
  const enemyStatuses = (combat.enemyStatuses ?? [])
    .map((status) => `${status.id}:${status.turnsRemaining}`)
    .join(',');

  return [
    combat.phase,
    combat.turnNumber,
    combat.heroHp,
    combat.heroMaxHp,
    combat.enemy.currentHp,
    combat.enemy.maxHp,
    heroStatuses,
    enemyStatuses,
    combat.rollCursor,
    combat.lastActionId ?? 'none',
  ].join('|');
}

function findWinningActionSequence(run, performCombatAction, maxDepth = 14) {
  const cache = new Set();

  function search(currentRun, depth) {
    const combat = currentRun.combatState;

    if (!combat) {
      return null;
    }

    if (combat.phase === 'victory') {
      return [];
    }

    if (combat.phase === 'defeat' || depth <= 0) {
      return null;
    }

    const cacheKey = `${buildCombatStateKey(combat)}|${depth}`;

    if (cache.has(cacheKey)) {
      return null;
    }

    cache.add(cacheKey);

    for (const actionId of ['patch', 'escalate', 'stabilize']) {
      const result = performCombatAction(currentRun, actionId);

      if (result.outcome === 'victory') {
        return [actionId];
      }

      if (result.outcome !== 'ongoing') {
        continue;
      }

      const tail = search(result.run, depth - 1);

      if (tail) {
        return [actionId, ...tail];
      }
    }

    return null;
  }

  return search(run, maxDepth);
}

async function main() {
  const { DEFAULT_PROFILE_STATE } = require(path.join(
    workspaceRoot,
    'src/types/profile.ts'
  ));
  const { eventDefinitions, getEventDefinitionsForBiome } = require(path.join(
    workspaceRoot,
    'src/content/events.ts'
  ));
  const { classDefinitions } = require(path.join(
    workspaceRoot,
    'src/content/classes.ts'
  ));
  const {
    bondSceneDefinitions,
    getBondScenesForCompanion,
    getBondScenesUnlockedByBondGains,
    getUnlockedBondScenesForLevel,
  } = require(path.join(
    workspaceRoot,
    'src/content/bond-scenes.ts'
  ));
  const { createInitialRun } = require(path.join(
    workspaceRoot,
    'src/engine/run/create-initial-run.ts'
  ));
  const {
    createAbandonedRunSnapshot,
    canRotateActiveCompanionAtFloorStart,
    getCurrentRunNode,
    getRunResumeTarget,
    getReserveCompanionId,
    rotateActiveCompanionAtFloorStart,
    resolveCurrentRunNode,
  } = require(path.join(workspaceRoot, 'src/engine/run/progress-run.ts'));
  const {
    applyResolvedNodeProgress,
    applyRunProgressDelta,
  } = require(path.join(workspaceRoot, 'src/engine/run/run-summary.ts'));
  const {
    applyEventChoice,
    getEventSceneForCurrentNode,
  } = require(path.join(workspaceRoot, 'src/engine/event/event-engine.ts'));
  const {
    applyBondProgressionForArchivedRun,
  } = require(path.join(
    workspaceRoot,
    'src/engine/bond/bond-progression.ts'
  ));
  const {
    getRunCompanionSupportCards,
  } = require(path.join(
    workspaceRoot,
    'src/engine/bond/companion-perks.ts'
  ));
  const {
    getActiveTeamSynergyCards,
  } = require(path.join(
    workspaceRoot,
    'src/content/team-synergies.ts'
  ));
  const {
    getEnemyTeamCountermeasureCards,
    getEnemyTeamCountermeasures,
  } = require(path.join(
    workspaceRoot,
    'src/content/enemy-team-reactions.ts'
  ));
  const {
    buildMetaUpgradeCatalog,
    getDefaultMetaUpgradeLevels,
    purchaseMetaUpgrade,
  } = require(path.join(
    workspaceRoot,
    'src/engine/meta/meta-upgrade-engine.ts'
  ));
  const {
    buildRequisitionCatalog,
    purchaseClassUnlock,
    purchaseCompanionUnlock,
  } = require(path.join(
    workspaceRoot,
    'src/engine/meta/requisition-engine.ts'
  ));
  const { applyEventChoiceToProfile } = require(path.join(
    workspaceRoot,
    'src/engine/event/apply-event-choice-to-profile.ts'
  ));
  const {
    createCombatStateForCurrentNode,
    getCombatActionDefinitions,
    performCombatAction,
  } = require(path.join(workspaceRoot, 'src/engine/battle/combat-engine.ts'));
  const { createDevSmokeRun } = require(path.join(
    workspaceRoot,
    'src/engine/dev/dev-smoke.ts'
  ));
  const { createPendingReward, syncPendingRewardSelection } = require(path.join(
    workspaceRoot,
    'src/engine/reward/create-pending-reward.ts'
  ));
  const { applyPendingReward } = require(path.join(
    workspaceRoot,
    'src/engine/reward/apply-pending-reward.ts'
  ));
  const { applyPendingRewardToRun } = require(path.join(
    workspaceRoot,
    'src/engine/reward/apply-pending-reward-to-run.ts'
  ));

  let profile = {
    profileId: 'sim-profile',
    schemaVersion: 2,
    ...DEFAULT_PROFILE_STATE,
    createdAt: '2026-03-15T00:00:00.000Z',
    updatedAt: '2026-03-15T00:00:00.000Z',
  };

  let run = createInitialRun({
    heroClassId: 'it-support',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
  });
  const totalMapNodes = run.map.floors.reduce(
    (count, floor) => count + floor.nodes.length,
    0
  );
  const expectedBossByFloor = {
    4: 'HR Compliance Director',
    7: 'Chief Synergy Officer',
    10: 'Executive Assistant to the Abyssal CEO',
  };
  const generatedBossSummary = run.map.floors.flatMap((floor) =>
    floor.nodes
      .filter((node) => node.kind === 'boss')
      .map((node) => `${floor.floorNumber}:${node.label}`)
  );
  const expectedBossSummary = Object.entries(expectedBossByFloor).map(
    ([floorNumber, bossName]) => `${floorNumber}:${bossName}`
  );

  const flowLog = [];
  let claimedRewardCount = 0;
  let observedPersistentHeroSync = false;
  let observedRunItemPickup = false;
  let observedEventUnlock = false;
  let observedRewardRoomOptions = false;
  const observedBosses = [];
  let observedFloorRotation = false;
  const initialRequisitionCatalog = buildRequisitionCatalog(profile);

  assert(
    run.map.floors.length === 10,
    `Expected the live generator to create 10 floors, received ${run.map.floors.length}.`
  );
  assert(
    totalMapNodes === 20,
    `Expected the live generator to create 20 nodes, received ${totalMapNodes}.`
  );
  assert(
    generatedBossSummary.join('|') === expectedBossSummary.join('|'),
    `Expected boss checkpoints ${expectedBossSummary.join(', ')}, received ${generatedBossSummary.join(', ')}.`
  );
  assert(
    run.map.floors[0]?.label.startsWith('Open-Plan Pits') &&
      run.map.floors[4]?.label.startsWith('Team-Building Catacombs') &&
      run.map.floors[7]?.label.startsWith('Executive Suite of the Damned'),
    'Expected the live map to progress through all three authored biomes.'
  );

  assert(
    initialRequisitionCatalog.classes.some((offer) => !offer.owned),
    'Expected the profile to begin with at least one locked class requisition.'
  );
  assert(
    initialRequisitionCatalog.companions.some((offer) => !offer.owned),
    'Expected the profile to begin with at least one locked companion requisition.'
  );
  assert(
    initialRequisitionCatalog.classes
      .filter((offer) => !offer.owned)
      .every((offer) => offer.shortage === offer.cost),
    'Expected zero-chit class requisitions to report their full shortage.'
  );
  const initialMetaUpgradeCatalog = buildMetaUpgradeCatalog(profile);
  assert(
    initialMetaUpgradeCatalog.length === 3,
    `Expected three permanent operations upgrades, received ${initialMetaUpgradeCatalog.length}.`
  );
  assert(
    initialMetaUpgradeCatalog.every(
      (offer) => offer.currentLevel === 0 && !offer.exhausted
    ),
    'Expected a fresh profile to begin with all permanent upgrades at rank 0.'
  );

  function pickBestEventChoice(currentRun, eventScene) {
    let bestChoice = eventScene.choices[0] ?? null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const choice of eventScene.choices) {
      const itemScore = choice.effect.itemId ? 7 : 0;
      const swapScore =
        choice.effect.nextActiveCompanionId &&
        choice.effect.nextActiveCompanionId !== currentRun.activeCompanionId
          ? 2
          : 0;
      const lowHealthBias = currentRun.hero.currentHp <= 12 ? 2 : 1;
      const score =
        choice.effect.metaCurrency +
        choice.effect.runHealing * lowHealthBias +
        itemScore +
        swapScore -
        choice.effect.runDamage * 2;

      if (score > bestScore) {
        bestScore = score;
        bestChoice = choice;
      }
    }

    return bestChoice;
  }

  function assertResumeRoute(currentRun, expectedRoute, context) {
    const resumeTarget = getRunResumeTarget(currentRun);

    assert(
      resumeTarget.route === expectedRoute,
      `Expected resume route ${expectedRoute} for ${context}, received ${resumeTarget.route}.`
    );
  }

  function applyCombatHealthProgress(previousRun, nextRun) {
    const hpDelta = nextRun.hero.currentHp - previousRun.hero.currentHp;

    if (hpDelta > 0) {
      return applyRunProgressDelta(nextRun, {
        healingReceived: hpDelta,
      });
    }

    if (hpDelta < 0) {
      return applyRunProgressDelta(nextRun, {
        damageTaken: Math.abs(hpDelta),
      });
    }

    return nextRun;
  }

  function applyResolvedNodeStats(resolution) {
    return {
      ...resolution,
      run: applyResolvedNodeProgress(resolution.run, resolution.resolvedNode.kind),
    };
  }

  function pickBestRewardOption(currentRun, pendingReward) {
    if (!pendingReward.options || pendingReward.options.length === 0) {
      return pendingReward;
    }

    let bestOption = pendingReward.options[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const option of pendingReward.options) {
      const missingHp = Math.max(0, currentRun.hero.maxHp - currentRun.hero.currentHp);
      const healingWeight = missingHp >= 10 ? 2 : 1;
      const itemScore =
        option.itemId && !currentRun.inventoryItemIds.includes(option.itemId)
          ? 8
          : option.itemId
            ? 3
            : 0;
      const score =
        option.metaCurrency +
        option.runHealing * healingWeight +
        itemScore;

      if (score > bestScore) {
        bestScore = score;
        bestOption = option;
      }
    }

    return syncPendingRewardSelection(pendingReward, bestOption.optionId);
  }

  function cloneCombatState(combat) {
    return {
      ...combat,
      enemy: {
        ...combat.enemy,
      },
      heroStatuses: [...(combat.heroStatuses ?? [])],
      enemyStatuses: [...(combat.enemyStatuses ?? [])],
      log: [...combat.log],
    };
  }

  function cloneRunMap(map) {
    return {
      floors: map.floors.map((floor) => ({
        ...floor,
        nodes: floor.nodes.map((node) => ({ ...node })),
      })),
    };
  }

  function createEventCatalogTestRun(
    eventDefinition,
    companionBondLevels,
    heroClassId = 'it-support',
    chosenCompanionIds = [
      'former-executive-assistant',
      'facilities-goblin',
    ]
  ) {
    const eventRun = createInitialRun({
      heroClassId,
      chosenCompanionIds,
      companionBondLevels,
    });
    const eventMap = cloneRunMap(eventRun.map);
    const eventNode = eventMap.floors[0].nodes[0];

    eventNode.kind = 'event';
    eventNode.label = eventDefinition.title;
    eventNode.description = eventDefinition.description;
    eventNode.status = 'active';

    return {
      ...eventRun,
      map: eventMap,
      currentNodeId: eventNode.id,
    };
  }

  function getBiomeIdForFloorNumber(floorNumber) {
    if (floorNumber <= 4) {
      return 'open-plan-pits';
    }

    if (floorNumber <= 7) {
      return 'team-building-catacombs';
    }

    return 'executive-suite';
  }

  function createRewardCatalogTestRun(
    floorNumber,
    chosenCompanionIds = [
      'former-executive-assistant',
      'facilities-goblin',
    ]
  ) {
    const rewardRun = createInitialRun({
      heroClassId: 'it-support',
      chosenCompanionIds,
    });
    const rewardMap = cloneRunMap(rewardRun.map);
    const rewardFloor = rewardMap.floors[floorNumber - 1];
    const rewardNode = rewardFloor?.nodes.find((node) => node.kind === 'reward');

    assert(rewardFloor, `Expected floor ${floorNumber} to exist for reward testing.`);
    assert(
      rewardNode,
      `Expected floor ${floorNumber} to expose a reward node for biome reward testing.`
    );

    for (const floor of rewardMap.floors) {
      floor.status = floor.floorNumber === floorNumber ? 'active' : 'locked';

      for (const node of floor.nodes) {
        node.status = node.id === rewardNode.id ? 'active' : 'locked';
      }
    }

    return {
      ...rewardRun,
      floorIndex: floorNumber,
      map: rewardMap,
      currentNodeId: rewardNode.id,
    };
  }

  function createEnemyReactionTestRun(
    enemyName,
    {
      heroClassId = 'it-support',
      chosenCompanionIds = [
        'former-executive-assistant',
        'facilities-goblin',
      ],
      kind = 'boss',
    } = {}
  ) {
    const reactionRun = createInitialRun({
      heroClassId,
      chosenCompanionIds,
    });
    const reactionMap = cloneRunMap(reactionRun.map);
    const reactionNode = reactionMap.floors[0].nodes[0];

    reactionNode.kind = kind;
    reactionNode.label = enemyName;
    reactionNode.description = `Test encounter: ${enemyName}`;
    reactionNode.status = 'active';

    for (const floor of reactionMap.floors) {
      floor.status = floor.floorNumber === 1 ? 'active' : 'locked';

      for (const node of floor.nodes) {
        node.status = node.id === reactionNode.id ? 'active' : 'locked';
      }
    }

    return {
      ...reactionRun,
      map: reactionMap,
      currentNodeId: reactionNode.id,
      floorIndex: 1,
    };
  }

  const neutralItemTestRun = createInitialRun({
    heroClassId: 'sales-rep',
    chosenCompanionIds: [
      'security-skeleton',
      'disillusioned-temp',
    ],
  });
  const neutralItemCombatState = createCombatStateForCurrentNode(neutralItemTestRun);
  const baselinePatchResult = performCombatAction(
    {
      ...neutralItemTestRun,
      combatState: cloneCombatState(neutralItemCombatState),
    },
    'patch'
  );
  const tonerPatchResult = performCombatAction(
    {
      ...neutralItemTestRun,
      inventoryItemIds: ['printer-toner-grenade'],
      combatState: cloneCombatState(neutralItemCombatState),
    },
    'patch'
  );
  assert(
    tonerPatchResult.combat.heroHp > baselinePatchResult.combat.heroHp,
    'Expected Printer Toner Grenade to reduce retaliation damage on Patch.'
  );

  const repeatedPatchCombatState = {
    ...cloneCombatState(neutralItemCombatState),
    turnNumber: 2,
    lastActionId: 'patch',
  };
  const repeatedBaselinePatch = performCombatAction(
    {
      ...neutralItemTestRun,
      combatState: cloneCombatState(repeatedPatchCombatState),
    },
    'patch'
  );
  const replyAllPatch = performCombatAction(
    {
      ...neutralItemTestRun,
      inventoryItemIds: ['reply-all-amulet'],
      combatState: cloneCombatState(repeatedPatchCombatState),
    },
    'patch'
  );
  assert(
    replyAllPatch.combat.enemy.currentHp < repeatedBaselinePatch.combat.enemy.currentHp,
    'Expected Reply-All Amulet to increase repeated Patch damage.'
  );

  const baselineEscalateResult = performCombatAction(
    {
      ...neutralItemTestRun,
      combatState: cloneCombatState(neutralItemCombatState),
    },
    'escalate'
  );
  const coffeeEscalateResult = performCombatAction(
    {
      ...neutralItemTestRun,
      inventoryItemIds: ['bottomless-breakroom-coffee'],
      combatState: cloneCombatState(neutralItemCombatState),
    },
    'escalate'
  );
  assert(
    coffeeEscalateResult.combat.heroHp < baselineEscalateResult.combat.heroHp,
    'Expected Bottomless Breakroom Coffee to increase Escalate recoil.'
  );

  const baselineStabilizeResult = performCombatAction(
    {
      ...neutralItemTestRun,
      combatState: cloneCombatState(neutralItemCombatState),
    },
    'stabilize'
  );
  const stressBallStabilizeResult = performCombatAction(
    {
      ...neutralItemTestRun,
      inventoryItemIds: ['stress-ball-of-impact'],
      combatState: cloneCombatState(neutralItemCombatState),
    },
    'stabilize'
  );
  assert(
    stressBallStabilizeResult.combat.enemy.currentHp <
      baselineStabilizeResult.combat.enemy.currentHp,
    'Expected Stress Ball of Impact to deal damage while Stabilize resolves.'
  );

  const itemTestSeedRun = createInitialRun({
    heroClassId: 'it-support',
    chosenCompanionIds: [
      'security-skeleton',
      'disillusioned-temp',
    ],
  });
  const itemTestCombatState = createCombatStateForCurrentNode(itemTestSeedRun);

  const statusTestRun = createInitialRun({
    heroClassId: 'customer-service-rep',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
  });
  const statusTestCombatState = createCombatStateForCurrentNode(statusTestRun);
  const neutralPatchResult = performCombatAction(
    {
      ...statusTestRun,
      combatState: cloneCombatState(statusTestCombatState),
    },
    'patch'
  );
  const onHoldPatchResult = performCombatAction(
    {
      ...statusTestRun,
      combatState: {
        ...cloneCombatState(statusTestCombatState),
        enemyStatuses: [{ id: 'on-hold', turnsRemaining: 1 }],
      },
    },
    'patch'
  );
  assert(
    onHoldPatchResult.combat.heroHp > neutralPatchResult.combat.heroHp,
    'Expected On Hold to reduce the enemy retaliation window.'
  );

  const woundedCombatState = {
    ...cloneCombatState(itemTestCombatState),
    heroHp: Math.max(1, itemTestCombatState.heroHp - 10),
  };
  const stableHealResult = performCombatAction(
    {
      ...itemTestSeedRun,
      combatState: cloneCombatState(woundedCombatState),
    },
    'stabilize'
  );
  const burnoutHealResult = performCombatAction(
    {
      ...itemTestSeedRun,
      combatState: {
        ...cloneCombatState(woundedCombatState),
        heroStatuses: [{ id: 'burnout', turnsRemaining: 2 }],
      },
    },
    'stabilize'
  );
  assert(
    burnoutHealResult.combat.heroHp < stableHealResult.combat.heroHp,
    'Expected Burnout to reduce Stabilize recovery.'
  );

  const cleansedStatusResult = performCombatAction(
    {
      ...itemTestSeedRun,
      combatState: {
        ...cloneCombatState(woundedCombatState),
        heroStatuses: [{ id: 'burnout', turnsRemaining: 2 }],
      },
    },
    'stabilize'
  );
  assert(
    cleansedStatusResult.combat.log.some((entry) =>
      entry.includes('IT Support clears Burnout.')
    ),
    'Expected IT Support Stabilize to clear one hero status before retaliation resolves.'
  );
  const itActionLabels = getCombatActionDefinitions({
    ...itemTestSeedRun,
    combatState: cloneCombatState(itemTestCombatState),
  }).map((action) => action.label);
  assert(
    itActionLabels.join('|') === 'Patch Notes|Escalate Ticket|Stabilize Systems',
    'Expected IT Support to expose its authored combat kit labels.'
  );
  const itNeutralEscalate = performCombatAction(
    {
      ...itemTestSeedRun,
      combatState: cloneCombatState(itemTestCombatState),
    },
    'escalate'
  );
  const itStatusEscalate = performCombatAction(
    {
      ...itemTestSeedRun,
      combatState: {
        ...cloneCombatState(itemTestCombatState),
        enemyStatuses: [{ id: 'on-hold', turnsRemaining: 1 }],
      },
    },
    'escalate'
  );
  assert(
    itStatusEscalate.combat.enemy.currentHp < itNeutralEscalate.combat.enemy.currentHp,
    'Expected IT Support Escalate to hit harder into a disrupted target.'
  );

  const customerServiceRun = createInitialRun({
    heroClassId: 'customer-service-rep',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
  });
  const customerServiceCombatState = createCombatStateForCurrentNode(
    customerServiceRun
  );
  const customerServiceActions = getCombatActionDefinitions({
    ...customerServiceRun,
    combatState: cloneCombatState(customerServiceCombatState),
  });
  assert(
    customerServiceActions.map((action) => action.label).join('|') ===
      'Scripted Reassurance|Escalation Script|Call Recovery',
    'Expected Customer Service Rep to expose its authored combat kit labels.'
  );
  const customerServicePatch = performCombatAction(
    {
      ...customerServiceRun,
      combatState: cloneCombatState(customerServiceCombatState),
    },
    'patch'
  );
  assert(
    customerServicePatch.combat.enemyStatuses.some((status) => status.id === 'ccd'),
    "Expected Customer Service Rep Patch to apply CC'd."
  );
  const customerServiceWoundedState = {
    ...cloneCombatState(customerServiceCombatState),
    heroHp: Math.max(1, customerServiceCombatState.heroHp - 18),
  };
  const customerNeutralStabilize = performCombatAction(
    {
      ...customerServiceRun,
      combatState: cloneCombatState(customerServiceWoundedState),
    },
    'stabilize'
  );
  const customerCcdStabilize = performCombatAction(
    {
      ...customerServiceRun,
      combatState: {
        ...cloneCombatState(customerServiceWoundedState),
        enemyStatuses: [{ id: 'ccd', turnsRemaining: 2 }],
      },
    },
    'stabilize'
  );
  assert(
    customerCcdStabilize.combat.heroHp > customerNeutralStabilize.combat.heroHp,
    "Expected Customer Service Rep Stabilize to recover more against CC'd targets."
  );
  const customerNeutralEscalate = performCombatAction(
    {
      ...customerServiceRun,
      combatState: cloneCombatState(customerServiceCombatState),
    },
    'escalate'
  );
  const customerCcdEscalate = performCombatAction(
    {
      ...customerServiceRun,
      combatState: {
        ...cloneCombatState(customerServiceCombatState),
        enemyStatuses: [{ id: 'ccd', turnsRemaining: 2 }],
      },
    },
    'escalate'
  );
  assert(
    customerCcdEscalate.combat.heroHp > customerNeutralEscalate.combat.heroHp,
    "Expected Customer Service Rep Escalate to reduce retaliation harder against CC'd targets."
  );

  const salesRun = createInitialRun({
    heroClassId: 'sales-rep',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
  });
  const salesCombatState = createCombatStateForCurrentNode(salesRun);
  const salesActions = getCombatActionDefinitions({
    ...salesRun,
    combatState: cloneCombatState(salesCombatState),
  });
  assert(
    salesActions.map((action) => action.label).join('|') ===
      'Warm Lead|Hard Close|Reset The Pitch',
    'Expected Sales Rep to expose its authored combat kit labels.'
  );
  const salesEscalate = performCombatAction(
    {
      ...salesRun,
      combatState: cloneCombatState(salesCombatState),
    },
    'escalate'
  );
  assert(
    salesEscalate.combat.enemyStatuses.some((status) => status.id === 'escalated'),
    'Expected Sales Rep Escalate to apply Escalated.'
  );
  const salesNeutralPatch = performCombatAction(
    {
      ...salesRun,
      combatState: cloneCombatState(salesCombatState),
    },
    'patch'
  );
  const salesEscalatedPatch = performCombatAction(
    {
      ...salesRun,
      combatState: {
        ...cloneCombatState(salesCombatState),
        enemyStatuses: [{ id: 'escalated', turnsRemaining: 2 }],
      },
    },
    'patch'
  );
  assert(
    salesEscalatedPatch.combat.enemy.currentHp < salesNeutralPatch.combat.enemy.currentHp,
    'Expected Sales Rep Patch to cash out extra damage on Escalated targets.'
  );
  const salesWoundedState = {
    ...cloneCombatState(salesCombatState),
    heroHp: Math.max(1, salesCombatState.heroHp - 8),
  };
  const salesNeutralStabilize = performCombatAction(
    {
      ...salesRun,
      combatState: cloneCombatState(salesWoundedState),
    },
    'stabilize'
  );
  const salesEscalatedStabilize = performCombatAction(
    {
      ...salesRun,
      combatState: {
        ...cloneCombatState(salesWoundedState),
        enemyStatuses: [{ id: 'escalated', turnsRemaining: 2 }],
      },
    },
    'stabilize'
  );
  assert(
    salesEscalatedStabilize.combat.enemy.currentHp <
      salesNeutralStabilize.combat.enemy.currentHp,
    'Expected Sales Rep Stabilize to keep pressure on Escalated targets.'
  );

  const internRun = createInitialRun({
    heroClassId: 'intern',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
  });
  const internCombatState = createCombatStateForCurrentNode(internRun);
  const internActions = getCombatActionDefinitions({
    ...internRun,
    combatState: cloneCombatState(internCombatState),
  });
  assert(
    internActions.map((action) => action.label).join('|') ===
      'Ask For Help|Touch Everything|Steal Breakroom Coffee',
    'Expected Intern to expose its authored combat kit labels.'
  );
  const internStabilize = performCombatAction(
    {
      ...internRun,
      combatState: {
        ...cloneCombatState(internCombatState),
        heroHp: Math.max(1, internCombatState.heroHp - 8),
      },
    },
    'stabilize'
  );
  assert(
    internStabilize.combat.enemyStatuses.some((status) => status.id === 'burnout'),
    'Expected Intern Stabilize to spread Burnout onto the enemy.'
  );
  const internLateActions = getCombatActionDefinitions({
    ...internRun,
    combatState: {
      ...cloneCombatState(internCombatState),
      turnNumber: 4,
    },
  });
  assert(
    internLateActions
      .find((action) => action.id === 'escalate')
      ?.description.includes('Chaos scaling adds 3 damage on turn 4.'),
    'Expected Intern Escalate to advertise stronger late-fight scaling.'
  );

  const paralegalRun = createInitialRun({
    heroClassId: 'paralegal',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
  });
  const paralegalCombatState = createCombatStateForCurrentNode(paralegalRun);
  const paralegalActions = getCombatActionDefinitions({
    ...paralegalRun,
    combatState: cloneCombatState(paralegalCombatState),
  });
  assert(
    paralegalActions.map((action) => action.label).join('|') ===
      'Redline Clause|Discovery Demand|File Injunction',
    'Expected Paralegal to expose its authored combat kit labels.'
  );
  const paralegalPatch = performCombatAction(
    {
      ...paralegalRun,
      combatState: cloneCombatState(paralegalCombatState),
    },
    'patch'
  );
  assert(
    paralegalPatch.combat.enemyStatuses.some((status) => status.id === 'micromanaged'),
    'Expected Paralegal Patch to apply Micromanaged.'
  );
  const paralegalNeutralEscalate = performCombatAction(
    {
      ...paralegalRun,
      combatState: cloneCombatState(paralegalCombatState),
    },
    'escalate'
  );
  const paralegalCompromisedEscalate = performCombatAction(
    {
      ...paralegalRun,
      combatState: {
        ...cloneCombatState(paralegalCombatState),
        enemyStatuses: [{ id: 'micromanaged', turnsRemaining: 2 }],
      },
    },
    'escalate'
  );
  assert(
    paralegalCompromisedEscalate.combat.enemy.currentHp <
      paralegalNeutralEscalate.combat.enemy.currentHp,
    'Expected Paralegal Escalate to hit harder into compromised targets.'
  );
  assert(
    paralegalCompromisedEscalate.combat.heroHp > paralegalNeutralEscalate.combat.heroHp,
    'Expected Paralegal Escalate to reduce retaliation into compromised targets.'
  );
  const paralegalStabilize = performCombatAction(
    {
      ...paralegalRun,
      combatState: cloneCombatState(paralegalCombatState),
    },
    'stabilize'
  );
  assert(
    paralegalStabilize.combat.log.some((entry) =>
      entry.includes('is locked On Hold.')
    ),
    'Expected Paralegal Stabilize to lock the enemy On Hold before retaliation resolves.'
  );

  const defaultSynergyRun = createInitialRun({
    heroClassId: 'it-support',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
  });
  const defaultSynergyCards = getActiveTeamSynergyCards(defaultSynergyRun);
  assert(
    defaultSynergyCards.some((card) => card.title === 'Executive Triage') &&
      defaultSynergyCards.some((card) => card.title === 'Paperwork Expedition'),
    'Expected the default roster to surface both the active class-companion and companion-pair synergies.'
  );
  const defaultSynergyCombatState = createCombatStateForCurrentNode(defaultSynergyRun);
  const executiveTriagePatch = performCombatAction(
    {
      ...defaultSynergyRun,
      combatState: cloneCombatState(defaultSynergyCombatState),
    },
    'patch'
  );
  const executiveTriageControlPatch = performCombatAction(
    {
      ...defaultSynergyRun,
      chosenCompanionIds: ['facilities-goblin', 'former-executive-assistant'],
      activeCompanionId: 'facilities-goblin',
      companionBondLevels: {
        'facilities-goblin': 1,
        'former-executive-assistant': 1,
      },
      combatState: cloneCombatState(defaultSynergyCombatState),
    },
    'patch'
  );
  assert(
    executiveTriagePatch.combat.enemy.currentHp <
      executiveTriageControlPatch.combat.enemy.currentHp,
    'Expected Executive Triage to increase Patch damage.'
  );
  assert(
    getCombatActionDefinitions(defaultSynergyRun)
      .find((action) => action.id === 'patch')
      ?.description.includes('Executive Triage adds 1 damage and reduces retaliation by 1.'),
    'Expected the live Patch definition to surface the Executive Triage combat modifier.'
  );
  const woundedSynergyCombatState = {
    ...cloneCombatState(defaultSynergyCombatState),
    heroHp: Math.max(1, defaultSynergyCombatState.heroHp - 8),
  };
  const paperworkExpeditionStabilize = performCombatAction(
    {
      ...defaultSynergyRun,
      combatState: cloneCombatState(woundedSynergyCombatState),
    },
    'stabilize'
  );
  const paperworkExpeditionControl = performCombatAction(
    {
      ...defaultSynergyRun,
      chosenCompanionIds: ['former-executive-assistant', 'security-skeleton'],
      activeCompanionId: 'former-executive-assistant',
      companionBondLevels: {
        'former-executive-assistant': 1,
        'security-skeleton': 1,
      },
      combatState: cloneCombatState(woundedSynergyCombatState),
    },
    'stabilize'
  );
  assert(
    paperworkExpeditionStabilize.combat.heroHp >
      paperworkExpeditionControl.combat.heroHp,
    'Expected Paperwork Expedition to improve Stabilize recovery.'
  );

  const hrReactionRun = createEnemyReactionTestRun('HR Compliance Director');
  const hrReactionState = createCombatStateForCurrentNode(hrReactionRun);
  const hrReactionControlState = createCombatStateForCurrentNode(
    createEnemyReactionTestRun('HR Compliance Director', {
      chosenCompanionIds: ['security-skeleton', 'facilities-goblin'],
    })
  );
  assert(
    hrReactionState.enemy.maxHp === hrReactionControlState.enemy.maxHp + 4,
    'Expected HR Compliance Director to add extra HP against Executive Triage.'
  );
  assert(
    hrReactionState.heroStatuses.some((status) => status.id === 'micromanaged'),
    'Expected HR Compliance Director to open with Micromanaged against Executive Triage.'
  );
  assert(
    getEnemyTeamCountermeasureCards(hrReactionRun, hrReactionState.enemy.enemyId).some(
      (card) => card.title === 'Policy Audit Spiral'
    ),
    'Expected the HR countermeasure card to surface against Executive Triage.'
  );

  const abyssalAssistantReactionRun = createEnemyReactionTestRun(
    'Executive Assistant to the Abyssal CEO'
  );
  const abyssalAssistantState = createCombatStateForCurrentNode(
    abyssalAssistantReactionRun
  );
  const abyssalAssistantControlState = createCombatStateForCurrentNode(
    createEnemyReactionTestRun('Executive Assistant to the Abyssal CEO', {
      chosenCompanionIds: ['former-executive-assistant', 'security-skeleton'],
    })
  );
  assert(
    abyssalAssistantState.enemy.maxHp ===
      abyssalAssistantControlState.enemy.maxHp + 3,
    'Expected the abyssal assistant to add extra HP against Paperwork Expedition.'
  );
  assert(
    abyssalAssistantState.heroStatuses.some((status) => status.id === 'on-hold'),
    'Expected the abyssal assistant to put Paperwork Expedition On Hold immediately.'
  );

  const chiefCountermeasureRun = createEnemyReactionTestRun(
    'Chief Synergy Officer',
    {
      chosenCompanionIds: ['former-executive-assistant', 'security-skeleton'],
    }
  );
  const chiefCountermeasures = getEnemyTeamCountermeasures(
    chiefCountermeasureRun,
    'chief-synergy-officer'
  );
  assert(
    chiefCountermeasures.some(
      (countermeasure) =>
        countermeasure.title === 'Weaponized Alignment' &&
        countermeasure.enemyDamageBonus === 1
    ),
    'Expected Chief Synergy Officer to gain extra retaliation damage against Boardroom Lockdown.'
  );
  assert(
    createCombatStateForCurrentNode(chiefCountermeasureRun).heroStatuses.some(
      (status) => status.id === 'ccd'
    ),
    "Expected Chief Synergy Officer to open with CC'd against Boardroom Lockdown."
  );

  const procurementCountermeasureRun = createEnemyReactionTestRun(
    'Procurement Horror',
    {
      chosenCompanionIds: ['facilities-goblin', 'disillusioned-temp'],
      kind: 'battle',
    }
  );
  assert(
    getEnemyTeamCountermeasures(
      procurementCountermeasureRun,
      'procurement-horror'
    ).some(
      (countermeasure) =>
        countermeasure.title === 'Vendor Lockout' &&
        countermeasure.enemyDamageBonus === 1
    ),
    'Expected Procurement Horror to react to Disaster Salvage with extra damage pressure.'
  );
  assert(
    createCombatStateForCurrentNode(procurementCountermeasureRun).heroStatuses.some(
      (status) => status.id === 'burnout'
    ),
    'Expected Procurement Horror to open with Burnout against Disaster Salvage.'
  );

  assert(
    bondSceneDefinitions.length >= 10,
    'Expected the authored bond scene catalog to include milestone scenes for the roster.'
  );
  assert(
    getBondScenesForCompanion('former-executive-assistant').length === 2,
    'Expected each authored companion to expose both level 3 and level 5 bond scenes.'
  );
  assert(
    getUnlockedBondScenesForLevel('former-executive-assistant', 2).length === 0,
    'Expected bond scenes to remain locked below the milestone threshold.'
  );
  assert(
    getUnlockedBondScenesForLevel('former-executive-assistant', 5).length === 2,
    'Expected both milestone scenes to unlock by bond level 5.'
  );

  const bondBaselineRun = createInitialRun({
    heroClassId: 'it-support',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
    companionBondLevels: {
      'former-executive-assistant': 1,
      'facilities-goblin': 1,
    },
  });
  const bondEliteRun = createInitialRun({
    heroClassId: 'it-support',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
    companionBondLevels: {
      'former-executive-assistant': 5,
      'facilities-goblin': 5,
    },
  });
  const leadSupportCards = getRunCompanionSupportCards(bondEliteRun);
  assert(
    leadSupportCards.length === 2 &&
      leadSupportCards.some((card) => card.role === 'active') &&
      leadSupportCards.some((card) => card.role === 'reserve'),
    'Expected companion support cards to expose both lead and reserve perks.'
  );

  const bondBaselineCombatState = createCombatStateForCurrentNode(bondBaselineRun);
  const bondEliteIntroCombatState = createCombatStateForCurrentNode({
    ...bondBaselineRun,
    companionBondLevels: {
      'former-executive-assistant': 5,
      'facilities-goblin': 5,
    },
  });
  assert(
    bondBaselineCombatState.log.some((entry) => entry.startsWith('Lead Comms - ')) &&
      bondBaselineCombatState.log.some((entry) => entry.startsWith('Reserve Comms - ')),
    'Expected combat setup to include both lead and reserve companion comms.'
  );
  assert(
    getFirstCompanionCommsEntry(bondBaselineCombatState.log, 'Lead Comms') !==
      getFirstCompanionCommsEntry(bondEliteIntroCombatState.log, 'Lead Comms'),
    'Expected higher bond levels to change encounter-start lead companion comms.'
  );
  const bondBaselinePatch = performCombatAction(
    {
      ...bondBaselineRun,
      combatState: cloneCombatState(bondBaselineCombatState),
    },
    'patch'
  );
  const bondElitePatch = performCombatAction(
    {
      ...bondEliteRun,
      combatState: cloneCombatState(bondBaselineCombatState),
    },
    'patch'
  );
  assert(
    bondElitePatch.combat.enemy.currentHp < bondBaselinePatch.combat.enemy.currentHp,
    'Expected higher bond lead perks to increase opening combat pressure.'
  );
  assert(
    getLatestCompanionCommsEntry(bondBaselinePatch.combat.log) !==
      getLatestCompanionCommsEntry(bondElitePatch.combat.log),
    'Expected higher bond levels to change combat action companion comms.'
  );

  const healingTestReward = {
    rewardId: 'bond-healing-test',
    sourceNodeId: 'node-test',
    sourceKind: 'reward-node',
    title: 'Healing Test',
    description: 'Reserve support should improve this heal.',
    selectedOptionId: null,
    options: null,
    metaCurrency: 0,
    runHealing: 10,
    itemId: null,
    createdAt: bondEliteRun.updatedAt,
  };
  const woundedBaselineRun = {
    ...bondBaselineRun,
    hero: {
      ...bondBaselineRun.hero,
      currentHp: Math.max(1, bondBaselineRun.hero.currentHp - 20),
    },
  };
  const woundedEliteRun = {
    ...bondEliteRun,
    hero: {
      ...bondEliteRun.hero,
      currentHp: Math.max(1, bondEliteRun.hero.currentHp - 20),
    },
  };
  const bondBaselineHeal = applyPendingRewardToRun(woundedBaselineRun, healingTestReward);
  const bondEliteHeal = applyPendingRewardToRun(woundedEliteRun, healingTestReward);
  assert(
    bondEliteHeal.healingApplied > bondBaselineHeal.healingApplied,
    'Expected higher bond reserve perks to improve reward healing.'
  );

  assert(
    eventDefinitions.length >= 10,
    'Expected the authored event catalog to include the expanded post-handoff set.'
  );
  assert(
    getEventDefinitionsForBiome('open-plan-pits').length >= 5,
    'Expected Open-Plan Pits to have a biome-specific event pool.'
  );
  assert(
    getEventDefinitionsForBiome('team-building-catacombs').length >= 4,
    'Expected Team-Building Catacombs to have a biome-specific event pool.'
  );
  assert(
    getEventDefinitionsForBiome('executive-suite').length >= 4,
    'Expected Executive Suite to have a biome-specific event pool.'
  );
  assert(
    run.map.floors.length === 10,
    'Expected the seeded run map to expand to the full 10-floor live structure.'
  );
  assert(
    run.map.floors[run.map.floors.length - 1]?.nodes.slice(-1)[0]?.label ===
      expectedBossByFloor[10],
    'Expected the final floor to end on the Executive Assistant to the Abyssal CEO checkpoint.'
  );
  for (const floor of run.map.floors) {
    const biomeEventDefinitions = getEventDefinitionsForBiome(
      getBiomeIdForFloorNumber(floor.floorNumber)
    );

    for (const node of floor.nodes.filter((candidate) => candidate.kind === 'event')) {
      assert(
        biomeEventDefinitions.some((eventDefinition) => eventDefinition.title === node.label),
        `Expected event node ${node.label} on floor ${floor.floorNumber} to come from the correct biome pool.`
      );
    }
  }

  const openPlanRewardRun = createRewardCatalogTestRun(2);
  const openPlanRewardNode = openPlanRewardRun.map.floors[1].nodes.find(
    (node) => node.kind === 'reward'
  );
  assert(openPlanRewardNode, 'Expected floor 2 to expose an Open-Plan reward node.');
  const openPlanRewardOptions = createPendingReward(
    openPlanRewardRun,
    openPlanRewardNode,
    'reward-node'
  ).options;
  const teamBuildingRewardRun = createRewardCatalogTestRun(5);
  const teamBuildingRewardNode = teamBuildingRewardRun.map.floors[4].nodes.find(
    (node) => node.kind === 'reward'
  );
  assert(
    teamBuildingRewardNode,
    'Expected floor 5 to expose a Team-Building reward node.'
  );
  const teamBuildingRewardOptions = createPendingReward(
    teamBuildingRewardRun,
    teamBuildingRewardNode,
    'reward-node'
  ).options;
  const executiveRewardRun = createRewardCatalogTestRun(9);
  const executiveRewardNode = executiveRewardRun.map.floors[8].nodes.find(
    (node) => node.kind === 'reward'
  );
  assert(
    executiveRewardNode,
    'Expected floor 9 to expose an Executive reward node.'
  );
  const executiveRewardOptions = createPendingReward(
    executiveRewardRun,
    executiveRewardNode,
    'reward-node'
  ).options;

  assert(
    openPlanRewardOptions?.some((option) => option.label === 'Expense Fraud Envelope'),
    'Expected Open-Plan Pits reward rooms to keep the prototype office-theft packages.'
  );
  assert(
    teamBuildingRewardOptions?.some((option) => option.label === 'Per Diem Skimming'),
    'Expected Team-Building Catacombs reward rooms to expose offsite-specific payout packages.'
  );
  assert(
    executiveRewardOptions?.some((option) => option.label === 'Black Card Overage'),
    'Expected Executive Suite reward rooms to expose executive-specific payout packages.'
  );

  assert(
    openPlanRewardOptions?.find((option) => option.optionId === 'triage-cart')
      ?.runHealing === 22,
    'Expected the default pair synergy plus Facilities Goblin to improve Open-Plan recovery hauls.'
  );
  assert(
    openPlanRewardOptions?.find((option) => option.optionId === 'expense-fraud')
      ?.metaCurrency === 16,
    'Expected Executive Triage plus Former Executive Assistant to improve Open-Plan cash hauls.'
  );
  assert(
    openPlanRewardOptions
      ?.find((option) => option.optionId === 'triage-cart')
      ?.synergyBonusLabel?.includes('Paperwork Expedition'),
    'Expected Open-Plan recovery hauls to surface the default pair synergy label.'
  );
  assert(
    openPlanRewardOptions
      ?.find((option) => option.optionId === 'expense-fraud')
      ?.synergyBonusLabel?.includes('Executive Triage'),
    'Expected Open-Plan cash hauls to surface the active class-companion synergy label.'
  );

  const securityTempRewardRun = createRewardCatalogTestRun(5, [
    'security-skeleton',
    'disillusioned-temp',
  ]);
  const securityTempRewardNode = securityTempRewardRun.map.floors[4].nodes.find(
    (node) => node.kind === 'reward'
  );
  assert(
    securityTempRewardNode,
    'Expected floor 5 to expose a Team-Building reward node for companion bonus testing.'
  );
  const securityTempRewardOptions = createPendingReward(
    securityTempRewardRun,
    securityTempRewardNode,
    'reward-node'
  ).options;
  assert(
    securityTempRewardOptions?.find((option) => option.optionId === 'per-diem-skimming')
      ?.metaCurrency === 18,
    'Expected Security Skeleton and Disillusioned Temp to stack on Per Diem Skimming.'
  );
  assert(
    securityTempRewardOptions?.find((option) => option.optionId === 'per-diem-skimming')
      ?.runHealing === 7,
    'Expected Disillusioned Temp to improve Per Diem Skimming recovery.'
  );
  assert(
    securityTempRewardOptions
      ?.find((option) => option.optionId === 'per-diem-skimming')
      ?.companionBonusLabel?.includes('Security Skeleton') &&
      securityTempRewardOptions
        ?.find((option) => option.optionId === 'per-diem-skimming')
        ?.companionBonusLabel?.includes('Disillusioned Temp'),
    'Expected stacked reward companion edges to surface both contributing companions.'
  );

  const copierRewardRun = createRewardCatalogTestRun(2, [
    'possessed-copier',
    'facilities-goblin',
  ]);
  const copierRewardNode = copierRewardRun.map.floors[1].nodes.find(
    (node) => node.kind === 'reward'
  );
  assert(
    copierRewardNode,
    'Expected floor 2 to expose an Open-Plan reward node for copier bonus testing.'
  );
  const copierRewardOptions = createPendingReward(
    copierRewardRun,
    copierRewardNode,
    'reward-node'
  ).options;
  const copierRewardControlOptions = createPendingReward(
    {
      ...copierRewardRun,
      chosenCompanionIds: ['facilities-goblin', 'security-skeleton'],
      activeCompanionId: 'facilities-goblin',
      companionBondLevels: {
        'facilities-goblin': 1,
        'security-skeleton': 1,
      },
    },
    copierRewardNode,
    'reward-node'
  ).options;
  assert(
    copierRewardOptions?.find((option) => option.optionId === 'contraband-locker')
      ?.metaCurrency ===
      (copierRewardControlOptions?.find(
        (option) => option.optionId === 'contraband-locker'
      )?.metaCurrency ?? 0) + 2,
    'Expected Possessed Copier to improve Contraband Locker payouts.'
  );
  assert(
    copierRewardOptions
      ?.find((option) => option.optionId === 'contraband-locker')
      ?.companionBonusLabel?.includes('Possessed Copier'),
    'Expected contraband package bonuses to surface the contributing companion.'
  );

  const boardroomRewardRun = createRewardCatalogTestRun(9, [
    'former-executive-assistant',
    'security-skeleton',
  ]);
  const boardroomRewardNode = boardroomRewardRun.map.floors[8].nodes.find(
    (node) => node.kind === 'reward'
  );
  assert(
    boardroomRewardNode,
    'Expected floor 9 to expose an Executive reward node for boardroom synergy testing.'
  );
  const boardroomRewardOptions = createPendingReward(
    boardroomRewardRun,
    boardroomRewardNode,
    'reward-node'
  ).options;
  assert(
    boardroomRewardOptions?.find((option) => option.optionId === 'black-card-overage')
      ?.metaCurrency === 23,
    'Expected Boardroom Lockdown to stack with both executive companions on Black Card Overage.'
  );
  assert(
    boardroomRewardOptions
      ?.find((option) => option.optionId === 'black-card-overage')
      ?.synergyBonusLabel?.includes('Boardroom Lockdown'),
    'Expected executive haul packages to surface the boardroom synergy label.'
  );

  for (const eventDefinition of eventDefinitions) {
    const eventCatalogRun = createEventCatalogTestRun(eventDefinition);
    const eventScene = getEventSceneForCurrentNode(eventCatalogRun);
    const bondedEventScene = getEventSceneForCurrentNode(
      createEventCatalogTestRun(eventDefinition, {
        'former-executive-assistant': 5,
        'facilities-goblin': 5,
      })
    );

    assert(
      eventScene.eventId === eventDefinition.id,
      `Expected scene lookup to preserve event id ${eventDefinition.id}.`
    );
    assert(
      eventScene.choices.length === 3,
      `Expected event ${eventDefinition.id} to expose three authored choices.`
    );
    assert(
      eventScene.choices.every((choice) => choice.preview.length > 0),
      `Expected every choice preview for ${eventDefinition.id} to be populated.`
    );
    assert(
      eventScene.classMoment.classId === 'it-support' &&
        eventScene.classMoment.line.length > 0,
      `Expected event ${eventDefinition.id} to surface an IT Support class readout.`
    );
    assert(
      eventScene.choices.some((choice) => choice.classBonusLabel),
      `Expected event ${eventDefinition.id} to include at least one class-tuned choice for IT Support.`
    );
    assert(
      eventScene.companionMoments.length === 2,
      `Expected event ${eventDefinition.id} to surface active and reserve companion readouts.`
    );
    assert(
      eventScene.companionMoments.every((moment) => moment.line.length > 0),
      `Expected every companion readout for ${eventDefinition.id} to contain authored banter.`
    );
    assert(
      bondedEventScene.companionMoments[0].line !== eventScene.companionMoments[0].line,
      `Expected higher bond levels to change the active companion readout for ${eventDefinition.id}.`
    );
    const salesEventScene = getEventSceneForCurrentNode(
      createEventCatalogTestRun(eventDefinition, undefined, 'sales-rep')
    );
    assert(
      salesEventScene.classMoment.classId === 'sales-rep' &&
        salesEventScene.classMoment.line !== eventScene.classMoment.line,
      `Expected event ${eventDefinition.id} to change the class readout for Sales Rep.`
    );
    assert(
      salesEventScene.choices.some((choice) => choice.classBonusLabel),
      `Expected event ${eventDefinition.id} to include at least one class-tuned choice for Sales Rep.`
    );

    const appliedChoice = applyEventChoice(eventCatalogRun, eventScene.choices[0].id);

    assert(
      appliedChoice.eventId === eventDefinition.id,
      `Expected event application to resolve ${eventDefinition.id}.`
    );
  }

  for (const classDefinition of classDefinitions) {
    const classEventRun = createEventCatalogTestRun(
      eventDefinitions[0],
      undefined,
      classDefinition.id
    );
    const classEventScene = getEventSceneForCurrentNode(classEventRun);

    assert(
      classEventScene.classMoment.classId === classDefinition.id &&
        classEventScene.classMoment.className === classDefinition.name,
      `Expected event class readouts to preserve class identity for ${classDefinition.id}.`
    );
    assert(
      classEventScene.choices.some((choice) => choice.classBonusLabel),
      `Expected ${classDefinition.id} to receive a class-tuned event option.`
    );
  }

  const suspiciousElevatorDefinition = eventDefinitions.find(
    (eventDefinition) => eventDefinition.id === 'suspicious-elevator-pitch'
  );
  assert(
    suspiciousElevatorDefinition,
    'Expected Suspicious Elevator Pitch to exist in the event catalog.'
  );
  const salesElevatorScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      suspiciousElevatorDefinition,
      undefined,
      'sales-rep',
      ['security-skeleton', 'possessed-copier']
    )
  );
  assert(
    salesElevatorScene.choices.find((choice) => choice.id === 'demand-upfront-bribe')
      ?.effect.metaCurrency === 15,
    'Expected Sales Rep to pull extra scrap from Suspicious Elevator Pitch.'
  );
  const expenseReportDefinition = eventDefinitions.find(
    (eventDefinition) => eventDefinition.id === 'expense-report-exorcism'
  );
  assert(
    expenseReportDefinition,
    'Expected Expense Report Exorcism to exist in the event catalog.'
  );
  const paralegalExorcismScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      expenseReportDefinition,
      undefined,
      'paralegal'
    )
  );
  assert(
    paralegalExorcismScene.choices.find((choice) => choice.id === 'audit-the-possession')
      ?.effect.metaCurrency === 11,
    'Expected Paralegal to extract extra scrap from Expense Report Exorcism.'
  );
  const unsafeTeamBuildingDefinition = eventDefinitions.find(
    (eventDefinition) => eventDefinition.id === 'unsafe-team-building'
  );
  assert(
    unsafeTeamBuildingDefinition,
    'Expected Unsafe Team Building to exist in the event catalog.'
  );
  const facilitiesUnsafeScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      unsafeTeamBuildingDefinition,
      undefined,
      'it-support',
      ['facilities-goblin', 'former-executive-assistant']
    )
  );
  assert(
    facilitiesUnsafeScene.choices.find((choice) => choice.id === 'loot-welcome-bag')
      ?.effect.runHealing === 9,
    'Expected Paperwork Expedition to stack with Facilities Goblin on Unsafe Team Building recovery.'
  );
  assert(
    facilitiesUnsafeScene.choices.find((choice) => choice.id === 'loot-welcome-bag')
      ?.companionBonusLabel?.includes('Facilities Goblin'),
    'Expected Facilities Goblin to surface a visible companion edge label.'
  );
  assert(
    facilitiesUnsafeScene.choices.find((choice) => choice.id === 'loot-welcome-bag')
      ?.synergyBonusLabel?.includes('Paperwork Expedition'),
    'Expected Unsafe Team Building to surface the default pair synergy label.'
  );

  const mandatoryFeedbackDefinition = eventDefinitions.find(
    (eventDefinition) => eventDefinition.id === 'mandatory-feedback-loop'
  );
  assert(
    mandatoryFeedbackDefinition,
    'Expected Mandatory Feedback Loop to exist in the event catalog.'
  );
  const executiveTriageScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      mandatoryFeedbackDefinition,
      undefined,
      'it-support',
      ['former-executive-assistant', 'facilities-goblin']
    )
  );
  const executiveTriageControlScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      mandatoryFeedbackDefinition,
      undefined,
      'it-support',
      ['facilities-goblin', 'former-executive-assistant']
    )
  );
  assert(
    executiveTriageScene.choices.find((choice) => choice.id === 'cc-the-reserve')
      ?.effect.metaCurrency ===
      (executiveTriageControlScene.choices.find(
        (choice) => choice.id === 'cc-the-reserve'
      )?.effect.metaCurrency ?? 0) + 1,
    'Expected Executive Triage to improve Mandatory Feedback Loop payouts.'
  );
  assert(
    executiveTriageScene.choices.find((choice) => choice.id === 'cc-the-reserve')
      ?.synergyBonusLabel?.includes('Executive Triage'),
    'Expected Mandatory Feedback Loop to surface the active class-companion synergy label.'
  );

  const goldenParachuteDefinition = eventDefinitions.find(
    (eventDefinition) => eventDefinition.id === 'golden-parachute-auction'
  );
  assert(
    goldenParachuteDefinition,
    'Expected Golden Parachute Auction to exist in the event catalog.'
  );
  const executiveAssistantAuctionScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      goldenParachuteDefinition,
      undefined,
      'it-support',
      ['former-executive-assistant', 'facilities-goblin']
    )
  );
  assert(
    executiveAssistantAuctionScene.choices.find(
      (choice) => choice.id === 'skim-the-payout-table'
    )?.effect.metaCurrency === 15,
    'Expected Former Executive Assistant to improve Golden Parachute Auction payouts.'
  );
  assert(
    executiveAssistantAuctionScene.choices.find(
      (choice) => choice.id === 'skim-the-payout-table'
    )?.effect.runDamage === 2,
    'Expected Former Executive Assistant to soften Golden Parachute Auction backlash.'
  );

  const allHandsDefinition = eventDefinitions.find(
    (eventDefinition) => eventDefinition.id === 'all-hands-mutiny'
  );
  assert(
    allHandsDefinition,
    'Expected All Hands Mutiny to exist in the event catalog.'
  );
  const securityMutinyScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      allHandsDefinition,
      undefined,
      'it-support',
      ['security-skeleton', 'facilities-goblin']
    )
  );
  assert(
    securityMutinyScene.choices.find((choice) => choice.id === 'seize-the-mic')
      ?.effect.metaCurrency === 10,
    'Expected Security Skeleton to improve All Hands Mutiny payouts.'
  );
  assert(
    securityMutinyScene.choices.find((choice) => choice.id === 'seize-the-mic')
      ?.effect.runDamage === 1,
    'Expected Security Skeleton to reduce All Hands Mutiny self-damage.'
  );

  const boardroomAuctionScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      goldenParachuteDefinition,
      undefined,
      'it-support',
      ['former-executive-assistant', 'security-skeleton']
    )
  );
  const boardroomAuctionControlScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      goldenParachuteDefinition,
      undefined,
      'it-support',
      ['former-executive-assistant', 'facilities-goblin']
    )
  );
  assert(
    boardroomAuctionScene.choices.find(
      (choice) => choice.id === 'nominate-the-reserve-bidder'
    )?.effect.metaCurrency ===
      (boardroomAuctionControlScene.choices.find(
        (choice) => choice.id === 'nominate-the-reserve-bidder'
      )?.effect.metaCurrency ?? 0) + 2,
    'Expected Boardroom Lockdown to improve Golden Parachute Auction reserve-bidder payouts.'
  );
  assert(
    boardroomAuctionScene.choices.find(
      (choice) => choice.id === 'nominate-the-reserve-bidder'
    )?.synergyBonusLabel?.includes('Boardroom Lockdown'),
    'Expected Golden Parachute Auction to surface the boardroom pair synergy label.'
  );

  const copierExorcismScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      expenseReportDefinition,
      undefined,
      'it-support',
      ['possessed-copier', 'facilities-goblin']
    )
  );
  assert(
    copierExorcismScene.choices.find((choice) => choice.id === 'feed-it-receipts')
      ?.effect.metaCurrency === 4,
    'Expected Possessed Copier to improve Expense Report Exorcism payouts.'
  );
  assert(
    copierExorcismScene.choices.find((choice) => choice.id === 'feed-it-receipts')
      ?.effect.runHealing === 3,
    'Expected Possessed Copier to improve Expense Report Exorcism recovery.'
  );

  const shadowItDefinition = eventDefinitions.find(
    (eventDefinition) => eventDefinition.id === 'shadow-it-market'
  );
  assert(
    shadowItDefinition,
    'Expected Shadow IT Market to exist in the event catalog.'
  );
  const tempShadowScene = getEventSceneForCurrentNode(
    createEventCatalogTestRun(
      shadowItDefinition,
      undefined,
      'it-support',
      ['disillusioned-temp', 'facilities-goblin']
    )
  );
  assert(
    tempShadowScene.choices.find((choice) => choice.id === 'let-the-reserve-haggle')
      ?.effect.metaCurrency === 7,
    'Expected Disaster Salvage to stack with Disillusioned Temp on Shadow IT Market payouts.'
  );
  assert(
    tempShadowScene.choices.find((choice) => choice.id === 'let-the-reserve-haggle')
      ?.effect.runHealing === 7,
    'Expected Disaster Salvage to stack with Disillusioned Temp on Shadow IT Market recovery.'
  );
  assert(
    tempShadowScene.choices.find((choice) => choice.id === 'let-the-reserve-haggle')
      ?.synergyBonusLabel?.includes('Disaster Salvage'),
    'Expected Shadow IT Market to surface the salvage pair synergy label.'
  );

  while (run.runStatus === 'in_progress' && run.currentNodeId) {
    const currentNode = getCurrentRunNode(run);
    assert(currentNode, 'Expected a current node during the smoke simulation.');
    flowLog.push(`Node ${currentNode.id} (${currentNode.kind})`);
    const floorRotationAvailable = canRotateActiveCompanionAtFloorStart(run);

    if (floorRotationAvailable) {
      assertResumeRoute(run, '/run-map', `floor deployment ${currentNode.id}`);
      const previousActiveCompanionId = run.activeCompanionId;
      const previousReserveCompanionId = getReserveCompanionId(run);
      const previousSupportCards = getRunCompanionSupportCards(run);

      run = rotateActiveCompanionAtFloorStart(run);
      observedFloorRotation = true;

      assert(
        run.activeCompanionId === previousReserveCompanionId,
        'Expected floor-start rotation to promote the reserve companion to active lead.'
      );
      assert(
        getReserveCompanionId(run) === previousActiveCompanionId,
        'Expected floor-start rotation to demote the previous lead into reserve.'
      );
      assert(
        previousSupportCards.find((card) => card.role === 'active')?.companionId ===
          previousActiveCompanionId,
        'Expected support cards to reflect the pre-rotation lead.'
      );
      assert(
        getRunCompanionSupportCards(run).find((card) => card.role === 'active')
          ?.companionId === run.activeCompanionId,
        'Expected support cards to reflect the rotated lead.'
      );
    }

    if (currentNode.kind === 'battle' || currentNode.kind === 'boss') {
      if (!floorRotationAvailable) {
        assertResumeRoute(run, '/battle', currentNode.id);
      }
      const combatState = createCombatStateForCurrentNode(run);
      if (currentNode.kind === 'boss') {
        const expectedBossName = expectedBossByFloor[currentNode.floorNumber];

        assert(
          expectedBossName,
          `Expected floor ${currentNode.floorNumber} to not surface an unexpected boss checkpoint.`
        );
        assert(
          combatState.enemy.name === expectedBossName,
          `Expected floor ${currentNode.floorNumber} boss to be ${expectedBossName}, received ${combatState.enemy.name}.`
        );
        observedBosses.push(combatState.enemy.name);
      }
      run = {
        ...run,
        hero: {
          currentHp: combatState.heroHp,
          maxHp: combatState.heroMaxHp,
        },
        combatState,
      };
      assert(
        run.hero.currentHp === run.combatState.heroHp,
        'Expected combat initialization to preserve the run hero HP.'
      );

      const winningSequence = findWinningActionSequence(run, performCombatAction);
      assert(
        winningSequence && winningSequence.length > 0,
        `Expected a winning combat line for node ${currentNode.id}.`
      );

      while (run.combatState && run.combatState.phase === 'player-turn') {
        const actionId = winningSequence.shift();
        assert(actionId, 'Expected a combat action from the winning sequence.');

        const combatResult = performCombatAction(run, actionId);
        run = applyCombatHealthProgress(run, combatResult.run);
        observedPersistentHeroSync =
          observedPersistentHeroSync ||
          run.hero.currentHp === combatResult.combat.heroHp;

        if (combatResult.outcome === 'defeat') {
          break;
        }

        if (combatResult.outcome === 'victory') {
          const rewardSourceNode = currentNode;

          if (rewardSourceNode.kind !== 'boss') {
            const rewardReadyRun = {
              ...run,
              combatState: null,
              pendingReward: createPendingReward(
                run,
                rewardSourceNode,
                'battle-victory'
              ),
            };
            assertResumeRoute(
              rewardReadyRun,
              '/reward',
              `pending reward after ${rewardSourceNode.id}`
            );
            const resolution = applyResolvedNodeStats(
              resolveCurrentRunNode(rewardReadyRun)
            );
            const rewardResult = applyPendingReward(
              profile,
              resolution.run.pendingReward
            );
            const runRewardResult = applyPendingRewardToRun(
              resolution.run,
              resolution.run.pendingReward
            );
            profile = rewardResult.profile;
            claimedRewardCount += 1;
            observedRunItemPickup =
              observedRunItemPickup || Boolean(runRewardResult.addedRunItemId);
            run = applyRunProgressDelta(
              {
                ...runRewardResult.run,
                pendingReward: null,
              },
              {
                rewardsClaimed: 1,
                metaCurrencyEarned: rewardResult.metaCurrencyAwarded,
                healingReceived: runRewardResult.healingApplied,
                collectedItemId: runRewardResult.addedRunItemId,
              }
            );
          } else {
            run = {
              ...run,
              combatState: null,
              pendingReward: null,
            };
            const resolution = applyResolvedNodeStats(resolveCurrentRunNode(run));
            run = resolution.run;
          }
          break;
        }
      }

      if (run.runStatus === 'failed') {
        break;
      }

      continue;
    }

    if (currentNode.kind === 'reward') {
      if (!floorRotationAvailable) {
        assertResumeRoute(run, '/reward', currentNode.id);
      }
      const pendingReward = pickBestRewardOption(
        run,
        createPendingReward(run, currentNode, 'reward-node')
      );
      observedRewardRoomOptions =
        observedRewardRoomOptions || Boolean(pendingReward.options?.length);
      const rewardResult = applyPendingReward(profile, pendingReward);
      const runRewardResult = applyPendingRewardToRun(run, pendingReward);
      profile = rewardResult.profile;
      claimedRewardCount += 1;
      observedRunItemPickup =
        observedRunItemPickup || Boolean(runRewardResult.addedRunItemId);
      run = applyRunProgressDelta(
        {
          ...runRewardResult.run,
          pendingReward: null,
        },
        {
          rewardsClaimed: 1,
          metaCurrencyEarned: rewardResult.metaCurrencyAwarded,
          healingReceived: runRewardResult.healingApplied,
          collectedItemId: runRewardResult.addedRunItemId,
        }
      );
      const resolution = applyResolvedNodeStats(resolveCurrentRunNode(run));
      run = resolution.run;
      continue;
    }

    if (currentNode.kind === 'event') {
      if (!floorRotationAvailable) {
        assertResumeRoute(run, '/event', currentNode.id);
      }
      const eventScene = getEventSceneForCurrentNode(run);
      const chosenEventChoice = pickBestEventChoice(run, eventScene);
      assert(chosenEventChoice, `Expected an event choice for node ${currentNode.id}.`);

      const eventRunResult = applyEventChoice(run, chosenEventChoice.id);
      const eventProfileResult = applyEventChoiceToProfile(profile, {
        eventId: eventRunResult.eventId,
        reward: {
          rewardId: `smoke-event-${eventRunResult.eventId}-${chosenEventChoice.id}`,
          sourceNodeId: currentNode.id,
          sourceKind: 'reward-node',
          title: chosenEventChoice.label,
          description: chosenEventChoice.outcomeText,
          selectedOptionId: null,
          options: null,
          metaCurrency: chosenEventChoice.effect.metaCurrency,
          runHealing: chosenEventChoice.effect.runHealing,
          itemId: chosenEventChoice.effect.itemId,
          createdAt: run.updatedAt,
        },
      });

      profile = eventProfileResult.profile;
      observedEventUnlock =
        observedEventUnlock ||
        profile.unlockedEventIds.includes(eventRunResult.eventId);
      observedRunItemPickup =
        observedRunItemPickup || Boolean(eventRunResult.addedRunItemId);
      run = applyResolvedNodeStats(
        resolveCurrentRunNode(
          applyRunProgressDelta(eventRunResult.run, {
            metaCurrencyEarned: eventProfileResult.metaCurrencyAwarded,
            damageTaken: eventRunResult.damageTaken,
            healingReceived: eventRunResult.healingApplied,
            collectedItemId: eventRunResult.addedRunItemId,
          })
        )
      ).run;
      continue;
    }

    const resolution = applyResolvedNodeStats(resolveCurrentRunNode(run));
    run = resolution.run;
  }

  assert(run.runStatus === 'completed', 'Expected the full run simulation to end in victory.');
  assert(
    claimedRewardCount >= 2,
    'Expected the smoke simulation to claim at least two rewards.'
  );
  assert(
    profile.metaCurrency > 0,
    'Expected rewards to grant meta currency during the simulation.'
  );
  assert(
    observedPersistentHeroSync,
    'Expected combat results to persist hero HP back into the run state.'
  );
  assert(
    observedRunItemPickup,
    'Expected the simulation to add at least one item to the active run inventory.'
  );
  assert(
    observedEventUnlock,
    'Expected the simulation to unlock at least one event in the profile.'
  );
  assert(
    observedRewardRoomOptions,
    'Expected reward rooms to offer at least one selectable payout package.'
  );
  assert(
    observedBosses.join('|') === Object.values(expectedBossByFloor).join('|'),
    `Expected the run to surface the full boss path ${Object.values(expectedBossByFloor).join(', ')}.`
  );
  assert(
    observedFloorRotation,
    'Expected the longer run to surface at least one floor-start companion rotation handoff.'
  );
  assert(
    profile.unlockedItemIds.length > 0,
    'Expected the simulation to unlock at least one item.'
  );
  assert(
    flowLog.length === totalMapNodes,
    `Expected the run to traverse all ${totalMapNodes} nodes, received ${flowLog.length}.`
  );
  assert(
    run.stats.nodesResolved === flowLog.length,
    'Expected the archived run stats to track resolved nodes.'
  );
  assert(
    run.stats.rewardsClaimed === claimedRewardCount,
    'Expected the archived run stats to track claimed rewards.'
  );
  assert(
    run.stats.metaCurrencyEarned === profile.metaCurrency,
    'Expected the archived run stats to track earned meta currency.'
  );
  assert(
    run.stats.battlesWon >= 1 && run.stats.eventsResolved >= 1,
    'Expected the archived run stats to track battle wins and events.'
  );

  const archivedBondProgression = applyBondProgressionForArchivedRun(
    profile,
    run,
    'win'
  );
  assert(
    archivedBondProgression.bondGains.length === 2,
    'Expected archived bond progression to record both chosen companions.'
  );
  assert(
    archivedBondProgression.bondGains.some((bondGain) => bondGain.role === 'active'),
    'Expected archived bond progression to identify the active companion.'
  );
  assert(
    archivedBondProgression.bondGains.some(
      (bondGain) => bondGain.role === 'active' && bondGain.levelsEarned === 2
    ),
    'Expected a winning run to grant the active companion an extra bond level.'
  );
  assert(
    archivedBondProgression.bondGains.some(
      (bondGain) => bondGain.role === 'reserve' && bondGain.levelsEarned === 1
    ),
    'Expected a winning run to grant the reserve companion baseline bond progress.'
  );
  const newlyUnlockedBondScenes = getBondScenesUnlockedByBondGains(
    archivedBondProgression.bondGains
  );
  assert(
    newlyUnlockedBondScenes.length >= 1,
    'Expected bond gains from a win to unlock at least one authored bond scene.'
  );
  assert(
    newlyUnlockedBondScenes.some((scene) => scene.milestoneLevel === 3),
    'Expected a first successful run to unlock a level 3 bond scene.'
  );

  let upgradeTestProfile = {
    ...profile,
    metaCurrency: Math.max(profile.metaCurrency, 100),
    metaUpgradeLevels: getDefaultMetaUpgradeLevels(),
  };
  const affordableMetaUpgradeCatalog = buildMetaUpgradeCatalog(upgradeTestProfile);
  const incidentInsuranceOffer = affordableMetaUpgradeCatalog.find(
    (offer) => offer.id === 'incident-insurance'
  );
  const expensePaddingOffer = affordableMetaUpgradeCatalog.find(
    (offer) => offer.id === 'expense-padding'
  );
  const traumaKitOffer = affordableMetaUpgradeCatalog.find(
    (offer) => offer.id === 'breakroom-trauma-kit'
  );
  assert(
    incidentInsuranceOffer?.affordable &&
      expensePaddingOffer?.affordable &&
      traumaKitOffer?.affordable,
    'Expected a funded profile to afford the first rank of every permanent upgrade.'
  );

  upgradeTestProfile = purchaseMetaUpgrade(
    upgradeTestProfile,
    'incident-insurance'
  );
  upgradeTestProfile = purchaseMetaUpgrade(upgradeTestProfile, 'expense-padding');
  upgradeTestProfile = purchaseMetaUpgrade(
    upgradeTestProfile,
    'breakroom-trauma-kit'
  );

  const upgradedMetaCatalog = buildMetaUpgradeCatalog(upgradeTestProfile);
  assert(
    upgradedMetaCatalog.every((offer) => offer.currentLevel === 1),
    'Expected each purchased permanent upgrade to advance to rank 1.'
  );

  const baselineUpgradeRun = createInitialRun({
    heroClassId: 'it-support',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
    metaUpgradeLevels: getDefaultMetaUpgradeLevels(),
  });
  const upgradedMetaRun = createInitialRun({
    heroClassId: 'it-support',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
    metaUpgradeLevels: upgradeTestProfile.metaUpgradeLevels,
  });
  assert(
    upgradedMetaRun.hero.maxHp === baselineUpgradeRun.hero.maxHp + 2,
    'Expected Incident Insurance to raise max HP for future runs.'
  );

  const rewardUpgradeTest = {
    rewardId: 'meta-upgrade-reward-test',
    sourceNodeId: 'meta-upgrade-node',
    sourceKind: 'reward-node',
    title: 'Operations Upgrade Reward Test',
    description: 'Checks permanent payout and healing bonuses.',
    selectedOptionId: null,
    options: null,
    metaCurrency: 6,
    runHealing: 10,
    itemId: null,
    createdAt: upgradedMetaRun.updatedAt,
  };
  const baselineRewardProfile = {
    ...profile,
    metaUpgradeLevels: getDefaultMetaUpgradeLevels(),
  };
  const upgradedRewardProfile = {
    ...profile,
    metaUpgradeLevels: upgradeTestProfile.metaUpgradeLevels,
  };
  const baselineRewardClaim = applyPendingReward(
    baselineRewardProfile,
    rewardUpgradeTest
  );
  const upgradedRewardClaim = applyPendingReward(
    upgradedRewardProfile,
    rewardUpgradeTest
  );
  assert(
    upgradedRewardClaim.metaCurrencyAwarded ===
      baselineRewardClaim.metaCurrencyAwarded + 2,
    'Expected Expense Padding to add bonus chits to reward claims.'
  );

  const woundedUpgradeBaselineRun = {
    ...baselineUpgradeRun,
    hero: {
      ...baselineUpgradeRun.hero,
      currentHp: Math.max(1, baselineUpgradeRun.hero.currentHp - 20),
    },
  };
  const woundedUpgradeRun = {
    ...upgradedMetaRun,
    hero: {
      ...upgradedMetaRun.hero,
      currentHp: Math.max(1, upgradedMetaRun.hero.currentHp - 20),
    },
  };
  const baselineRewardHealing = applyPendingRewardToRun(
    woundedUpgradeBaselineRun,
    rewardUpgradeTest
  );
  const upgradedRewardHealing = applyPendingRewardToRun(
    woundedUpgradeRun,
    rewardUpgradeTest
  );
  assert(
    upgradedRewardHealing.healingApplied >= baselineRewardHealing.healingApplied + 3,
    'Expected Breakroom Trauma Kit to increase reward healing in future runs.'
  );

  const currencyBeforeRequisitions = profile.metaCurrency;
  const availableRequisitions = buildRequisitionCatalog(profile);
  const affordableClassOffer = availableRequisitions.classes.find(
    (offer) => !offer.owned && offer.affordable
  );
  assert(
    affordableClassOffer,
    'Expected a finished run to afford at least one class requisition.'
  );
  profile = purchaseClassUnlock(profile, affordableClassOffer.id);

  const followupRequisitions = buildRequisitionCatalog(profile);
  const affordableCompanionOffer = followupRequisitions.companions.find(
    (offer) => !offer.owned && offer.affordable
  );
  assert(
    affordableCompanionOffer,
    'Expected remaining chits to afford at least one companion requisition.'
  );
  profile = purchaseCompanionUnlock(profile, affordableCompanionOffer.id);

  assert(
    profile.unlockedClassIds.includes(affordableClassOffer.id),
    'Expected class requisition spending to unlock the purchased class.'
  );
  assert(
    profile.unlockedCompanionIds.includes(affordableCompanionOffer.id),
    'Expected companion requisition spending to unlock the purchased companion.'
  );
  assert(
    profile.bondLevels[affordableCompanionOffer.id] === 1,
    'Expected new companion requisitions to initialize bond tracking.'
  );
  assert(
    profile.metaCurrency ===
      currencyBeforeRequisitions -
        affordableClassOffer.cost -
        affordableCompanionOffer.cost,
    'Expected requisition spending to deduct the combined unlock costs.'
  );

  const devNearWinRun = createDevSmokeRun({
    scenarioId: 'near-win',
    companionBondLevels: profile.bondLevels,
  });
  assert(
    devNearWinRun.floorIndex === 10 &&
      devNearWinRun.currentNodeId === devNearWinRun.combatState?.nodeId,
    'Expected the dev smoke near-win seed to land on the final floor boss.'
  );
  assert(
    devNearWinRun.combatState?.enemy.currentHp === 1,
    'Expected the dev smoke near-win seed to leave the final boss at 1 HP.'
  );
  const devNearWinResult = performCombatAction(devNearWinRun, 'patch');
  assert(
    devNearWinResult.outcome === 'victory',
    'Expected the dev smoke near-win seed to convert into a real victory.'
  );

  const devNearLossRun = createDevSmokeRun({
    scenarioId: 'near-loss',
    companionBondLevels: profile.bondLevels,
  });
  assert(
    devNearLossRun.floorIndex === 10 &&
      devNearLossRun.currentNodeId === devNearLossRun.combatState?.nodeId,
    'Expected the dev smoke near-loss seed to land on the final floor boss.'
  );
  assert(
    devNearLossRun.combatState?.heroHp === 1,
    'Expected the dev smoke near-loss seed to leave the hero at 1 HP.'
  );
  const devNearLossResult = performCombatAction(devNearLossRun, 'escalate');
  assert(
    devNearLossResult.outcome === 'defeat',
    'Expected the dev smoke near-loss seed to convert into a real defeat.'
  );

  const defeatSeedRun = createInitialRun({
    heroClassId: 'intern',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
  });
  const defeatNode = getCurrentRunNode(defeatSeedRun);
  assert(defeatNode, 'Expected an initial node for the defeat branch.');
  let defeatRun = {
    ...defeatSeedRun,
    combatState: createCombatStateForCurrentNode(defeatSeedRun),
  };

  defeatRun = {
    ...defeatRun,
    combatState: {
      ...defeatRun.combatState,
      heroHp: 1,
      enemy: {
        ...defeatRun.combatState.enemy,
        currentHp: Math.max(30, defeatRun.combatState.enemy.maxHp),
        maxHp: Math.max(30, defeatRun.combatState.enemy.maxHp),
      },
    },
  };

  const defeatResult = performCombatAction(defeatRun, 'escalate');
  assert(
    defeatResult.outcome === 'defeat',
    'Expected the defeat branch to produce a loss outcome.'
  );
  assert(
    defeatResult.run.runStatus === 'failed',
    'Expected the defeat branch to mark the run as failed.'
  );

  const abandonSeedRun = createInitialRun({
    heroClassId: 'sales-rep',
    chosenCompanionIds: [
      'former-executive-assistant',
      'facilities-goblin',
    ],
  });
  const abandonNode = getCurrentRunNode(abandonSeedRun);
  assert(abandonNode, 'Expected an initial node for the abandon branch.');
  const abandonRun = createAbandonedRunSnapshot({
    ...abandonSeedRun,
    pendingReward: createPendingReward(
      abandonSeedRun,
      abandonNode,
      'reward-node'
    ),
    combatState: createCombatStateForCurrentNode(abandonSeedRun),
  });
  assert(
    abandonRun.runStatus === 'paused',
    'Expected abandoned runs to be marked paused before archiving.'
  );
  assert(
    abandonRun.pendingReward === null,
    'Expected abandoning a run to discard any pending reward.'
  );
  assert(
    abandonRun.combatState === null,
    'Expected abandoning a run to discard any in-progress combat state.'
  );

  console.log('Smoke simulation passed.');
  console.log(
    JSON.stringify(
      {
        victoriousRunId: run.runId,
        completedRunStatus: run.runStatus,
        rewardsClaimed: claimedRewardCount,
        metaCurrency: profile.metaCurrency,
        unlockedItems: profile.unlockedItemIds,
        unlockedEvents: profile.unlockedEventIds,
        purchasedClass: affordableClassOffer.id,
        purchasedCompanion: affordableCompanionOffer.id,
        carriedRunItems: run.inventoryItemIds,
        finalHeroHp: run.hero.currentHp,
        finalHeroMaxHp: run.hero.maxHp,
        defeatRunStatus: defeatResult.run.runStatus,
        traversedNodes: flowLog.length,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error('Smoke simulation failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (originalTsHandler) {
      require.extensions['.ts'] = originalTsHandler;
    } else {
      delete require.extensions['.ts'];
    }

    if (originalTsxHandler) {
      require.extensions['.tsx'] = originalTsxHandler;
    } else {
      delete require.extensions['.tsx'];
    }

    Module._resolveFilename = originalResolveFilename;
  });
