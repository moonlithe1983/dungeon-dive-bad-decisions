import * as Haptics from 'expo-haptics';

import type { ProfileSettingsState } from '@/src/types/profile';

export type UiHapticId = 'tap' | 'select' | 'success' | 'error' | 'warning';

export async function playUiHaptic(
  effectId: UiHapticId,
  settings: Pick<ProfileSettingsState, 'hapticsEnabled'>
) {
  if (!settings.hapticsEnabled) {
    return;
  }

  try {
    if (effectId === 'tap' || effectId === 'select') {
      await Haptics.selectionAsync();
      return;
    }

    if (effectId === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (effectId === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.warn(`Failed to play haptic "${effectId}"`, error);
  }
}
