import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
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
  bondSceneDefinitions,
  getBondScenesForCompanion,
  getUnlockedBondScenesForLevel,
} from '@/src/content/bond-scenes';
import { companionDefinitions } from '@/src/content/companions';
import {
  getCompanionSupportSummary,
  getNextCompanionSupportSummary,
} from '@/src/engine/bond/companion-perks';
import { useGameStore } from '@/src/state/gameStore';
import { useProfileStore } from '@/src/state/profileStore';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState, ProfileState } from '@/src/types/profile';

type BondsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

type BondTier = {
  title: string;
  summary: string;
};

function getBondTier(level: number): BondTier {
  if (level >= 5) {
    return {
      title: 'Catastrophic Ally',
      summary: 'Trust is now absolute, unhealthy, and probably combat-relevant later.',
    };
  }

  if (level >= 4) {
    return {
      title: 'Ride-or-Die Contractor',
      summary: 'This companion will absolutely follow you into worse ideas.',
    };
  }

  if (level >= 3) {
    return {
      title: 'Crisis Favorite',
      summary: 'You have enough shared disasters to call this a real bond.',
    };
  }

  if (level >= 2) {
    return {
      title: 'Reliable Accomplice',
      summary: 'They trust your bad judgment more than company policy.',
    };
  }

  return {
    title: 'Coworker Of Necessity',
    summary: 'You have survived enough together to exchange names and liability.',
  };
}

function getNextBondMilestone(level: number) {
  if (level >= 5) {
    return 'Bond track capped for the current launch roster.';
  }

  return `Next milestone: level ${level + 1} - ${getBondTier(level + 1).title}.`;
}

function formatAverageBond(profile: ProfileState | null) {
  if (!profile || profile.unlockedCompanionIds.length === 0) {
    return '0.0';
  }

  const totalBond = profile.unlockedCompanionIds.reduce(
    (sum, companionId) => sum + (profile.bondLevels[companionId] ?? 0),
    0
  );

  return (totalBond / profile.unlockedCompanionIds.length).toFixed(1);
}

function countUnlockedBondScenes(profile: ProfileState | null) {
  if (!profile) {
    return 0;
  }

  return profile.unlockedCompanionIds.reduce((total, companionId) => {
    return (
      total +
      getUnlockedBondScenesForLevel(
        companionId,
        Math.max(1, profile.bondLevels[companionId] ?? 1)
      ).length
    );
  }, 0);
}

export default function BondsScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const bootstrapProfile = useGameStore((state) => state.profile);
  const bootstrapStatus = useGameStore((state) => state.bootstrapStatus);
  const bootstrapError = useGameStore((state) => state.error);
  const activeRun = useGameStore((state) => state.activeRun);
  const initializeApp = useGameStore((state) => state.initializeApp);
  const refreshBootstrap = useGameStore((state) => state.refreshBootstrap);
  const [loadStatus, setLoadStatus] = useState<BondsLoadStatus>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const resolvedProfile = profile ?? bootstrapProfile;
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  useEffect(() => {
    if (bootstrapStatus === 'idle') {
      void initializeApp();
    }
  }, [bootstrapStatus, initializeApp]);

  useEffect(() => {
    if (bootstrapStatus === 'idle' || bootstrapStatus === 'loading') {
      if (loadStatus !== 'loading') {
        setLoadStatus('loading');
        setLoadError(null);
      }
      return;
    }

    if (bootstrapStatus === 'error') {
      setLoadStatus('error');
      setLoadError(bootstrapError ?? 'The bond roster could not be reconstructed.');
      return;
    }

    if (loadStatus === 'ready' || loadStatus === 'error') {
      return;
    }

    let isCancelled = false;

    setLoadStatus('loading');
    setLoadError(null);

    void (async () => {
      try {
        if (!resolvedProfile) {
          await refreshProfile();
        }

        if (isCancelled) {
          return;
        }

        setLoadStatus('ready');
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setLoadStatus('error');
        setLoadError(
          error instanceof Error && error.message
            ? error.message
            : 'The bond roster could not be refreshed.'
        );
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [
    bootstrapError,
    bootstrapStatus,
    loadStatus,
    refreshProfile,
    resolvedProfile,
  ]);

  const handleRefresh = async () => {
    setLoadStatus('loading');
    setLoadError(null);

    try {
      await refreshBootstrap();
      await refreshProfile();
      setLoadStatus('ready');
    } catch (error) {
      setLoadStatus('error');
      setLoadError(
        error instanceof Error && error.message
          ? error.message
          : 'The bond roster could not be refreshed.'
      );
    }
  };

  const reserveCompanionId = useMemo(() => {
    if (!activeRun) {
      return null;
    }

    return (
      activeRun.chosenCompanionIds.find(
        (companionId) => companionId !== activeRun.activeCompanionId
      ) ?? null
    );
  }, [activeRun]);

  const highestBondCompanion = useMemo(() => {
    if (!resolvedProfile) {
      return null;
    }

    return companionDefinitions
      .filter((companion) =>
        resolvedProfile.unlockedCompanionIds.includes(companion.id)
      )
      .sort(
        (left, right) =>
          (resolvedProfile.bondLevels[right.id] ?? 0) -
          (resolvedProfile.bondLevels[left.id] ?? 0)
      )[0] ?? null;
  }, [resolvedProfile]);
  const unlockedBondSceneCount = useMemo(
    () => countUnlockedBondScenes(resolvedProfile),
    [resolvedProfile]
  );
  const latestSceneHighlights = useMemo(() => {
    if (!resolvedProfile) {
      return [];
    }

    return companionDefinitions
      .filter((companion) =>
        resolvedProfile.unlockedCompanionIds.includes(companion.id)
      )
      .flatMap((companion) => {
        const bondLevel = Math.max(1, resolvedProfile.bondLevels[companion.id] ?? 1);

        return getUnlockedBondScenesForLevel(companion.id, bondLevel).map((scene) => ({
          scene,
          companionName: companion.name,
        }));
      })
      .sort((left, right) => right.scene.milestoneLevel - left.scene.milestoneLevel)
      .slice(0, 3);
  }, [resolvedProfile]);

  const companionCards = useMemo(
    () =>
      companionDefinitions.map((companion) => {
        const unlocked =
          resolvedProfile?.unlockedCompanionIds.includes(companion.id) ?? false;
        const bondLevel = resolvedProfile?.bondLevels[companion.id] ?? 0;
        const tier = getBondTier(Math.max(1, bondLevel));
        const isActive = activeRun?.activeCompanionId === companion.id;
        const isReserve = reserveCompanionId === companion.id;
        const currentBondLevel = Math.max(1, bondLevel);
        const allScenes = getBondScenesForCompanion(companion.id);
        const unlockedScenes = getUnlockedBondScenesForLevel(
          companion.id,
          currentBondLevel
        );
        const lockedScenes = allScenes.filter(
          (scene) => scene.milestoneLevel > currentBondLevel
        );

        return {
          companion,
          unlocked,
          bondLevel,
          tier,
          isActive,
          isReserve,
          leadPerk: getCompanionSupportSummary(
            companion.id,
            'active',
            currentBondLevel
          ),
          reservePerk: getCompanionSupportSummary(
            companion.id,
            'reserve',
            currentBondLevel
          ),
          nextLeadPerk: getNextCompanionSupportSummary(
            companion.id,
            'active',
            currentBondLevel
          ),
          nextReservePerk: getNextCompanionSupportSummary(
            companion.id,
            'reserve',
            currentBondLevel
          ),
          unlockedScenes,
          lockedScenes,
        };
      }),
    [activeRun, reserveCompanionId, resolvedProfile]
  );

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
            <Text style={styles.eyebrow}>META</Text>
            <Text style={styles.title}>Companion Bonds</Text>
            <Text style={styles.subtitle}>
              Shared disasters leave a mark on the crew.
            </Text>
            <Text style={styles.body}>
              Bond levels shape lead and reserve support perks, unlock scenes,
              and show how each companion has learned to survive beside you.
            </Text>
          </View>

          {loadStatus === 'idle' || loadStatus === 'loading' ? (
            <LoadingPanel label="Reopening the companion file cabinet..." />
          ) : loadStatus === 'error' ? (
            <InfoPanel
              title="Bond Error"
              body={loadError ?? 'The bond roster could not be reconstructed.'}
              primaryLabel="Try Again"
              onPrimaryPress={() => {
                void handleRefresh();
              }}
              secondaryLabel="Return to Title"
              onSecondaryPress={() => {
                router.push('/' as Href);
              }}
            />
          ) : !resolvedProfile ? (
            <InfoPanel
              title="Profile Missing"
              body="The profile did not finish loading, so bond data is not available yet."
              primaryLabel="Reload Bonds"
              onPrimaryPress={() => {
                void handleRefresh();
              }}
              secondaryLabel="Return to Title"
              onSecondaryPress={() => {
                router.push('/' as Href);
              }}
            />
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Bond Program</Text>
                <Text style={styles.panelBody}>
                  This screen tracks who trusts you, who tolerates you, and who
                  is one bad floor away from saying it out loud.
                </Text>
                <View style={styles.statGrid}>
                  <StatCard
                    label="Unlocked"
                    value={`${resolvedProfile.unlockedCompanionIds.length}/${companionDefinitions.length}`}
                  />
                  <StatCard
                    label="Avg Bond"
                    value={formatAverageBond(resolvedProfile)}
                  />
                </View>
                <View style={styles.statGrid}>
                  <StatCard
                    label="Scenes"
                    value={`${unlockedBondSceneCount}/${bondSceneDefinitions.length}`}
                  />
                  <StatCard
                    label="Max Bond"
                    value={String(
                      highestBondCompanion
                        ? resolvedProfile.bondLevels[highestBondCompanion.id] ?? 0
                        : 0
                    )}
                  />
                </View>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Highest Bond"
                    value={
                      highestBondCompanion
                        ? `${highestBondCompanion.name} - level ${
                            resolvedProfile.bondLevels[highestBondCompanion.id] ?? 0
                          }`
                        : 'No active roster'
                    }
                  />
                  <DetailLine
                    label="Meta Currency"
                    value={String(resolvedProfile.metaCurrency)}
                  />
                  <DetailLine
                    label="Total Runs"
                    value={String(resolvedProfile.stats.totalRuns)}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Scene Archive</Text>
                <Text style={styles.panelBody}>
                  Bond milestones now unlock authored scenes at levels 3 and 5.
                  As runs build trust, this archive fills in with the companion
                  moments that explain why those perks got stronger.
                </Text>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Unlocked Scenes"
                    value={`${unlockedBondSceneCount}/${bondSceneDefinitions.length}`}
                  />
                  <DetailLine
                    label="Locked Scenes"
                    value={String(
                      Math.max(0, bondSceneDefinitions.length - unlockedBondSceneCount)
                    )}
                  />
                  <DetailLine
                    label="Latest Highlights"
                    value={
                      latestSceneHighlights.length > 0
                        ? latestSceneHighlights
                            .map(
                              ({ scene, companionName }) =>
                                `${companionName}: ${scene.title}`
                            )
                            .join(' | ')
                        : 'No milestone scenes unlocked yet'
                    }
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Current Dive Pairing</Text>
                <Text style={styles.panelBody}>
                  Active-run companion context is surfaced here so the bond
                  screen can track who is currently providing lead and reserve
                  support inside a live run.
                </Text>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Active"
                    value={
                      activeRun
                        ? getCompanionLine(resolvedProfile, activeRun.activeCompanionId)
                        : 'No active dive loaded'
                    }
                  />
                  <DetailLine
                    label="Reserve"
                    value={
                      reserveCompanionId
                        ? getCompanionLine(resolvedProfile, reserveCompanionId)
                        : activeRun
                          ? 'No reserve companion found'
                          : 'No active dive loaded'
                    }
                  />
                  <DetailLine
                    label="Floor"
                    value={activeRun ? String(activeRun.floorIndex) : 'N/A'}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Roster</Text>
                <Text style={styles.panelBody}>
                  Unlocked companions show their current bond level and next
                  milestone. Locked companions stay visible but classified so
                  the recruitment roadmap is still readable.
                </Text>
                <View style={styles.rosterList}>
                  {companionCards.map(
                    ({
                      companion,
                      unlocked,
                      bondLevel,
                      tier,
                      isActive,
                      isReserve,
                      leadPerk,
                      reservePerk,
                      nextLeadPerk,
                      nextReservePerk,
                      unlockedScenes,
                      lockedScenes,
                    }) => (
                      <View
                        key={companion.id}
                        style={[
                          styles.companionCard,
                          !unlocked ? styles.companionCardLocked : null,
                          isActive ? styles.companionCardActive : null,
                        ]}
                      >
                        <View style={styles.companionHeader}>
                          <View style={styles.companionHeading}>
                            <Text style={styles.companionName}>
                              {unlocked ? companion.name : 'Classified Recruit'}
                            </Text>
                            <Text style={styles.companionSpecialty}>
                              {unlocked ? companion.specialty : 'Profile data pending'}
                            </Text>
                          </View>
                          <View style={styles.badgeGroup}>
                            <CompanionBadge
                              label={unlocked ? `Lv ${bondLevel}` : 'Locked'}
                              active={!unlocked ? false : isActive}
                            />
                            {isReserve ? (
                              <CompanionBadge label="Reserve" muted />
                            ) : null}
                          </View>
                        </View>
                        <Text style={styles.companionBody}>
                          {unlocked
                            ? companion.description
                            : 'This companion has not been unlocked on the current profile yet.'}
                        </Text>
                        <View style={styles.detailCard}>
                          <DetailLine
                            label="Bond Tier"
                            value={unlocked ? tier.title : 'Classified'}
                          />
                          <DetailLine
                            label="Lead Perk"
                            value={unlocked ? leadPerk.summary : 'Classified'}
                          />
                          <DetailLine
                            label="Reserve Perk"
                            value={unlocked ? reservePerk.summary : 'Classified'}
                          />
                          <DetailLine
                            label="Status"
                            value={
                              unlocked
                                ? isActive
                                  ? 'Leading current dive'
                                  : isReserve
                                    ? 'Reserve on current dive'
                                    : 'Available in roster'
                                : 'Recruitment pending'
                            }
                          />
                        </View>
                        <Text style={styles.milestoneText}>
                          {unlocked
                            ? `${tier.summary} ${getNextBondMilestone(bondLevel)}`
                            : 'Unlock this companion to begin building a recorded bond track.'}
                        </Text>
                        {unlocked ? (
                          <Text style={styles.perkUpgradeText}>
                            {nextLeadPerk || nextReservePerk
                              ? [
                                  nextLeadPerk
                                    ? `Next lead upgrade: ${nextLeadPerk.summary}`
                                    : null,
                                  nextReservePerk
                                    ? `Next reserve upgrade: ${nextReservePerk.summary}`
                                    : null,
                                ]
                                  .filter(Boolean)
                                  .join(' ')
                              : 'Perk track capped for the current launch roster.'}
                          </Text>
                        ) : null}
                        {unlocked ? (
                          <View style={styles.sceneList}>
                            {unlockedScenes.map((scene) => (
                              <View key={scene.id} style={styles.sceneCard}>
                                <Text style={styles.sceneTitle}>
                                  Level {scene.milestoneLevel}: {scene.title}
                                </Text>
                                <Text style={styles.sceneSummary}>
                                  {scene.summary}
                                </Text>
                                {scene.sceneLines.map((sceneLine, index) => (
                                  <Text
                                    key={`${scene.id}-${index}`}
                                    style={styles.sceneLine}
                                  >
                                    {sceneLine}
                                  </Text>
                                ))}
                              </View>
                            ))}
                            {lockedScenes.map((scene) => (
                              <View
                                key={scene.id}
                                style={[styles.sceneCard, styles.sceneCardLocked]}
                              >
                                <Text style={styles.sceneTitle}>
                                  Level {scene.milestoneLevel} Scene Locked
                                </Text>
                                <Text style={styles.sceneSummary}>
                                  Reach bond level {scene.milestoneLevel} to unlock{' '}
                                  {scene.title}.
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    )
                  )}
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Actions</Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Refresh Bonds"
                    onPress={() => {
                      void handleRefresh();
                    }}
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
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getCompanionLine(profile: ProfileState, companionId: string) {
  const companion = companionDefinitions.find((item) => item.id === companionId);
  const name = companion?.name ?? companionId;
  const level = profile.bondLevels[companionId] ?? 0;

  return `${name} - level ${level}`;
}

function LoadingPanel({ label }: { label: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.panel}>
      <View style={styles.loadingState}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.panelBody}>{label}</Text>
      </View>
    </View>
  );
}

function InfoPanel({
  title,
  body,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelBody}>{body}</Text>
      <View style={styles.actionGroup}>
        <GameButton label={primaryLabel} onPress={onPrimaryPress} />
        {secondaryLabel && onSecondaryPress ? (
          <GameButton
            label={secondaryLabel}
            onPress={onSecondaryPress}
            variant="secondary"
          />
        ) : null}
      </View>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <Text style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

function CompanionBadge({
  label,
  active = false,
  muted = false,
}: {
  label: string;
  active?: boolean;
  muted?: boolean;
}) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View
      style={[
        styles.badge,
        active ? styles.badgeActive : null,
        muted ? styles.badgeMuted : null,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          active ? styles.badgeTextActive : null,
          muted ? styles.badgeTextMuted : null,
        ]}
      >
        {label}
      </Text>
    </View>
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
    panelBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(21, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    loadingState: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
      gap: spacing.sm,
    },
    statGrid: {
      flexDirection: 'row',
      gap: spacing.sm + 2,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    statValue: {
      color: colors.accent,
      fontSize: scaleFontSize(22, settings),
      fontWeight: '900',
      lineHeight: scaleLineHeight(26, settings),
    },
    statLabel: {
      color: colors.textMuted,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    detailCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs + 2,
    },
    detailLine: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
    },
    detailLabel: {
      color: colors.textSubtle,
      fontWeight: '700',
    },
    rosterList: {
      gap: spacing.md,
    },
    companionCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      gap: spacing.sm + 2,
    },
    companionCardLocked: {
      opacity: 0.76,
    },
    companionCardActive: {
      borderColor: colors.accent,
    },
    companionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    companionHeading: {
      flex: 1,
      gap: spacing.xs,
    },
    companionName: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(17, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(21, settings),
    },
    companionSpecialty: {
      color: colors.accent,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(18, settings),
    },
    companionBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    milestoneText: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      lineHeight: scaleLineHeight(18, settings),
    },
    perkUpgradeText: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      lineHeight: scaleLineHeight(18, settings),
    },
    sceneList: {
      gap: spacing.sm,
    },
    sceneCard: {
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 14,
      padding: 12,
      gap: spacing.xs + 2,
    },
    sceneCardLocked: {
      opacity: 0.72,
    },
    sceneTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(18, settings),
    },
    sceneSummary: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      lineHeight: scaleLineHeight(18, settings),
    },
    sceneLine: {
      color: colors.textMuted,
      fontSize: scaleFontSize(12, settings),
      lineHeight: scaleLineHeight(18, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    badgeGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      gap: spacing.xs,
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceRaised,
    },
    badgeActive: {
      borderColor: colors.accent,
      backgroundColor: colors.surfaceRaised,
    },
    badgeMuted: {
      borderColor: colors.border,
    },
    badgeText: {
      color: colors.textMuted,
      fontSize: scaleFontSize(11, settings),
      fontWeight: '800',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
      textTransform: 'uppercase',
    },
    badgeTextActive: {
      color: colors.accent,
    },
    badgeTextMuted: {
      color: colors.textSecondary,
    },
    actionGroup: {
      gap: spacing.sm + 2,
    },
  });
}
