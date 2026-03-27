import type { ProfileState } from '@/src/types/profile';
import type { RunState } from '@/src/types/run';

export type ActiveRunSummary = {
  runId: string;
  floorIndex: number;
  className: string;
  activeCompanionName: string;
  lastSavedAtLabel: string;
};

export type BootstrapSnapshot = {
  hasActiveRun: boolean;
  activeRun: ActiveRunSummary | null;
  metaCurrency: number;
  unlockedCompanions: number;
  unlockedClasses: number;
};

export type BootstrapPayload = {
  snapshot: BootstrapSnapshot;
  profile: ProfileState;
  activeRun: RunState | null;
  recoveredFromBackup: boolean;
};
