import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameButton } from '@/src/components/game-button';
import { useResponsiveLayout } from '@/src/hooks/use-responsive-layout';
import { getRunResumeTarget } from '@/src/engine/run/progress-run';
import { getNextGoalSummary } from '@/src/progression/next-goal';
import { useGameStore } from '@/src/state/gameStore';
import { useProfileStore } from '@/src/state/profileStore';
import { useRunStore } from '@/src/state/runStore';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';
import type { BootstrapSnapshot } from '@/src/types/save';

const titleScreenArt = require('@/src/assets/store/Title Screen.png');

export default function IndexScreen() {
  const bootstrapStatus = useGameStore((state) => state.bootstrapStatus);
  const snapshot = useGameStore((state) => state.bootstrapSnapshot);
  const bootstrapProfile = useGameStore((state) => state.profile);
  const activeRun = useGameStore((state) => state.activeRun);
  const recoveredFromBackup = useGameStore((state) => state.recoveredFromBackup);
  const error = useGameStore((state) => state.error);
  const initializeApp = useGameStore((state) => state.initializeApp);
  const refreshBootstrap = useGameStore((state) => state.refreshBootstrap);
  const profile = useProfileStore((state) => state.profile) ?? bootstrapProfile;
  const beginNewRunSetup = useRunStore((state) => state.beginNewRunSetup);
  const { colors, settings } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );

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
      return null;
    }

    return `Resume ${resumeTarget?.buttonLabel ?? 'Dive'} - Floor ${activeRun.floorIndex}`;
  }, [activeRun, resumeTarget]);
  const nextGoal = useMemo(
    () => getNextGoalSummary({ profile, activeRun }),
    [activeRun, profile]
  );

  const handleRetry = async () => {
    await refreshBootstrap();
  };

  const handleResume = () => {
    if (!activeRun || !resumeTarget) {
      return;
    }

    router.push(resumeTarget.route as Href);
  };

  const isFirstRunIntroVisible = Boolean(
    profile &&
      !activeRun &&
      profile.stats.totalRuns === 0 &&
      !profile.onboarding.narrativeIntroSeen
  );

  const handleNewDive = async () => {
    if (isFirstRunIntroVisible) {
      router.push('/onboarding?mode=first-run&returnTo=%2F' as Href);
      return;
    }

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

            <View style={styles.heroArtFrame} accessible={false}>
              <Image
                source={titleScreenArt}
                style={styles.heroArt}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.eyebrow}>BAD DECISIONS HOLDINGS PRESENTS</Text>
            <Text style={styles.title}>Dungeon Dive:</Text>
            <Text style={styles.titleAccent}>Bad Decisions</Text>
            <Text style={styles.subtitle}>
              You are the employee still inside Meridian Spire when Crown Meridian&apos;s
              disaster plan turns the building into a live incident.
            </Text>

            <Text style={styles.bodyCopy}>
              Your job is to drag the active ticket floor by floor toward the
              executives who caused it, keep yourself alive, and avoid becoming
              the scapegoat when the tower asks who broke first.
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
                    styles={styles}
                  />
                  <StatCard
                    label="Crew"
                    value={String(snapshot?.unlockedCompanions ?? 0)}
                    styles={styles}
                  />
                  <StatCard
                    label="Chits"
                    value={String(snapshot?.metaCurrency ?? 0)}
                    styles={styles}
                  />
                </View>

                <View style={styles.runCard}>
                  <Text style={styles.runCardTitle}>Active Dive</Text>

                  {snapshot?.activeRun ? (
                    <>
                      <RunSummary
                        snapshot={snapshot}
                        nextStopLabel={resumeTarget?.summaryLabel ?? 'Run Map'}
                        styles={styles}
                      />
                      {recoveredFromBackup ? (
                        <Text style={styles.recoveryNotice}>
                          Recovered from your latest emergency save.
                        </Text>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Text style={styles.runCardLineMuted}>
                        No active dive found.
                      </Text>
                      <Text style={styles.runCardHint}>
                        Start a new descent and your progress will be saved as
                        the climb unfolds.
                      </Text>
                    </>
                  )}
                </View>

                <View style={styles.primaryActions}>
                  {activeRun && resumeLabel ? (
                    <GameButton
                      label={resumeLabel}
                      onPress={handleResume}
                    />
                  ) : null}
                  <GameButton
                    label={isFirstRunIntroVisible ? 'Begin HR Onboarding' : 'Start New Dive'}
                    onPress={handleNewDive}
                    variant={activeRun ? 'secondary' : 'primary'}
                  />
                </View>
                <View style={styles.nextGoalCard}>
                  <Text style={styles.nextGoalEyebrow}>{nextGoal.eyebrow}</Text>
                  <Text style={styles.nextGoalTitle}>{nextGoal.title}</Text>
                  <Text style={styles.nextGoalBody}>{nextGoal.body}</Text>
                  <GameButton
                    label={nextGoal.ctaLabel}
                    onPress={() => {
                      router.push(nextGoal.href);
                    }}
                    variant="secondary"
                  />
                </View>
              </>
            )}
          </View>

          {isFirstRunIntroVisible ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Before Your First Dive</Text>
              <View style={styles.introCard}>
                <View style={styles.introRow}>
                  <Text style={styles.introQuestion}>Who are you?</Text>
                  <Text style={styles.introAnswer}>
                    The employee left holding the ticket after leadership fused every
                    department into one catastrophe.
                  </Text>
                </View>
                <View style={styles.introRow}>
                  <Text style={styles.introQuestion}>What is Meridian Spire?</Text>
                  <Text style={styles.introAnswer}>
                    A vertical corporate ruin where each floor is another department&apos;s
                    bad decision turned into a hostile room.
                  </Text>
                </View>
                <View style={styles.introRow}>
                  <Text style={styles.introQuestion}>What are you trying to do?</Text>
                  <Text style={styles.introAnswer}>
                    Push the incident upward, survive each floor, and force the people
                    responsible to finally face the fallout.
                  </Text>
                </View>
                <View style={styles.introRow}>
                  <Text style={styles.introQuestion}>Why companions?</Text>
                  <Text style={styles.introAnswer}>
                    They change your early turns, cover weaknesses, and help carry the
                    run when the tower stops fighting fair.
                  </Text>
                </View>
              </View>
              <Text style={styles.runCardHint}>
                Before your first class assignment, HR now runs a short
                interactive orientation sim that teaches route choice, combat
                reading, rewards, events, and permanent systems. The full packet
                is archived in the codex after that.
              </Text>
            </View>
          ) : (
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
          )}

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
  styles,
}: {
  snapshot: BootstrapSnapshot;
  nextStopLabel: string;
  styles: ReturnType<typeof createStyles>;
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

function StatCard({
  label,
  value,
  styles,
}: StatCardProps & { styles: ReturnType<typeof createStyles> }) {
  return (
    <View style={styles.statCard}>
      <Text
        style={styles.statValue}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
      >
        {value}
      </Text>
      <Text
        style={styles.statLabel}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </View>
  );
}

function createStyles(
  settings: ProfileSettingsState,
  colors: ReturnType<typeof useAppTheme>['colors'],
  layout: ReturnType<typeof useResponsiveLayout>
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
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      paddingHorizontal: layout.shellPaddingHorizontal,
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
    heroArtFrame: {
      minHeight: layout.heroArtFrameHeight,
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: colors.background,
      borderWidth: settings.highContrastEnabled ? 2 : 1,
      borderColor: colors.borderStrong,
      marginBottom: spacing.sm,
    },
    heroArt: {
      width: '100%',
      height: layout.heroArtHeight,
      transform: [{ translateY: layout.heroArtTranslateY }],
    },
    badgeText: {
      color: colors.textMuted,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      letterSpacing: 0.4 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
      textTransform: 'uppercase',
    },
    eyebrow: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      letterSpacing: 1 + (settings.dyslexiaAssistEnabled ? 0.18 : 0),
    },
    title: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(38, settings),
      fontWeight: '900',
      lineHeight: scaleLineHeight(42, settings),
    },
    titleAccent: {
      color: colors.accent,
      fontSize: scaleFontSize(38, settings),
      fontWeight: '900',
      lineHeight: scaleLineHeight(42, settings),
      marginTop: -4,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(17, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(24, settings),
    },
    bodyCopy: {
      color: colors.textMuted,
      fontSize: scaleFontSize(15, settings),
      lineHeight: scaleLineHeight(22, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
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
      fontSize: scaleFontSize(18, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    loadingState: {
      paddingVertical: spacing.lg + 2,
      alignItems: 'center',
      gap: spacing.sm + 2,
    },
    loadingText: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
    },
    errorState: {
      gap: spacing.sm + 2,
    },
    errorTitle: {
      color: colors.error,
      fontSize: scaleFontSize(16, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
    },
    errorBody: {
      color: colors.errorMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    statGrid: {
      flexDirection: layout.stackStatCards ? 'column' : 'row',
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
      fontSize: scaleFontSize(24, settings),
      fontWeight: '900',
      lineHeight: scaleLineHeight(28, settings),
      textAlign: 'center',
      alignSelf: 'stretch',
    },
    statLabel: {
      color: colors.textMuted,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
      lineHeight: scaleLineHeight(16, settings),
      textAlign: 'center',
      alignSelf: 'stretch',
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
      fontSize: scaleFontSize(16, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
      marginBottom: 2,
    },
    runCardLine: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
    },
    runCardLineMuted: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
    },
    runCardLabel: {
      color: colors.textSubtle,
      fontWeight: '700',
    },
    runCardHint: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      lineHeight: scaleLineHeight(18, settings),
      marginTop: 4,
    },
    recoveryNotice: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(18, settings),
      marginTop: 4,
    },
    primaryActions: {
      gap: spacing.sm + 2,
    },
    nextGoalCard: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      gap: spacing.xs + 2,
    },
    nextGoalEyebrow: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    nextGoalTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(16, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(21, settings),
    },
    nextGoalBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    menuGrid: {
      gap: spacing.sm + 2,
    },
    introCard: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      gap: spacing.md,
    },
    introRow: {
      gap: spacing.xs,
    },
    introQuestion: {
      color: colors.accent,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(18, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    introAnswer: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
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
      fontSize: scaleFontSize(14, settings),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 0.7 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    footerBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
  });
}
