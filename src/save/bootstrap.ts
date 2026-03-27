import { loadOrSeedProfileAsync } from '@/src/save/profileRepo';
import {
  deriveActiveRunSummary,
  loadRecoverableRunAsync,
  resumeActiveRunAsync as resumeActiveRunFromRepoAsync,
} from '@/src/save/runRepo';
import type { ProfileState } from '@/src/types/profile';
import type { BootstrapPayload, BootstrapSnapshot } from '@/src/types/save';
import type { RunState } from '@/src/types/run';

function buildBootstrapSnapshot(
  profile: ProfileState,
  activeRun: RunState | null
): BootstrapSnapshot {
  const activeRunSummary = activeRun ? deriveActiveRunSummary(activeRun) : null;

  return {
    hasActiveRun: Boolean(activeRunSummary),
    activeRun: activeRunSummary,
    metaCurrency: profile.metaCurrency,
    unlockedClasses: profile.unlockedClassIds.length,
    unlockedCompanions: profile.unlockedCompanionIds.length,
  };
}

export async function loadBootstrapPayloadAsync(): Promise<BootstrapPayload> {
  const profile = await loadOrSeedProfileAsync();
  const { activeRun, recoveredFromBackup } = await loadRecoverableRunAsync();

  return {
    snapshot: buildBootstrapSnapshot(profile, activeRun),
    profile,
    activeRun,
    recoveredFromBackup,
  };
}

export async function loadBootstrapSnapshotAsync(): Promise<BootstrapSnapshot> {
  const { snapshot } = await loadBootstrapPayloadAsync();
  return snapshot;
}

export async function resumeActiveRunAsync(): Promise<RunState | null> {
  return resumeActiveRunFromRepoAsync();
}
