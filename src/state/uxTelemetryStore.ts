import { create } from 'zustand';

type RunUxTelemetry = {
  runId: string;
  startedAtMs: number;
  routeSelections: number;
  routeChanges: number;
  firstFloorCommitMs: number | null;
  firstFloorCommittedNodeId: string | null;
  lastCrewSceneId: string | null;
  repeatedCrewScenes: number;
  crewSceneViews: number;
  seenCrewScenesByEncounter: Record<string, string>;
};

type UxTelemetryState = {
  sessionStartedAtMs: number;
  runsStarted: number;
  routeSelections: number;
  routeChanges: number;
  runItBackCount: number;
  crewSceneViews: number;
  repeatedCrewSceneCount: number;
  floorOneCommitSamplesMs: number[];
  runs: Record<string, RunUxTelemetry>;
  registerRunStart: (runId: string, createdAt?: string | null) => void;
  recordRouteSelection: (input: {
    runId: string;
    changedSelection: boolean;
  }) => void;
  recordRouteCommit: (input: {
    runId: string;
    nodeId: string;
    floorIndex: number;
  }) => void;
  recordCrewScene: (input: {
    runId: string;
    encounterId: string;
    sceneId: string;
  }) => void;
  recordRunItBack: () => void;
  resetSession: () => void;
};

function createEmptyRun(runId: string, createdAt?: string | null): RunUxTelemetry {
  const parsedMs = createdAt ? new Date(createdAt).getTime() : Number.NaN;

  return {
    runId,
    startedAtMs: Number.isFinite(parsedMs) ? parsedMs : Date.now(),
    routeSelections: 0,
    routeChanges: 0,
    firstFloorCommitMs: null,
    firstFloorCommittedNodeId: null,
    lastCrewSceneId: null,
    repeatedCrewScenes: 0,
    crewSceneViews: 0,
    seenCrewScenesByEncounter: {},
  };
}

function ensureRun(
  runs: Record<string, RunUxTelemetry>,
  runId: string,
  createdAt?: string | null
) {
  return runs[runId] ?? createEmptyRun(runId, createdAt);
}

export const useUxTelemetryStore = create<UxTelemetryState>((set) => ({
  sessionStartedAtMs: Date.now(),
  runsStarted: 0,
  routeSelections: 0,
  routeChanges: 0,
  runItBackCount: 0,
  crewSceneViews: 0,
  repeatedCrewSceneCount: 0,
  floorOneCommitSamplesMs: [],
  runs: {},
  registerRunStart: (runId, createdAt) => {
    set((state) => {
      if (state.runs[runId]) {
        return state;
      }

      return {
        runsStarted: state.runsStarted + 1,
        runs: {
          ...state.runs,
          [runId]: createEmptyRun(runId, createdAt),
        },
      };
    });
  },
  recordRouteSelection: ({ runId, changedSelection }) => {
    set((state) => {
      const run = ensureRun(state.runs, runId);

      return {
        routeSelections: state.routeSelections + 1,
        routeChanges: state.routeChanges + (changedSelection ? 1 : 0),
        runs: {
          ...state.runs,
          [runId]: {
            ...run,
            routeSelections: run.routeSelections + 1,
            routeChanges: run.routeChanges + (changedSelection ? 1 : 0),
          },
        },
      };
    });
  },
  recordRouteCommit: ({ runId, nodeId, floorIndex }) => {
    set((state) => {
      const run = ensureRun(state.runs, runId);

      if (floorIndex !== 1 || run.firstFloorCommitMs !== null) {
        return {
          runs: {
            ...state.runs,
            [runId]: run,
          },
        };
      }

      const sample = Math.max(0, Date.now() - run.startedAtMs);

      return {
        floorOneCommitSamplesMs: [...state.floorOneCommitSamplesMs, sample],
        runs: {
          ...state.runs,
          [runId]: {
            ...run,
            firstFloorCommitMs: sample,
            firstFloorCommittedNodeId: nodeId,
          },
        },
      };
    });
  },
  recordCrewScene: ({ runId, encounterId, sceneId }) => {
    set((state) => {
      const run = ensureRun(state.runs, runId);

      if (run.seenCrewScenesByEncounter[encounterId] === sceneId) {
        return state;
      }

      const repeated = run.lastCrewSceneId === sceneId ? 1 : 0;

      return {
        crewSceneViews: state.crewSceneViews + 1,
        repeatedCrewSceneCount: state.repeatedCrewSceneCount + repeated,
        runs: {
          ...state.runs,
          [runId]: {
            ...run,
            crewSceneViews: run.crewSceneViews + 1,
            repeatedCrewScenes: run.repeatedCrewScenes + repeated,
            lastCrewSceneId: sceneId,
            seenCrewScenesByEncounter: {
              ...run.seenCrewScenesByEncounter,
              [encounterId]: sceneId,
            },
          },
        },
      };
    });
  },
  recordRunItBack: () => {
    set((state) => ({
      runItBackCount: state.runItBackCount + 1,
    }));
  },
  resetSession: () => {
    set({
      sessionStartedAtMs: Date.now(),
      runsStarted: 0,
      routeSelections: 0,
      routeChanges: 0,
      runItBackCount: 0,
      crewSceneViews: 0,
      repeatedCrewSceneCount: 0,
      floorOneCommitSamplesMs: [],
      runs: {},
    });
  },
}));
