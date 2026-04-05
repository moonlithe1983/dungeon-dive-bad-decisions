import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameButton } from '@/src/components/game-button';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';

const sections = [
  {
    title: 'How The Game Works',
    body: [
      'Dungeon Dive: Bad Decisions is an offline single-player game.',
      'The app does not require account creation, cloud saves, multiplayer identity, or third-party sign-in to play.',
      'Your progress is stored on your device so the game can remember unlocks, runs, settings, and archived results.',
    ],
  },
  {
    title: 'Data Stored On Device',
    body: [
      'The game stores gameplay-related information locally on your device, including profile progression, unlocked content, active run state, backup recovery data, archive history, and settings.',
      'This local data exists so the app can resume dives, preserve unlocks, and show progression history without needing a remote account.',
      'In development builds only, the Smoke Lab route can show local in-memory UX telemetry counters for manual QA, and those counters are not part of the public gameplay loop.',
    ],
  },
  {
    title: 'Data Sharing',
    body: [
      'Gameplay data is not intentionally sent to developer-operated servers during normal play.',
      'The app does not require a player email, payment profile, cloud-save account, location sharing, or third-party login for the core game loop.',
      'Platform providers such as Google Play may still collect store, install, payment, or diagnostic information under their own policies.',
    ],
  },
  {
    title: 'Questions And Support',
    body: [
      'For privacy or support questions, use the contact information listed with your storefront copy, distributor, or build channel.',
      'If this policy changes, the in-app text and any public policy page should be updated to match the released version of the game.',
    ],
  },
];

export default function PrivacyScreen() {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shell}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>POLICY</Text>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.subtitle}>
              How your device data is used in the tower.
            </Text>
            <Text style={styles.body}>
              This policy describes the game&apos;s offline behavior and the
              information it stores on your device during normal play.
            </Text>
          </View>

          {sections.map((section) => (
            <View key={section.title} style={styles.panel}>
              <Text style={styles.panelTitle}>{section.title}</Text>
              <View style={styles.copyGroup}>
                {section.body.map((line) => (
                  <Text key={`${section.title}-${line}`} style={styles.panelBody}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Actions</Text>
            <View style={styles.actionGroup}>
              <GameButton
                label="Support"
                onPress={() => {
                  router.push('/support' as Href);
                }}
              />
              <GameButton
                label="Back to Settings"
                onPress={() => {
                  router.push('/settings' as Href);
                }}
                variant="secondary"
              />
              <GameButton
                label="Return to Title"
                onPress={() => {
                  router.push('/' as Href);
                }}
                variant="secondary"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(
  settings: ProfileSettingsState,
  colors: ReturnType<typeof useAppTheme>['colors']
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
    },
    shell: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl,
      gap: spacing.lg,
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      padding: spacing.xl,
      gap: spacing.sm + 2,
    },
    eyebrow: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      letterSpacing: 1 + (settings.dyslexiaAssistEnabled ? 0.18 : 0),
    },
    title: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(34, settings),
      fontWeight: '900',
      lineHeight: scaleLineHeight(38, settings),
    },
    subtitle: {
      color: colors.accent,
      fontSize: scaleFontSize(16, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    body: {
      color: colors.textMuted,
      fontSize: scaleFontSize(15, settings),
      lineHeight: scaleLineHeight(22, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    panel: {
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 18,
      padding: spacing.lg,
      gap: spacing.md,
    },
    panelTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(17, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(21, settings),
    },
    copyGroup: {
      gap: spacing.sm,
    },
    panelBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(21, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    actionGroup: {
      gap: spacing.sm + 2,
    },
  });
}
