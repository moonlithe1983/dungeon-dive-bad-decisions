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
    title: 'Getting Help',
    body: [
      'If you run into trouble, use the support contact listed with your storefront copy, distributor, or build channel.',
      'Support details may vary by region, storefront, or release channel.',
      'When available, check the latest listing notes or storefront page for updated contact information.',
    ],
  },
  {
    title: 'Helpful Bug Report Details',
    body: [
      'If you report a problem, include the device model, Android version, and app version when possible.',
      'Describe what you expected to happen, what actually happened, and the exact steps that led to the issue.',
      'For save or resume issues, note whether the problem still appeared after closing and reopening the app.',
    ],
  },
  {
    title: 'What To Include',
    body: [
      'Device model, Android version, and app version or build number.',
      'What you expected to happen, what happened instead, and whether the issue can be repeated.',
      'For save or resume issues, mention the last screen you visited before the problem appeared.',
    ],
  },
];

export default function SupportScreen() {
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
            <Text style={styles.eyebrow}>SUPPORT</Text>
            <Text style={styles.title}>Help And Contact</Text>
            <Text style={styles.subtitle}>
              When the tower fights dirty, a good report helps.
            </Text>
            <Text style={styles.body}>
              Share enough detail for someone to reproduce the problem quickly
              and tell whether it came from combat, rewards, events, saves, or
              device-specific behavior.
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
                label="Privacy Policy"
                onPress={() => {
                  router.push('/privacy' as Href);
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
