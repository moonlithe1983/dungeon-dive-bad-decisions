import { useEffect, useMemo } from 'react';

import { getCurrentRunFloor, getCurrentRunNode } from '@/src/engine/run/progress-run';
import { useGameStore } from '@/src/state/gameStore';
import { useRunStore } from '@/src/state/runStore';

export function useHydratedRun() {
  const storedRun = useGameStore((state) => state.activeRun);
  const recoveredFromBackup = useGameStore((state) => state.recoveredFromBackup);
  const run = useRunStore((state) => state.currentRun);
  const loadState = useRunStore((state) => state.currentRunLoadStatus);
  const error = useRunStore((state) => state.currentRunError);
  const hydrateFromActiveRun = useRunStore((state) => state.hydrateFromActiveRun);

  useEffect(() => {
    if (loadState === 'ready' && run && storedRun?.runId === run.runId) {
      return;
    }

    if (loadState === 'loading') {
      return;
    }

    void hydrateFromActiveRun(storedRun);
  }, [hydrateFromActiveRun, loadState, run, storedRun]);

  const currentNode = useMemo(() => {
    if (!run) {
      return null;
    }

    return getCurrentRunNode(run);
  }, [run]);

  const currentFloor = useMemo(() => {
    if (!run) {
      return null;
    }

    return getCurrentRunFloor(run);
  }, [run]);

  return {
    run,
    currentNode,
    currentFloor,
    loadState,
    error,
    recoveredFromBackup,
  };
}
