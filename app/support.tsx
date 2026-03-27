import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameButton } from '@/src/components/game-button';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

const sections = [
  {
    title: 'Current Support Status',
    body: [
      'The public developer name is currently set to Moonlithe.',
      'The game is currently being prepared for an Android-only, Google Play-only launch with English-speaking regions first.',
      'A real public support inbox still needs final owner confirmation before store submission.',
      'The current placeholder recorded in project docs is support@yourdomain.com, and it should be replaced with a real monitored inbox before public release.',
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
    title: 'Current Launch Defaults',
    body: [
      'Platform: Android only.',
      'Store: Google Play only.',
      'Working price default: US$3.99 unless external testing later clearly supports US$4.99.',
      'Unfinished settings that do not affect live runtime behavior are intentionally hidden instead of being left as fake controls.',
    ],
  },
];

export default function SupportScreen() {
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
              Drafted for the current release-candidate hardening pass.
            </Text>
            <Text style={styles.body}>
              This page is meant to become a public-facing support reference
              once the final inbox and hosting URL are locked.
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

const styles = StyleSheet.create({
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
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  subtitle: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
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
    fontSize: 17,
    fontWeight: '800',
  },
  copyGroup: {
    gap: spacing.sm,
  },
  panelBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  actionGroup: {
    gap: spacing.sm + 2,
  },
});
