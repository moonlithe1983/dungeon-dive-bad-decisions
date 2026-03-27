import { router, type Href, useLocalSearchParams } from 'expo-router';
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
import { getBondScenesUnlockedByBondGains } from '@/src/content/bond-scenes';
import { getCompanionDefinition } from '@/src/content/companions';
import { getItemDefinition } from '@/src/content/items';
import {
  loadLatestRunHistoryEntryAsync,
  loadRunHistoryEntryByRunIdAsync,
} from '@/src/save/runRepo';
import { useRunStore } from '@/src/state/runStore';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import type { RunHistoryEntry } from '@/src/types/run';
import { humanizeId } from '@/src/utils/strings';
import { formatSaveTimestampLabel } from '@/src/utils/time';

type EndRunLoadStatus = 'loading' | 'ready' | 'missing' | 'error';

function pickSingleParam(
  value: string | string[] | undefined
): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return typeof value === 'string' && value.length > 0 ? value : null;
}

export default function EndRunScreen() {
  const { runId: runIdParam } = useLocalSearchParams<{
    runId?: string | string[];
  }>();
  const currentRunId = useRunStore((state) => state.currentRun?.runId ?? null);
  const clearCurrentRunState = useRunStore((state) => state.clearCurrentRunState);
  const [archivedRun, setArchivedRun] = useState<RunHistoryEntry | null>(null);
  const [loadStatus, setLoadStatus] = useState<EndRunLoadStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const requestedRunId = useMemo(
    () => pickSingleParam(runIdParam) ?? currentRunId,
    [currentRunId, runIdParam]
  );

  useEffect(() => {
    let isCancelled = false;

    setLoadStatus('loading');
    setLoadError(null);

    void (async () => {
      try {
        const nextArchivedRun = requestedRunId
          ? await loadRunHistoryEntryByRunIdAsync(requestedRunId)
          : await loadLatestRunHistoryEntryAsync();

        if (isCancelled) {
          return;
        }

        setArchivedRun(nextArchivedRun);
        setLoadStatus(nextArchivedRun ? 'ready' : 'missing');
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setArchivedRun(null);
        setLoadStatus('error');
        setLoadError(
          error instanceof Error && error.message
            ? error.message
            : 'The archived run recap could not be loaded.'
        );
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [requestedRunId]);

  const isFailedRun = archivedRun?.result === 'loss';
  const isAbandonedRun = archivedRun?.result === 'abandon';
  const activeCompanionName = useMemo(() => {
    if (!archivedRun?.recap) {
      return null;
    }

    return (
      getCompanionDefinition(archivedRun.recap.activeCompanionId)?.name ??
      archivedRun.recap.activeCompanionId
    );
  }, [archivedRun]);
  const carriedItemNames = useMemo(() => {
    if (!archivedRun?.recap) {
      return [];
    }

    return archivedRun.recap.inventoryItemIds.map(
      (itemId) => getItemDefinition(itemId)?.name ?? itemId
    );
  }, [archivedRun]);
  const collectedItemNames = useMemo(() => {
    if (!archivedRun?.recap) {
      return [];
    }

    return archivedRun.recap.stats.collectedItemIds.map(
      (itemId) => getItemDefinition(itemId)?.name ?? itemId
    );
  }, [archivedRun]);
  const bondGainLines = useMemo(() => {
    if (!archivedRun?.recap) {
      return [];
    }

    return archivedRun.recap.bondGains.map((bondGain) => {
      const companionName =
        getCompanionDefinition(bondGain.companionId)?.name ?? bondGain.companionId;
      const roleLabel = bondGain.role === 'active' ? 'Lead' : 'Reserve';

      return {
        id: `${bondGain.companionId}-${bondGain.role}`,
        label: `${companionName} (${roleLabel})`,
        value:
          bondGain.levelsEarned > 0
            ? `${bondGain.levelBefore} -> ${bondGain.levelAfter} (+${bondGain.levelsEarned})`
            : `${bondGain.levelAfter} (capped)`,
      };
    });
  }, [archivedRun]);
  const unlockedBondScenes = useMemo(() => {
    if (!archivedRun?.recap) {
      return [];
    }

    return getBondScenesUnlockedByBondGains(archivedRun.recap.bondGains);
  }, [archivedRun]);
  const archivedAtLabel = useMemo(
    () => formatSaveTimestampLabel(archivedRun?.updatedAt),
    [archivedRun?.updatedAt]
  );

  const handleReturnToTitle = () => {
    clearCurrentRunState();
    router.replace('/' as Href);
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
            <Text style={styles.eyebrow}>RUN RESULT</Text>
            <Text style={styles.title}>End Run</Text>
            <Text style={styles.subtitle}>
              {loadStatus === 'ready'
                ? isAbandonedRun
                  ? 'Abandoned dives now archive their final state.'
                  : isFailedRun
                  ? 'Defeat recap now survives app restarts.'
                  : 'Victory recap now loads from the archive.'
                : 'Archived results now drive this screen.'}
            </Text>
            <Text style={styles.body}>
              {loadStatus === 'ready'
                ? archivedRun?.recap
                  ? 'This route now rebuilds its recap from persisted run history instead of depending on whatever still happens to be in memory.'
                  : 'This archived run predates recap payloads, so the screen can still recover the basic result record even though the richer summary was not stored yet.'
                : 'The active run has already been cleared, so this screen now reconstructs the result from the archive layer instead of volatile runtime state.'}
            </Text>
          </View>

          {loadStatus === 'loading' ? (
            <LoadingPanel label="Reopening the archived incident report..." />
          ) : loadStatus === 'error' ? (
            <InfoPanel
              title="Archive Error"
              body={
                loadError ??
                'The archived result could not be reconstructed from run history.'
              }
              primaryLabel="Return to Title"
              onPrimaryPress={handleReturnToTitle}
            />
          ) : loadStatus === 'missing' || !archivedRun ? (
            <InfoPanel
              title="No Archived Run Found"
              body={
                requestedRunId
                  ? 'No archived recap matched this run ID. The active slot has already been cleared, so the safest next step is to return to the title screen.'
                  : 'There is no archived run recap available yet. Return to the title screen and start a new dive when you are ready.'
              }
              primaryLabel="Return to Title"
              onPrimaryPress={handleReturnToTitle}
            />
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>
                  {isAbandonedRun
                    ? 'Abandon Logged'
                    : isFailedRun
                      ? 'Loss Logged'
                      : 'Victory Logged'}
                </Text>
                <View style={styles.statGrid}>
                  <StatCard label="Floor" value={String(archivedRun.floorReached)} />
                  <StatCard label="Class" value={archivedRun.className} />
                </View>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Companion"
                    value={activeCompanionName ?? 'Unavailable in legacy archive'}
                  />
                  <DetailLine
                    label="Final HP"
                    value={
                      archivedRun.recap
                        ? `${archivedRun.recap.finalHero.currentHp}/${archivedRun.recap.finalHero.maxHp}`
                        : 'Unavailable in legacy archive'
                    }
                  />
                  <DetailLine label="Run ID" value={archivedRun.runId} />
                  <DetailLine
                    label="Result"
                    value={humanizeId(archivedRun.result)}
                  />
                  <DetailLine label="Archived" value={archivedAtLabel} />
                  <DetailLine
                    label="Loadout"
                    value={
                      archivedRun.recap
                        ? carriedItemNames.length > 0
                          ? carriedItemNames.join(', ')
                          : 'No carried contraband'
                        : 'Unavailable in legacy archive'
                    }
                  />
                </View>
                <Text style={styles.panelBody}>
                  {isAbandonedRun
                    ? archivedRun.recap
                      ? 'The abandon entry has already been written, and this recap is now being read back from persistence instead of the runtime store.'
                      : 'The abandon entry exists in run history, but this older record does not include the richer persisted recap payload yet.'
                    : isFailedRun
                    ? archivedRun.recap
                      ? 'The archive entry and failure stats have already been written, and this recap is now being read back from persistence instead of the runtime store.'
                      : 'The failure entry exists in run history, but this older record does not include the richer persisted recap payload yet.'
                    : archivedRun.recap
                      ? 'The win entry and profile stats have already been written, and this recap is now grounded in archived run data.'
                      : 'The victory entry exists in run history, but this older record does not include the richer persisted recap payload yet.'}
                </Text>
              </View>

              {archivedRun.recap ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>
                    {archivedRun.recap.outcome.title}
                  </Text>
                  <Text style={styles.panelBody}>
                    {archivedRun.recap.outcome.detail}
                  </Text>
                  <View style={styles.statGrid}>
                    <StatCard
                      label="Meta Earned"
                      value={`+${archivedRun.recap.stats.metaCurrencyEarned}`}
                    />
                    <StatCard
                      label="Rewards"
                      value={String(archivedRun.recap.stats.rewardsClaimed)}
                    />
                  </View>
                  <View style={styles.statGrid}>
                    <StatCard
                      label="Events"
                      value={String(archivedRun.recap.stats.eventsResolved)}
                    />
                    <StatCard
                      label="Battles"
                      value={String(archivedRun.recap.stats.battlesWon)}
                    />
                  </View>
                  <View style={styles.detailCard}>
                    <DetailLine
                      label="Nodes Cleared"
                      value={String(archivedRun.recap.stats.nodesResolved)}
                    />
                    <DetailLine
                      label="Damage Taken"
                      value={String(archivedRun.recap.stats.damageTaken)}
                    />
                    <DetailLine
                      label="Healing Received"
                      value={String(archivedRun.recap.stats.healingReceived)}
                    />
                    <DetailLine
                      label="Items Found"
                      value={
                        collectedItemNames.length > 0
                          ? collectedItemNames.join(', ')
                          : 'No new contraband found'
                      }
                    />
                  </View>
                  {bondGainLines.length > 0 ? (
                    <>
                      <Text style={styles.sectionLabel}>Bond Gains</Text>
                      <View style={styles.detailCard}>
                        {bondGainLines.map((bondGainLine) => (
                          <DetailLine
                            key={bondGainLine.id}
                            label={bondGainLine.label}
                            value={bondGainLine.value}
                          />
                        ))}
                      </View>
                    </>
                  ) : null}
                  {unlockedBondScenes.length > 0 ? (
                    <>
                      <Text style={styles.sectionLabel}>New Bond Scenes</Text>
                      <View style={styles.detailCard}>
                        {unlockedBondScenes.map((scene) => (
                          <DetailLine
                            key={scene.id}
                            label={scene.title}
                            value={`Unlocked for level ${scene.milestoneLevel}`}
                          />
                        ))}
                      </View>
                    </>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Next</Text>
                <Text style={styles.panelBody}>
                  This run is now safely archived. You can head back to title
                  or open the progression archive to review saved recaps and
                  lifetime totals.
                </Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Return to Title"
                    onPress={handleReturnToTitle}
                  />
                  <GameButton
                    label="Open Run Archive"
                    onPress={() => {
                      clearCurrentRunState();
                      router.replace('/progression' as Href);
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

function LoadingPanel({ label }: { label: string }) {
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
}: {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelBody}>{body}</Text>
      <View style={styles.actionGroup}>
        <GameButton
          label={primaryLabel}
          onPress={onPrimaryPress}
        />
      </View>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
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
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
    fontSize: 14,
    lineHeight: 20,
  },
  detailLabel: {
    color: colors.textSubtle,
    fontWeight: '700',
  },
  sectionLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  actionGroup: {
    gap: spacing.sm + 2,
  },
});
