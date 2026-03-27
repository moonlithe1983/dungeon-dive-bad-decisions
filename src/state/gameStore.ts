import { create } from 'zustand';

import { loadBootstrapPayloadAsync } from '@/src/save/bootstrap';
import { useProfileStore } from '@/src/state/profileStore';
import type { ProfileState } from '@/src/types/profile';
import type { BootstrapSnapshot } from '@/src/types/save';
import type { RunState } from '@/src/types/run';

type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';

type GameStoreState = {
  bootstrapStatus: BootstrapStatus;
  bootstrapSnapshot: BootstrapSnapshot | null;
  profile: ProfileState | null;
  activeRun: RunState | null;
  recoveredFromBackup: boolean;
  error: string | null;
  initializeApp: () => Promise<void>;
  refreshBootstrap: () => Promise<void>;
};

const STARTUP_ERROR_MESSAGE =
  'The breakroom door jammed. Please try again.';

let bootstrapPromise: Promise<void> | null = null;

async function hydrateBootstrapState(
  set: (
    nextState:
      | Partial<GameStoreState>
      | ((state: GameStoreState) => Partial<GameStoreState>)
  ) => void
) {
  set({
    bootstrapStatus: 'loading',
    error: null,
  });

  try {
    const payload = await loadBootstrapPayloadAsync();
    useProfileStore.getState().hydrateProfile(payload.profile);

    set({
      bootstrapStatus: 'ready',
      bootstrapSnapshot: payload.snapshot,
      profile: payload.profile,
      activeRun: payload.activeRun,
      recoveredFromBackup: payload.recoveredFromBackup,
      error: null,
    });
  } catch (error) {
    set({
      bootstrapStatus: 'error',
      bootstrapSnapshot: null,
      profile: null,
      activeRun: null,
      recoveredFromBackup: false,
      error:
        error instanceof Error && error.message
          ? error.message
          : STARTUP_ERROR_MESSAGE,
    });
  }
}

export const useGameStore = create<GameStoreState>((set) => ({
  bootstrapStatus: 'idle',
  bootstrapSnapshot: null,
  profile: null,
  activeRun: null,
  recoveredFromBackup: false,
  error: null,
  initializeApp: async () => {
    if (!bootstrapPromise) {
      bootstrapPromise = hydrateBootstrapState(set).finally(() => {
        bootstrapPromise = null;
      });
    }

    return bootstrapPromise;
  },
  refreshBootstrap: async () => {
    await hydrateBootstrapState(set);
  },
}));
