import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameButton } from '@/src/components/game-button';
import {
  createDevSmokeRun,
  type DevSmokeScenarioId,
} from '@/src/engine/dev/dev-smoke';
import { saveActiveRunAsync, saveBackupRunAsync } from '@/src/save/runRepo';
import { useGameStore } from '@/src/state/gameStore';
import { useProfileStore } from '@/src/state/profileStore';
import { useRunStore } from '@/src/state/runStore';
import { useUxTelemetryStore } from '@/src/state/uxTelemetryStore';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';

type PendingScenario = DevSmokeScenarioId | null;

export default function DevSmokeScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const refreshBootstrap = useGameStore((state) => state.refreshBootstrap);
  const hydrateFromActiveRun = useRunStore((state) => state.hydrateFromActiveRun);
  const telemetry = useUxTelemetryStore((state) => ({
    runsStarted: state.runsStarted,
    routeSelections: state.routeSelections,
    routeChanges: state.routeChanges,
    runItBackCount: state.runItBackCount,
    crewSceneViews: state.crewSceneViews,
    repeatedCrewSceneCount: state.repeatedCrewSceneCount,
    floorOneCommitSamplesMs: state.floorOneCommitSamplesMs,
  }));
  const resetTelemetry = useUxTelemetryStore((state) => state.resetSession);
  const [pendingScenario, setPendingScenario] = useState<PendingScenario>(null);
  const [error, setError] = useState<string | null>(null);
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);
  const averageFloorOneCommitMs = useMemo(() => {
    if (telemetry.floorOneCommitSamplesMs.length === 0) {
      return null;
    }

    const total = telemetry.floorOneCommitSamplesMs.reduce(
      (sum, sample) => sum + sample,
      0
    );

    return Math.round(total / telemetry.floorOneCommitSamplesMs.length);
  }, [telemetry.floorOneCommitSamplesMs]);

  const seedScenario = async (scenarioId: DevSmokeScenarioId) => {
    if (!__DEV__) {
      return;
    }

    setPendingScenario(scenarioId);
    setError(null);

    try {
      const resolvedProfile = profile ?? (await refreshProfile());
      const seededRun = createDevSmokeRun({
        scenarioId,
        companionBondLevels: resolvedProfile.bondLevels,
      });
      const savedRun = await saveActiveRunAsync(seededRun);

      await saveBackupRunAsync(savedRun);
      useUxTelemetryStore.getState().registerRunStart(savedRun.runId, savedRun.createdAt);
      await refreshBootstrap();
      await hydrateFromActiveRun(savedRun);

      router.replace('/battle' as Href);
    } catch (seedError) {
      setError(
        seedError instanceof Error && seedError.message
          ? seedError.message
          : 'The smoke lab could not prepare the requested fight.'
      );
      setPendingScenario(null);
    }
  };

  if (!__DEV__) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.shell}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>DEV SMOKE</Text>
            <Text style={styles.title}>Unavailable</Text>
            <Text style={styles.body}>
              This route is only enabled in development builds.
            </Text>
          </View>
          <GameButton
            label="Return to Title"
            onPress={() => {
              router.replace('/' as Href);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.eyebrow}>DEV SMOKE</Text>
            <Text style={styles.title}>Smoke Lab</Text>
            <Text style={styles.subtitle}>
              Seed a real floor-10 boss fight without grinding a whole run.
            </Text>
            <Text style={styles.body}>
              Each option replaces the current active dive, writes both active
              and backup saves, then opens battle using the normal route. The
              resulting win or loss still archives through the real end-run
              flow.
            </Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Near Win</Text>
            <Text style={styles.panelBody}>
              Seeds the final boss at 1 HP. Open battle and tap Patch to finish
              the run with a live archived win.
            </Text>
            <GameButton
              label={
                pendingScenario === 'near-win'
                  ? 'Preparing Near Win...'
                  : 'Seed Near Win'
              }
              onPress={() => {
                void seedScenario('near-win');
              }}
              disabled={pendingScenario !== null}
            />
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Near Loss</Text>
            <Text style={styles.panelBody}>
              Seeds the same final boss with you at 1 HP. Open battle and tap
              Escalate to trigger a real defeat archive.
            </Text>
            <GameButton
              label={
                pendingScenario === 'near-loss'
                  ? 'Preparing Near Loss...'
                  : 'Seed Near Loss'
              }
              onPress={() => {
                void seedScenario('near-loss');
              }}
              disabled={pendingScenario !== null}
              variant="secondary"
            />
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>UX Telemetry</Text>
            <Text style={styles.panelBody}>
              Local-only session metrics for validating loop clarity without adding a remote analytics dependency.
            </Text>
            <View style={styles.metricsCard}>
              <MetricLine label="Runs started" value={String(telemetry.runsStarted)} />
              <MetricLine label="Floor 1 commit avg" value={averageFloorOneCommitMs != null ? `${averageFloorOneCommitMs} ms` : 'No samples yet'} />
              <MetricLine label="Route selections" value={String(telemetry.routeSelections)} />
              <MetricLine label="Route changes" value={String(telemetry.routeChanges)} />
              <MetricLine label="Run It Back taps" value={String(telemetry.runItBackCount)} />
              <MetricLine label="Crew reads viewed" value={String(telemetry.crewSceneViews)} />
              <MetricLine label="Repeated crew reads" value={String(telemetry.repeatedCrewSceneCount)} />
            </View>
            <GameButton
              label="Reset Telemetry"
              onPress={resetTelemetry}
              variant="secondary"
              disabled={pendingScenario !== null}
            />
          </View>

          {pendingScenario ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.loadingText}>
                Writing the seeded dive and reopening battle...
              </Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorTitle}>Smoke Lab Error</Text>
              <Text style={styles.errorBody}>{error}</Text>
            </View>
          ) : null}

          <GameButton
            label="Return to Title"
            onPress={() => {
              router.replace('/' as Href);
            }}
            variant="secondary"
            disabled={pendingScenario !== null}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricLine({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <Text style={styles.metricLine}>
      <Text style={styles.metricLabel}>{label}: </Text>
      {value}
    </Text>
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
    fontSize: scaleFontSize(32, settings),
    fontWeight: '900',
    lineHeight: scaleLineHeight(36, settings),
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
  panelBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(14, settings),
    lineHeight: scaleLineHeight(21, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: scaleFontSize(14, settings),
    lineHeight: scaleLineHeight(20, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  errorCard: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 18,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(16, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(20, settings),
  },
  errorBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(14, settings),
    lineHeight: scaleLineHeight(20, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  metricsCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs + 2,
  },
  metricLine: {
    color: colors.textSecondary,
    fontSize: scaleFontSize(14, settings),
    lineHeight: scaleLineHeight(20, settings),
  },
  metricLabel: {
    color: colors.textPrimary,
    fontWeight: '800',
  },
  });
}
