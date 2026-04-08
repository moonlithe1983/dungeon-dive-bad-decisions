import { useMemo } from 'react';

import { useProfileStore } from '@/src/state/profileStore';

export function useRunHelpStartsCollapsed(floorIndex?: number | null) {
  const totalRuns = useProfileStore((state) => state.profile?.stats.totalRuns ?? 0);

  return useMemo(() => {
    const normalizedFloorIndex = Math.max(1, floorIndex ?? 1);

    return totalRuns > 0 || normalizedFloorIndex >= 2;
  }, [floorIndex, totalRuns]);
}
