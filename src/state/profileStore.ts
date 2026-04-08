import { create } from 'zustand';

import { applyEventChoiceToProfile } from '@/src/engine/event/apply-event-choice-to-profile';
import { purchaseMetaUpgrade as purchaseMetaUpgradeInEngine } from '@/src/engine/meta/meta-upgrade-engine';
import {
  purchaseClassUnlock as purchaseClassUnlockInEngine,
  purchaseCompanionUnlock as purchaseCompanionUnlockInEngine,
} from '@/src/engine/meta/requisition-engine';
import {
  activateProbationContract as activateProbationContractInEngine,
  cancelProbationContract as cancelProbationContractInEngine,
} from '@/src/engine/retention/retention-engine';
import { applyPendingReward } from '@/src/engine/reward/apply-pending-reward';
import {
  loadOrSeedProfileAsync,
  saveProfileAsync,
} from '@/src/save/profileRepo';
import type { MetaUpgradeId, ProfileState } from '@/src/types/profile';
import type { PendingRewardState, RewardClaimResult } from '@/src/types/run';

type ProfileStoreState = {
  profile: ProfileState | null;
  hydrateProfile: (profile: ProfileState) => void;
  refreshProfile: () => Promise<ProfileState>;
  awardMetaCurrency: (amount: number) => Promise<ProfileState>;
  unlockClass: (classId: string) => Promise<ProfileState>;
  unlockCompanion: (companionId: string) => Promise<ProfileState>;
  purchaseClassUnlock: (classId: string) => Promise<ProfileState>;
  purchaseCompanionUnlock: (companionId: string) => Promise<ProfileState>;
  purchaseMetaUpgrade: (upgradeId: MetaUpgradeId) => Promise<ProfileState>;
  activateProbationContract: () => Promise<ProfileState>;
  cancelProbationContract: () => Promise<ProfileState>;
  unlockItem: (itemId: string) => Promise<ProfileState>;
  unlockEvent: (eventId: string) => Promise<ProfileState>;
  setBondLevel: (companionId: string, level: number) => Promise<ProfileState>;
  updateSettings: (
    nextSettings: Partial<ProfileState['settings']>
  ) => Promise<ProfileState>;
  updateOnboarding: (
    nextOnboarding: Partial<ProfileState['onboarding']>
  ) => Promise<ProfileState>;
  applyEventChoice: (input: {
    eventId: string;
    reward: PendingRewardState;
  }) => Promise<
    RewardClaimResult & {
      unlockedEventId: string;
      profile: ProfileState;
    }
  >;
  claimReward: (
    reward: PendingRewardState
  ) => Promise<RewardClaimResult & { profile: ProfileState }>;
};

async function updateProfileAsync(
  updater: (profile: ProfileState) => ProfileState
) {
  const currentProfile = await loadOrSeedProfileAsync();
  return saveProfileAsync(updater(currentProfile));
}

export const useProfileStore = create<ProfileStoreState>((set) => ({
  profile: null,
  hydrateProfile: (profile) => {
    set({ profile });
  },
  refreshProfile: async () => {
    const profile = await loadOrSeedProfileAsync();
    set({ profile });
    return profile;
  },
  awardMetaCurrency: async (amount) => {
    const nextProfile = await updateProfileAsync((profile) => ({
      ...profile,
      metaCurrency: profile.metaCurrency + Math.max(0, Math.floor(amount)),
    }));

    set({ profile: nextProfile });
    return nextProfile;
  },
  unlockClass: async (classId) => {
    const nextProfile = await updateProfileAsync((profile) => ({
      ...profile,
      unlockedClassIds: Array.from(
        new Set([...profile.unlockedClassIds, classId])
      ),
    }));

    set({ profile: nextProfile });
    return nextProfile;
  },
  unlockCompanion: async (companionId) => {
    const nextProfile = await updateProfileAsync((profile) => ({
      ...profile,
      unlockedCompanionIds: Array.from(
        new Set([...profile.unlockedCompanionIds, companionId])
      ),
    }));

    set({ profile: nextProfile });
    return nextProfile;
  },
  purchaseClassUnlock: async (classId) => {
    const nextProfile = await updateProfileAsync((profile) =>
      purchaseClassUnlockInEngine(profile, classId)
    );

    set({ profile: nextProfile });
    return nextProfile;
  },
  purchaseCompanionUnlock: async (companionId) => {
    const nextProfile = await updateProfileAsync((profile) =>
      purchaseCompanionUnlockInEngine(profile, companionId)
    );

    set({ profile: nextProfile });
    return nextProfile;
  },
  purchaseMetaUpgrade: async (upgradeId) => {
    const nextProfile = await updateProfileAsync((profile) =>
      purchaseMetaUpgradeInEngine(profile, upgradeId)
    );

    set({ profile: nextProfile });
    return nextProfile;
  },
  activateProbationContract: async () => {
    const nextProfile = await updateProfileAsync((profile) =>
      activateProbationContractInEngine(profile)
    );

    set({ profile: nextProfile });
    return nextProfile;
  },
  cancelProbationContract: async () => {
    const nextProfile = await updateProfileAsync((profile) =>
      cancelProbationContractInEngine(profile)
    );

    set({ profile: nextProfile });
    return nextProfile;
  },
  unlockItem: async (itemId) => {
    const nextProfile = await updateProfileAsync((profile) => ({
      ...profile,
      unlockedItemIds: Array.from(new Set([...profile.unlockedItemIds, itemId])),
    }));

    set({ profile: nextProfile });
    return nextProfile;
  },
  unlockEvent: async (eventId) => {
    const nextProfile = await updateProfileAsync((profile) => ({
      ...profile,
      unlockedEventIds: Array.from(
        new Set([...profile.unlockedEventIds, eventId])
      ),
    }));

    set({ profile: nextProfile });
    return nextProfile;
  },
  setBondLevel: async (companionId, level) => {
    const nextProfile = await updateProfileAsync((profile) => ({
      ...profile,
      bondLevels: {
        ...profile.bondLevels,
        [companionId]: Math.max(0, Math.floor(level)),
      },
    }));

    set({ profile: nextProfile });
    return nextProfile;
  },
  updateSettings: async (nextSettings) => {
    const nextProfile = await updateProfileAsync((profile) => ({
      ...profile,
      settings: {
        ...profile.settings,
        ...nextSettings,
      },
    }));

    set({ profile: nextProfile });
    return nextProfile;
  },
  updateOnboarding: async (nextOnboarding) => {
    const nextProfile = await updateProfileAsync((profile) => ({
      ...profile,
      onboarding: {
        ...profile.onboarding,
        ...nextOnboarding,
      },
    }));

    set({ profile: nextProfile });
    return nextProfile;
  },
  applyEventChoice: async ({ eventId, reward }) => {
    const currentProfile = await loadOrSeedProfileAsync();
    const eventResult = applyEventChoiceToProfile(currentProfile, {
      eventId,
      reward,
    });
    const profile = await saveProfileAsync(eventResult.profile);

    set({ profile });

    return {
      profile,
      unlockedEventId: eventResult.unlockedEventId,
      metaCurrencyAwarded: eventResult.metaCurrencyAwarded,
      unlockedItemId: eventResult.unlockedItemId,
      duplicateItemId: eventResult.duplicateItemId,
    };
  },
  claimReward: async (reward) => {
    const currentProfile = await loadOrSeedProfileAsync();
    const rewardResult = applyPendingReward(currentProfile, reward);
    const profile = await saveProfileAsync(rewardResult.profile);

    set({ profile });

    return {
      profile,
      metaCurrencyAwarded: rewardResult.metaCurrencyAwarded,
      unlockedItemId: rewardResult.unlockedItemId,
      duplicateItemId: rewardResult.duplicateItemId,
    };
  },
}));
