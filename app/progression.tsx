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

import { trackAnalyticsEvent } from '@/src/analytics/client';
import { GameButton } from '@/src/components/game-button';
import { getBondScenesUnlockedByBondGains } from '@/src/content/bond-scenes';
import { getCompanionDefinition } from '@/src/content/companions';
import { getItemDefinition } from '@/src/content/items';
import {
  buildMetaUpgradeCatalog,
  getMetaUpgradeMaxHpBonus,
  getMetaUpgradeRewardCurrencyBonus,
  getMetaUpgradeRewardHealingBonus,
} from '@/src/engine/meta/meta-upgrade-engine';
import { loadRunHistoryAsync } from '@/src/save/runRepo';
import { getNextGoalSummary } from '@/src/progression/next-goal';
import { useGameStore } from '@/src/state/gameStore';
import { useProfileStore } from '@/src/state/profileStore';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';
import type { RunHistoryEntry } from '@/src/types/run';
import { humanizeId } from '@/src/utils/strings';
import { formatSaveTimestampLabel } from '@/src/utils/time';

type ProgressionLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

async function loadProgressionData() {
  return loadRunHistoryAsync(12);
}

export default function ProgressionScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const bootstrapProfile = useGameStore((state) => state.profile);
  const bootstrapStatus = useGameStore((state) => state.bootstrapStatus);
  const bootstrapError = useGameStore((state) => state.error);
  const initializeApp = useGameStore((state) => state.initializeApp);
  const refreshBootstrap = useGameStore((state) => state.refreshBootstrap);
  const [historyEntries, setHistoryEntries] = useState<RunHistoryEntry[]>([]);
  const [loadStatus, setLoadStatus] = useState<ProgressionLoadStatus>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const resolvedProfile = profile ?? bootstrapProfile;
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  useEffect(() => {
    void trackAnalyticsEvent('meta_screen_viewed', { screen: 'progression' });
  }, []);

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
      setLoadError(
        bootstrapError ?? 'The progression archive could not be reconstructed.'
      );
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

        const nextHistoryEntries = await loadProgressionData();

        if (isCancelled) {
          return;
        }

        setHistoryEntries(nextHistoryEntries);
        setLoadStatus('ready');
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setLoadStatus('error');
        setLoadError(
          error instanceof Error && error.message
            ? error.message
            : 'The archive could not be reopened.'
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

  const totalRuns = resolvedProfile?.stats.totalRuns ?? 0;
  const totalWins = resolvedProfile?.stats.totalWins ?? 0;
  const totalDeaths = resolvedProfile?.stats.totalDeaths ?? 0;
  const totalAbandons = Math.max(0, totalRuns - totalWins - totalDeaths);
  const winRateLabel =
    totalRuns > 0 ? `${Math.round((totalWins / totalRuns) * 100)}%` : '0%';
  const latestArchivedRun = historyEntries[0] ?? null;
  const olderArchivedRuns = historyEntries.slice(1);
  const metaUpgradeCatalog = useMemo(
    () => (resolvedProfile ? buildMetaUpgradeCatalog(resolvedProfile) : []),
    [resolvedProfile]
  );
  const maxHpBonus = resolvedProfile
    ? getMetaUpgradeMaxHpBonus(resolvedProfile.metaUpgradeLevels)
    : 0;
  const rewardCurrencyBonus = resolvedProfile
    ? getMetaUpgradeRewardCurrencyBonus(resolvedProfile.metaUpgradeLevels)
    : 0;
  const rewardHealingBonus = resolvedProfile
    ? getMetaUpgradeRewardHealingBonus(resolvedProfile.metaUpgradeLevels)
    : 0;
  const historyBodyCopy = latestArchivedRun
    ? 'Run history is gathered here, with archived recaps, final loadouts, and lifetime totals from every finished climb.'
    : 'Finished dives will collect here as they are completed, along with their recaps and lifetime totals.';
  const nextGoal = useMemo(
    () => getNextGoalSummary({ profile: resolvedProfile, activeRun: null }),
    [resolvedProfile]
  );

  const handleRefresh = async () => {
    setLoadStatus('loading');
    setLoadError(null);

    try {
      await refreshBootstrap();
      await refreshProfile();
      const nextHistoryEntries = await loadProgressionData();

      setHistoryEntries(nextHistoryEntries);
      setLoadStatus('ready');
    } catch (error) {
      setLoadStatus('error');
      setLoadError(
        error instanceof Error && error.message
          ? error.message
          : 'The archive could not be refreshed.'
      );
    }
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
            <Text style={styles.eyebrow}>META</Text>
            <Text style={styles.title}>Progression</Text>
            <Text style={styles.subtitle}>
              Run archives, requisitions, and operations upgrades are live.
            </Text>
            <Text style={styles.body}>{historyBodyCopy}</Text>
          </View>

          {loadStatus === 'idle' || loadStatus === 'loading' ? (
            <LoadingPanel label="Reopening archived incident reports..." />
          ) : loadStatus === 'error' ? (
            <InfoPanel
              title="Archive Error"
              body={
                loadError ??
                'The progression archive could not be reconstructed.'
              }
              primaryLabel="Try Again"
              onPrimaryPress={handleRefresh}
              secondaryLabel="Employee Portal"
              onSecondaryPress={() => {
                router.push('/' as Href);
              }}
            />
          ) : !resolvedProfile ? (
            <InfoPanel
              title="Profile Missing"
              body="The profile did not finish loading, so progression data cannot be displayed yet."
              primaryLabel="Reload Progression"
              onPrimaryPress={handleRefresh}
              secondaryLabel="Employee Portal"
              onSecondaryPress={() => {
                router.push('/' as Href);
              }}
            />
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Career Totals</Text>
                <View style={styles.statGrid}>
                  <StatCard label="Runs" value={String(totalRuns)} />
                  <StatCard label="Wins" value={String(totalWins)} />
                </View>
                <View style={styles.statGrid}>
                  <StatCard label="Deaths" value={String(totalDeaths)} />
                  <StatCard label="Win Rate" value={winRateLabel} />
                </View>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Bosses Killed"
                    value={String(resolvedProfile.stats.totalBossesKilled)}
                  />
                  <DetailLine
                    label="Abandons"
                    value={String(totalAbandons)}
                  />
                  <DetailLine
                    label="Meta Currency"
                    value={String(resolvedProfile.metaCurrency)}
                  />
                  <DetailLine
                    label="Unlocked Items"
                    value={String(resolvedProfile.unlockedItemIds.length)}
                  />
                  <DetailLine
                    label="Unlocked Events"
                    value={String(resolvedProfile.unlockedEventIds.length)}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Unlock Coverage</Text>
                <Text style={styles.panelBody}>
                  The archive tracks what you have earned, lost, and dragged
                  back out of Meridian Spire so far.
                </Text>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Classes"
                    value={`${resolvedProfile.unlockedClassIds.length} unlocked`}
                  />
                  <DetailLine
                    label="Companions"
                    value={`${resolvedProfile.unlockedCompanionIds.length} unlocked`}
                  />
                  <DetailLine
                    label="Items"
                    value={`${resolvedProfile.unlockedItemIds.length} unlocked`}
                  />
                  <DetailLine
                    label="Events"
                    value={`${resolvedProfile.unlockedEventIds.length} archived`}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Permanent Upgrades</Text>
                <Text style={styles.panelBody}>
                  These upgrades strengthen every future climb, even after a
                  bad run ends in paperwork and smoke.
                </Text>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Starting Max HP"
                    value={`+${maxHpBonus} permanent bonus`}
                  />
                  <DetailLine
                    label="Reward Chits"
                    value={`+${rewardCurrencyBonus} per reward claim`}
                  />
                  <DetailLine
                    label="Reward Healing"
                    value={`+${rewardHealingBonus} per reward claim`}
                  />
                </View>
                <View style={styles.upgradeList}>
                  {metaUpgradeCatalog.map((offer) => (
                    <View key={`upgrade-${offer.id}`} style={styles.upgradeCard}>
                      <Text style={styles.upgradeTitle}>
                        {offer.title} - rank {offer.currentLevel}/{offer.maxLevel}
                      </Text>
                      <Text style={styles.upgradeBody}>{offer.currentEffectLabel}</Text>
                      {offer.nextEffectLabel ? (
                        <Text style={styles.upgradeBody}>{offer.nextEffectLabel}</Text>
                      ) : (
                        <Text style={styles.upgradeBody}>Fully upgraded.</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {latestArchivedRun ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Latest Archived Run</Text>
                  <Text style={styles.panelBody}>
                    The most recent finished run can be reopened from its saved
                    recap even after the active slot has been cleared.
                  </Text>
                  <ArchiveCard
                    entry={latestArchivedRun}
                    emphasize
                  />
                </View>
              ) : (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Run Archive</Text>
                  <Text style={styles.panelBody}>
                    No completed dives have been archived yet. Finish a run and
                    its recap will show up here automatically.
                  </Text>
                </View>
              )}

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Recent Runs</Text>
                <Text style={styles.panelBody}>
                  Older archive entries stay browsable here, including basic
                  legacy rows that predate the richer recap payload.
                </Text>
                {olderArchivedRuns.length > 0 ? (
                  <View style={styles.archiveList}>
                    {olderArchivedRuns.map((entry) => (
                      <ArchiveCard
                        key={`archive-${entry.id}`}
                        entry={entry}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyState}>
                    No older archived runs yet.
                  </Text>
                )}
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Next Goal</Text>
                <Text style={styles.panelBody}>
                  Permanent progression works better when the archive points clearly at the next meaningful unlock or milestone.
                </Text>
                <View style={styles.detailCard}>
                  <DetailLine label="Focus" value={nextGoal.title} />
                  <DetailLine label="Why now" value={nextGoal.body} />
                </View>
                <View style={styles.actionGroup}>
                  <GameButton
                    label={nextGoal.ctaLabel}
                    onPress={() => {
                      router.push(nextGoal.href);
                    }}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Actions</Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Refresh Archive"
                    onPress={handleRefresh}
                  />
                  <GameButton
                    label="Employee Portal"
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

function ArchiveCard({
  entry,
  emphasize = false,
}: {
  entry: RunHistoryEntry;
  emphasize?: boolean;
}) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);
  const activeCompanionName = useMemo(() => {
    if (!entry.recap) {
      return null;
    }

    return (
      getCompanionDefinition(entry.recap.activeCompanionId)?.name ??
      entry.recap.activeCompanionId
    );
  }, [entry]);
  const loadoutLabel = useMemo(() => {
    if (!entry.recap) {
      return 'Unavailable in legacy archive';
    }

    if (entry.recap.inventoryItemIds.length === 0) {
      return 'No carried contraband';
    }

    return entry.recap.inventoryItemIds
      .map((itemId) => getItemDefinition(itemId)?.name ?? itemId)
      .join(', ');
  }, [entry]);
  const foundItemLabel = useMemo(() => {
    if (!entry.recap) {
      return 'Unavailable in legacy archive';
    }

    if (entry.recap.stats.collectedItemIds.length === 0) {
      return 'No new contraband found';
    }

    return entry.recap.stats.collectedItemIds
      .map((itemId) => getItemDefinition(itemId)?.name ?? itemId)
      .join(', ');
  }, [entry]);
  const bondGainLabel = useMemo(() => {
    if (!entry.recap) {
      return 'Unavailable in legacy archive';
    }

    if (entry.recap.bondGains.length === 0) {
      return 'No recorded bond progress';
    }

    return entry.recap.bondGains
      .map((bondGain) => {
        const companionName =
          getCompanionDefinition(bondGain.companionId)?.name ?? bondGain.companionId;
        const gainLabel =
          bondGain.levelsEarned > 0
            ? `+${bondGain.levelsEarned}`
            : `Lv ${bondGain.levelAfter}`;

        return `${companionName} ${gainLabel}`;
      })
      .join(', ');
  }, [entry]);
  const unlockedSceneLabel = useMemo(() => {
    if (!entry.recap) {
      return 'Unavailable in legacy archive';
    }

    const unlockedScenes = getBondScenesUnlockedByBondGains(entry.recap.bondGains);

    if (unlockedScenes.length === 0) {
      return 'No new scenes unlocked';
    }

    return unlockedScenes.map((scene) => scene.title).join(', ');
  }, [entry]);
  const archivedAtLabel = useMemo(
    () => formatSaveTimestampLabel(entry.updatedAt),
    [entry.updatedAt]
  );

  return (
    <View style={[styles.archiveCard, emphasize && styles.archiveCardEmphasis]}>
      <View style={styles.archiveHeader}>
        <View style={styles.archiveHeading}>
          <Text style={styles.archiveTitle}>{entry.className}</Text>
          <Text style={styles.archiveMeta}>
            Floor {entry.floorReached} - Archived {archivedAtLabel}
          </Text>
        </View>
        <ResultBadge result={entry.result} />
      </View>
      <View style={styles.detailCard}>
        <DetailLine
          label="Companion"
          value={activeCompanionName ?? 'Unavailable in legacy archive'}
        />
        <DetailLine
          label="Final HP"
          value={
            entry.recap
              ? `${entry.recap.finalHero.currentHp}/${entry.recap.finalHero.maxHp}`
              : 'Unavailable in legacy archive'
          }
        />
        <DetailLine label="Run ID" value={entry.runId} />
        <DetailLine label="Loadout" value={loadoutLabel} />
        <DetailLine label="Items Found" value={foundItemLabel} />
        <DetailLine label="Bond Gains" value={bondGainLabel} />
        <DetailLine label="Scene Unlocks" value={unlockedSceneLabel} />
      </View>
      {entry.recap ? (
        <View style={styles.archiveStats}>
          <Text style={styles.archiveStat}>
            Meta +{entry.recap.stats.metaCurrencyEarned}
          </Text>
          <Text style={styles.archiveStat}>
            Rewards {entry.recap.stats.rewardsClaimed}
          </Text>
          <Text style={styles.archiveStat}>
            Events {entry.recap.stats.eventsResolved}
          </Text>
          <Text style={styles.archiveStat}>
            Battles {entry.recap.stats.battlesWon}
          </Text>
        </View>
      ) : null}
      <Text style={styles.archiveBody}>
        {entry.recap
          ? entry.recap.outcome.detail
          : 'This older archive row can still be reopened, but it does not include the richer recap payload yet.'}
      </Text>
      <View style={styles.actionGroup}>
        <GameButton
          label="Open Recap"
          onPress={() => {
            router.push(
              `/end-run?runId=${encodeURIComponent(entry.runId)}` as Href
            );
          }}
          variant={emphasize ? 'primary' : 'secondary'}
        />
      </View>
    </View>
  );
}

function ResultBadge({
  result,
}: {
  result: RunHistoryEntry['result'];
}) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View
      style={[
        styles.resultBadge,
        result === 'win'
          ? styles.resultBadgeWin
          : result === 'loss'
            ? styles.resultBadgeLoss
            : styles.resultBadgeAbandon,
      ]}
    >
      <Text
        style={[
          styles.resultBadgeText,
          result === 'win'
            ? styles.resultBadgeTextWin
            : result === 'loss'
              ? styles.resultBadgeTextLoss
              : styles.resultBadgeTextAbandon,
        ]}
      >
        {humanizeId(result)}
      </Text>
    </View>
  );
}

function LoadingPanel({
  label,
}: {
  label: string;
}) {
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
        <GameButton
          label={primaryLabel}
          onPress={onPrimaryPress}
        />
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
      <Text
        style={styles.statValue}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text
        style={styles.statLabel}
        numberOfLines={2}
        adjustsFontSizeToFit
      >
        {label}
      </Text>
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
    archiveList: {
      gap: spacing.md,
    },
    upgradeList: {
      gap: spacing.sm + 2,
    },
    upgradeCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      gap: spacing.xs + 2,
    },
    upgradeTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(15, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(21, settings),
    },
    upgradeBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    archiveCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      gap: spacing.sm + 2,
    },
    archiveCardEmphasis: {
      borderColor: colors.accent,
    },
    archiveHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    archiveHeading: {
      flex: 1,
      gap: spacing.xs,
    },
    archiveTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(18, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    archiveMeta: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
    },
    archiveBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    archiveStats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    archiveStat: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(18, settings),
    },
    resultBadge: {
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderWidth: 1,
    },
    resultBadgeWin: {
      backgroundColor: '#2a2412',
      borderColor: '#806b2b',
    },
    resultBadgeLoss: {
      backgroundColor: '#27191b',
      borderColor: '#7d474b',
    },
    resultBadgeAbandon: {
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.borderStrong,
    },
    resultBadgeText: {
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
      textTransform: 'uppercase',
    },
    resultBadgeTextWin: {
      color: colors.accent,
    },
    resultBadgeTextLoss: {
      color: colors.error,
    },
    resultBadgeTextAbandon: {
      color: colors.textMuted,
    },
    emptyState: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
    },
    actionGroup: {
      gap: spacing.sm + 2,
    },
  });
}
