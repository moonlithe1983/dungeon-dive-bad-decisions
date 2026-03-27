import { applyPendingReward } from '@/src/engine/reward/apply-pending-reward';
import type { ProfileState } from '@/src/types/profile';
import type { PendingRewardState } from '@/src/types/run';

export type EventProfileApplicationResult = ReturnType<typeof applyPendingReward> & {
  unlockedEventId: string;
};

export function applyEventChoiceToProfile(
  profile: ProfileState,
  {
    eventId,
    reward,
  }: {
    eventId: string;
    reward: PendingRewardState;
  }
): EventProfileApplicationResult {
  const rewardResult = applyPendingReward(profile, reward);

  return {
    ...rewardResult,
    profile: {
      ...rewardResult.profile,
      unlockedEventIds: Array.from(
        new Set([...rewardResult.profile.unlockedEventIds, eventId])
      ),
    },
    unlockedEventId: eventId,
  };
}
