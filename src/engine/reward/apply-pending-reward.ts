import { getMetaUpgradeRewardCurrencyBonus } from '@/src/engine/meta/meta-upgrade-engine';
import type { ProfileState } from '@/src/types/profile';
import type {
  PendingRewardState,
  RewardClaimResult,
} from '@/src/types/run';

export type RewardApplicationResult = RewardClaimResult & {
  profile: ProfileState;
};

export function applyPendingReward(
  profile: ProfileState,
  reward: PendingRewardState
): RewardApplicationResult {
  let metaCurrencyAwarded =
    Math.max(0, Math.floor(reward.metaCurrency)) +
    getMetaUpgradeRewardCurrencyBonus(profile.metaUpgradeLevels);
  let unlockedItemId: string | null = null;
  let duplicateItemId: string | null = null;
  let unlockedItemIds = profile.unlockedItemIds;

  if (reward.itemId) {
    if (!profile.unlockedItemIds.includes(reward.itemId)) {
      unlockedItemId = reward.itemId;
      unlockedItemIds = [...profile.unlockedItemIds, reward.itemId];
    } else {
      duplicateItemId = reward.itemId;
      metaCurrencyAwarded += 4;
    }
  }

  return {
    profile: {
      ...profile,
      metaCurrency: profile.metaCurrency + metaCurrencyAwarded,
      unlockedItemIds,
    },
    metaCurrencyAwarded,
    unlockedItemId,
    duplicateItemId,
  };
}
