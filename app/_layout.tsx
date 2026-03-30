import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Text, type TextProps } from 'react-native';
import 'react-native-reanimated';

import { useGameStore } from '@/src/state/gameStore';
import { useProfileStore } from '@/src/state/profileStore';
import { useAppTheme } from '@/src/theme/app-theme';
import { createGameNavigationTheme } from '@/src/theme/navigation';

export default function RootLayout() {
  const initializeApp = useGameStore((state) => state.initializeApp);
  const profileSettings = useProfileStore((state) => state.profile?.settings);
  const { colors, metrics, settings } = useAppTheme();

  useEffect(() => {
    void initializeApp();
  }, [initializeApp]);

  useEffect(() => {
    const TextWithDefaults = Text as typeof Text & {
      defaultProps?: TextProps;
    };
    const nextDefaults = {
      ...(TextWithDefaults.defaultProps ?? {}),
      allowFontScaling: true,
      maxFontSizeMultiplier: metrics.maxFontSizeMultiplier,
      android_hyphenationFrequency: 'none' as const,
      textBreakStrategy: 'simple' as const,
    };

    TextWithDefaults.defaultProps = nextDefaults;
  }, [metrics.maxFontSizeMultiplier]);

  return (
    <ThemeProvider
      value={createGameNavigationTheme(profileSettings ?? settings)}
    >
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: settings.reducedMotionEnabled ? 'none' : 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="class-select" />
        <Stack.Screen name="companion-select" />
        <Stack.Screen name="run-map" />
        <Stack.Screen name="hub" />
        <Stack.Screen name="progression" />
        <Stack.Screen name="bonds" />
        <Stack.Screen name="codex" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="support" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="battle" />
        <Stack.Screen name="reward" />
        <Stack.Screen name="event" />
        <Stack.Screen name="end-run" />
        <Stack.Screen name="dev-smoke" />
      </Stack>
    </ThemeProvider>
  );
}
