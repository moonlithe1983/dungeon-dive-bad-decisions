import { DarkTheme, type Theme } from '@react-navigation/native';

import { colors } from '@/src/theme/colors';

export const gameNavigationTheme: Theme = {
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
