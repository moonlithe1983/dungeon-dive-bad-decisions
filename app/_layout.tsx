import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useGameStore } from '@/src/state/gameStore';
import { colors } from '@/src/theme/colors';
import { gameNavigationTheme } from '@/src/theme/navigation';

export default function RootLayout() {
  const initializeApp = useGameStore((state) => state.initializeApp);

  useEffect(() => {
    void initializeApp();
  }, [initializeApp]);

  return (
    <ThemeProvider value={gameNavigationTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'fade',
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
