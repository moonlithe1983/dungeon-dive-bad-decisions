import { AccessibilityInfo, AppState } from 'react-native';
import { create } from 'zustand';

type SystemAccessibilityState = {
  initialized: boolean;
  reduceMotionEnabled: boolean;
  screenReaderEnabled: boolean;
  initialize: () => Promise<void>;
  refresh: () => Promise<void>;
};

let hasSubscribed = false;

async function readSystemAccessibilityAsync() {
  const [reduceMotionResult, screenReaderResult] = await Promise.allSettled([
    AccessibilityInfo.isReduceMotionEnabled(),
    AccessibilityInfo.isScreenReaderEnabled(),
  ]);

  return {
    reduceMotionEnabled:
      reduceMotionResult.status === 'fulfilled'
        ? reduceMotionResult.value
        : false,
    screenReaderEnabled:
      screenReaderResult.status === 'fulfilled'
        ? screenReaderResult.value
        : false,
  };
}

export const useSystemAccessibilityStore = create<SystemAccessibilityState>(
  (set, get) => ({
    initialized: false,
    reduceMotionEnabled: false,
    screenReaderEnabled: false,
    refresh: async () => {
      const nextState = await readSystemAccessibilityAsync();
      set(nextState);
    },
    initialize: async () => {
      if (!get().initialized) {
        await get().refresh();
        set({ initialized: true });
      }

      if (hasSubscribed) {
        return;
      }

      hasSubscribed = true;

      AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
        set({ reduceMotionEnabled: enabled });
      });

      AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
        set({ screenReaderEnabled: enabled });
      });

      AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          void get().refresh();
        }
      });
    },
  })
);
