import type { ProfileState } from '@/src/types/profile';
import type {
  ArchivedRunBondGain,
  ArchivedRunResult,
  RunState,
} from '@/src/types/run';

const MAX_BOND_LEVEL = 5;

function clampBondLevel(level: number) {
  return Math.min(MAX_BOND_LEVEL, Math.max(1, Math.floor(level)));
}

function getRoleBondGain(result: ArchivedRunResult, role: 'active' | 'reserve') {
  if (result === 'win') {
    return role === 'active' ? 2 : 1;
  }

  return 1;
}

function getRunCompanionRole(run: RunState, companionId: string) {
  return companionId === run.activeCompanionId ? ('active' as const) : ('reserve' as const);
}

export function applyBondProgressionForArchivedRun(
  profile: ProfileState,
  run: RunState,
  result: ArchivedRunResult
): {
  profile: ProfileState;
  bondGains: ArchivedRunBondGain[];
} {
  const bondGains = run.chosenCompanionIds.map((companionId) => {
    const role = getRunCompanionRole(run, companionId);
    const levelBefore = clampBondLevel(profile.bondLevels[companionId] ?? 1);
    const requestedGain = getRoleBondGain(result, role);
    const levelAfter = clampBondLevel(levelBefore + requestedGain);

    return {
      companionId,
      role,
      levelBefore,
      levelAfter,
      levelsEarned: Math.max(0, levelAfter - levelBefore),
    };
  });

  return {
    profile: {
      ...profile,
      bondLevels: {
        ...profile.bondLevels,
        ...Object.fromEntries(
          bondGains.map((bondGain) => [bondGain.companionId, bondGain.levelAfter])
        ),
      },
    },
    bondGains,
  };
}
