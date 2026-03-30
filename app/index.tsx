import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameButton } from '@/src/components/game-button';
import { getRunResumeTarget } from '@/src/engine/run/progress-run';
import { useGameStore } from '@/src/state/gameStore';
import { useRunStore } from '@/src/state/runStore';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import type { BootstrapSnapshot } from '@/src/types/save';

export default function IndexScreen() {
  const bootstrapStatus = useGameStore((state) => state.bootstrapStatus);
  const snapshot = useGameStore((state) => state.bootstrapSnapshot);
  const activeRun = useGameStore((state) => state.activeRun);
  const recoveredFromBackup = useGameStore((state) => state.recoveredFromBackup);
  const error = useGameStore((state) => state.error);
  const initializeApp = useGameStore((state) => state.initializeApp);
  const refreshBootstrap = useGameStore((state) => state.refreshBootstrap);
  const beginNewRunSetup = useRunStore((state) => state.beginNewRunSetup);

  useEffect(() => {
    if (bootstrapStatus === 'idle') {
      void initializeApp();
    }
  }, [bootstrapStatus, initializeApp]);

  const isLoading = bootstrapStatus === 'idle' || bootstrapStatus === 'loading';
  const resumeTarget = useMemo(() => {
    if (!activeRun) {
      return null;
    }

    return getRunResumeTarget(activeRun);
  }, [activeRun]);
  const resumeLabel = useMemo(() => {
    if (!activeRun) {
      return 'Resume Dive';
    }

    return `Resume ${resumeTarget?.buttonLabel ?? 'Dive'} - Floor ${activeRun.floorIndex}`;
  }, [activeRun, resumeTarget]);

  const handleRetry = async () => {
    await refreshBootstrap();
  };

  const handleResume = () => {
    if (!activeRun || !resumeTarget) {
      return;
    }

    router.push(resumeTarget.route as Href);
  };

  const handleNewDive = () => {
    beginNewRunSetup();
    router.push('/class-select' as Href);
  };

  const handleHub = () => {
    router.push('/hub' as Href);
  };

  const handleProgression = () => {
    router.push('/progression' as Href);
  };

  const handleBonds = () => {
    router.push('/bonds' as Href);
  };

  const handleCodex = () => {
    router.push('/codex' as Href);
  };

  const handleSettings = () => {
    router.push('/settings' as Href);
  };
  const handleDevSmoke = () => {
    router.push('/dev-smoke' as Href);
  };

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
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Premium</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Offline</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Single Player</Text>
              </View>
            </View>

            <Text style={styles.eyebrow}>BAD DECISIONS HOLDINGS PRESENTS</Text>
            <Text style={styles.title}>Dungeon Dive:</Text>
            <Text style={styles.titleAccent}>Bad Decisions</Text>
            <Text style={styles.subtitle}>
              Crown Meridian broke reality. You got the ticket.
            </Text>

            <Text style={styles.bodyCopy}>
              Descend through Meridian Spire, the procedural corporate
              underworld left behind after Project Everrise welded every
              department into one executive catastrophe.
            </Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Employee Status</Text>

            {isLoading ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.loadingText}>
                  Pulling the latest catastrophe report...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorState}>
                <Text style={styles.errorTitle}>Startup Error</Text>
                <Text style={styles.errorBody}>{error}</Text>
                <GameButton label="Try Again" onPress={handleRetry} />
              </View>
            ) : (
              <>
                <View style={styles.statGrid}>
                  <StatCard
                    label="Classes"
                    value={String(snapshot?.unlockedClasses ?? 0)}
                  />
                  <StatCard
                    label="Companions"
                    value={String(snapshot?.unlockedCompanions ?? 0)}
                  />
                  <StatCard
                    label="Chits"
                    value={String(snapshot?.metaCurrency ?? 0)}
                  />
                </View>

                <View style={styles.runCard}>
                  <Text style={styles.runCardTitle}>Active Dive</Text>

                  {snapshot?.activeRun ? (
                    <>
                      <RunSummary
                        snapshot={snapshot}
                        nextStopLabel={resumeTarget?.summaryLabel ?? 'Run Map'}
                      />
                      {recoveredFromBackup ? (
                        <Text style={styles.recoveryNotice}>
                          Recovered from the latest backup autosave.
                        </Text>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Text style={styles.runCardLineMuted}>
                        No active dive found.
                      </Text>
                      <Text style={styles.runCardHint}>
                        Start a new descent and the game will autosave after
                        node transitions, rewards, and major decisions.
                      </Text>
                    </>
                  )}
                </View>

                <View style={styles.primaryActions}>
                  <GameButton
                    label={resumeLabel}
                    onPress={handleResume}
                    disabled={!activeRun}
                  />
                  <GameButton
                    label="Start New Dive"
                    onPress={handleNewDive}
                    variant="secondary"
                  />
                </View>
              </>
            )}
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Operations</Text>
            <View style={styles.menuGrid}>
              <GameButton
                label="Breakroom Hub"
                onPress={handleHub}
                variant="secondary"
              />
              <GameButton
                label="Progression"
                onPress={handleProgression}
                variant="secondary"
              />
              <GameButton
                label="Companion Bonds"
                onPress={handleBonds}
                variant="secondary"
              />
              <GameButton
                label="Codex"
                onPress={handleCodex}
                variant="secondary"
              />
              <GameButton
                label="Settings"
                onPress={handleSettings}
                variant="secondary"
              />
              {__DEV__ ? (
                <GameButton
                  label="Smoke Lab"
                  onPress={handleDevSmoke}
                  variant="secondary"
                />
              ) : null}
            </View>
          </View>

          <View style={styles.footerCard}>
            <Text style={styles.footerTitle}>Compliance Notice</Text>
            <Text style={styles.footerBody}>
              This descent was caused entirely by leadership bad decisions.
              Participation is mandatory, underfunded, and extremely stupid.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function RunSummary({
  snapshot,
  nextStopLabel,
}: {
  snapshot: BootstrapSnapshot;
  nextStopLabel: string;
}) {
  if (!snapshot.activeRun) {
    return null;
  }

  return (
    <>
      <Text style={styles.runCardLine}>
        <Text style={styles.runCardLabel}>Class: </Text>
        {snapshot.activeRun.className}
      </Text>
      <Text style={styles.runCardLine}>
        <Text style={styles.runCardLabel}>Floor: </Text>
        {snapshot.activeRun.floorIndex}
      </Text>
      <Text style={styles.runCardLine}>
        <Text style={styles.runCardLabel}>Companion: </Text>
        {snapshot.activeRun.activeCompanionName}
      </Text>
      <Text style={styles.runCardLine}>
        <Text style={styles.runCardLabel}>Next Stop: </Text>
        {nextStopLabel}
      </Text>
      <Text style={styles.runCardHint}>
        Last saved {snapshot.activeRun.lastSavedAtLabel}
      </Text>
    </>
  );
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  eyebrow: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
  },
  titleAccent: {
    color: colors.accent,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
    marginTop: -4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  bodyCopy: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  panelTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  loadingState: {
    paddingVertical: spacing.lg + 2,
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  loadingText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  errorState: {
    gap: spacing.sm + 2,
  },
  errorTitle: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '800',
  },
  errorBody: {
    color: colors.errorMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  statGrid: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.accent,
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  runCard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    gap: spacing.xs + 2,
  },
  runCardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  runCardLine: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  runCardLineMuted: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  runCardLabel: {
    color: colors.textSubtle,
    fontWeight: '700',
  },
  runCardHint: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  recoveryNotice: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
  primaryActions: {
    gap: spacing.sm + 2,
  },
  menuGrid: {
    gap: spacing.sm + 2,
  },
  footerCard: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 18,
    padding: 14,
    gap: spacing.xs + 2,
  },
  footerTitle: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  footerBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
