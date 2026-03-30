import { DarkTheme, type Theme } from '@react-navigation/native';

import { resolveAppPalette } from '@/src/theme/app-theme';
import { DEFAULT_PROFILE_SETTINGS, type ProfileSettingsState } from '@/src/types/profile';

export function createGameNavigationTheme(
  settings: ProfileSettingsState = DEFAULT_PROFILE_SETTINGS
): Theme {
  const colors = resolveAppPalette(settings);

  return {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: colors.accent,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.accent,
    },
  };
}

export const gameNavigationTheme = createGameNavigationTheme();
