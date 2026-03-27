import type {
  RunFloorState,
  RunMapState,
  RunNodeKind,
  RunNodeState,
  RunState,
} from '@/src/types/run';
import { createTimestamp } from '@/src/utils/time';

export type ResolveCurrentNodeResult = {
  run: RunState;
  resolvedNode: RunNodeState;
  nextNode: RunNodeState | null;
  advancedFloor: boolean;
  completedRun: boolean;
};

type NodeLocation = {
  floorIndex: number;
  nodeIndex: number;
};

export type RunResumeRoute = '/battle' | '/event' | '/reward' | '/run-map';

export type RunResumeTarget = {
  route: RunResumeRoute;
  buttonLabel: 'Battle' | 'Boss' | 'Event' | 'Reward' | 'Dive' | 'Deploy';
  summaryLabel: string;
};

export function getRunNodeRoute(kind: RunNodeKind) {
  if (kind === 'event') {
    return '/event' as const;
  }

  if (kind === 'reward') {
    return '/reward' as const;
  }

  return '/battle' as const;
}

export function getRunResumeTarget(run: RunState): RunResumeTarget {
  if (run.pendingReward) {
    return {
      route: '/reward',
      buttonLabel: 'Reward',
      summaryLabel: `Reward Claim - ${run.pendingReward.title}`,
    };
  }

  const currentNode = getCurrentRunNode(run);

  if (!currentNode) {
    return {
      route: '/run-map',
      buttonLabel: 'Dive',
      summaryLabel: 'Run Map',
    };
  }

  if (canRotateActiveCompanionAtFloorStart(run)) {
    return {
      route: '/run-map',
      buttonLabel: 'Deploy',
      summaryLabel: `Floor ${run.floorIndex} Deployment - ${currentNode.label}`,
    };
  }

  if (currentNode.kind === 'boss') {
    return {
      route: '/battle',
      buttonLabel: 'Boss',
      summaryLabel: `Boss Battle - ${currentNode.label}`,
    };
  }

  if (currentNode.kind === 'battle') {
    return {
      route: '/battle',
      buttonLabel: 'Battle',
      summaryLabel: `Battle - ${currentNode.label}`,
    };
  }

  if (currentNode.kind === 'event') {
    return {
      route: '/event',
      buttonLabel: 'Event',
      summaryLabel: `Event - ${currentNode.label}`,
    };
  }

  return {
    route: '/reward',
    buttonLabel: 'Reward',
    summaryLabel: `Reward Room - ${currentNode.label}`,
  };
}

export function getRunNodeById(run: RunState, nodeId: string | null) {
  if (!nodeId) {
    return null;
  }

  for (const floor of run.map.floors) {
    const node = floor.nodes.find((item) => item.id === nodeId);

    if (node) {
      return node;
    }
  }

  return null;
}

export function getCurrentRunNode(run: RunState) {
  return getRunNodeById(run, run.currentNodeId);
}

export function getReserveCompanionId(
  run: Pick<RunState, 'chosenCompanionIds' | 'activeCompanionId'>
) {
  return (
    run.chosenCompanionIds.find(
      (companionId) => companionId !== run.activeCompanionId
    ) ?? run.activeCompanionId
  );
}

export function getCurrentRunFloor(run: RunState) {
  return (
    run.map.floors.find((floor) => floor.floorNumber === run.floorIndex) ?? null
  );
}

export function canRotateActiveCompanionAtFloorStart(run: RunState) {
  const currentNode = getCurrentRunNode(run);

  return Boolean(
    currentNode &&
      currentNode.sequence === 1 &&
      run.floorIndex > 1 &&
      run.runStatus === 'in_progress' &&
      !run.pendingReward &&
      !run.combatState &&
      getReserveCompanionId(run) !== run.activeCompanionId
  );
}

export function rotateActiveCompanionAtFloorStart(run: RunState): RunState {
  if (!canRotateActiveCompanionAtFloorStart(run)) {
    throw new Error(
      'The reserve companion can only rotate in at the start of a new floor.'
    );
  }

  return {
    ...run,
    activeCompanionId: getReserveCompanionId(run),
    updatedAt: createTimestamp(),
  };
}

export function createAbandonedRunSnapshot(run: RunState): RunState {
  return {
    ...run,
    runStatus: 'paused',
    combatState: null,
    pendingReward: null,
    updatedAt: createTimestamp(),
  };
}

function cloneMap(map: RunMapState): RunMapState {
  return {
    floors: map.floors.map((floor) => ({
      ...floor,
      nodes: floor.nodes.map((node) => ({ ...node })),
    })),
  };
}

function findNodeLocation(map: RunMapState, nodeId: string): NodeLocation | null {
  for (let floorIndex = 0; floorIndex < map.floors.length; floorIndex += 1) {
    const nodeIndex = map.floors[floorIndex]?.nodes.findIndex(
      (node) => node.id === nodeId
    );

    if (nodeIndex != null && nodeIndex >= 0) {
      return { floorIndex, nodeIndex };
    }
  }

  return null;
}

function getNextNodeInFloor(floor: RunFloorState, nodeIndex: number) {
  return floor.nodes[nodeIndex + 1] ?? null;
}

export function resolveCurrentRunNode(run: RunState): ResolveCurrentNodeResult {
  if (!run.currentNodeId) {
    throw new Error('There is no active node to resolve.');
  }

  const nextMap = cloneMap(run.map);
  const location = findNodeLocation(nextMap, run.currentNodeId);

  if (!location) {
    throw new Error('The active node could not be found in the current run map.');
  }

  const currentFloor = nextMap.floors[location.floorIndex];
  const currentNode = currentFloor?.nodes[location.nodeIndex];

  if (!currentFloor || !currentNode) {
    throw new Error('The current run map is missing its active node.');
  }

  if (currentNode.status !== 'active') {
    throw new Error('Only the active node can be resolved.');
  }

  currentNode.status = 'resolved';

  const nextNode = getNextNodeInFloor(currentFloor, location.nodeIndex);

  if (nextNode) {
    nextNode.status = 'active';

    return {
      run: {
        ...run,
        currentNodeId: nextNode.id,
        map: nextMap,
        updatedAt: createTimestamp(),
      },
      resolvedNode: { ...currentNode },
      nextNode: { ...nextNode },
      advancedFloor: false,
      completedRun: false,
    };
  }

  currentFloor.status = 'resolved';

  const nextFloor = nextMap.floors[location.floorIndex + 1] ?? null;

  if (nextFloor) {
    nextFloor.status = 'active';

    const nextFloorNode = nextFloor.nodes[0] ?? null;

    if (!nextFloorNode) {
      throw new Error('The next floor does not contain any nodes.');
    }

    nextFloorNode.status = 'active';

    return {
      run: {
        ...run,
        floorIndex: nextFloor.floorNumber,
        currentNodeId: nextFloorNode.id,
        map: nextMap,
        updatedAt: createTimestamp(),
      },
      resolvedNode: { ...currentNode },
      nextNode: { ...nextFloorNode },
      advancedFloor: true,
      completedRun: false,
    };
  }

  return {
    run: {
      ...run,
      currentNodeId: null,
      map: nextMap,
      runStatus: 'completed',
      updatedAt: createTimestamp(),
    },
    resolvedNode: { ...currentNode },
    nextNode: null,
    advancedFloor: false,
    completedRun: true,
  };
}
