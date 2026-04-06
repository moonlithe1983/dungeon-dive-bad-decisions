import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameButton } from '@/src/components/game-button';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

type PlaceholderRouteAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

type PlaceholderRouteScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: PlaceholderRouteAction[];
};

export function PlaceholderRouteScreen({
  eyebrow,
  title,
  description,
  actions = [{ label: 'Employee Portal', href: '/' }],
}: PlaceholderRouteScreenProps) {
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
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              Route connected. System standing by.
            </Text>
            <Text style={styles.body}>{description}</Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Foundation Status</Text>
            <Text style={styles.panelBody}>
              This screen is live in the stack, uses the shared game shell, and
              gives the app a stable destination while the underlying feature is
              built.
            </Text>
            <View style={styles.actions}>
              {actions.map((action) => (
                <GameButton
                  key={`${title}-${action.label}`}
                  label={action.label}
                  onPress={() => {
                    router.push(action.href as Href);
                  }}
                  variant={action.variant ?? 'primary'}
                />
              ))}
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
  panelBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  actions: {
    gap: spacing.sm + 2,
  },
});
