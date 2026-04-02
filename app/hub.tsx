import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameButton } from '@/src/components/game-button';
import { classDefinitions, getClassDefinition } from '@/src/content/classes';
import {
  companionDefinitions,
  getCompanionDefinition,
} from '@/src/content/companions';
import { eventDefinitions } from '@/src/content/events';
import { getItemDefinition, itemDefinitions } from '@/src/content/items';
import {
  buildMetaUpgradeCatalog,
  type MetaUpgradeOffer,
} from '@/src/engine/meta/meta-upgrade-engine';
import {
  buildRequisitionCatalog,
  type RequisitionOffer,
} from '@/src/engine/meta/requisition-engine';
import {
  getCurrentRunNode,
  getRunResumeTarget,
} from '@/src/engine/run/progress-run';
import { loadLatestRunHistoryEntryAsync } from '@/src/save/runRepo';
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

type HubLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

type HubShortcut = {
  href: Href;
  label: string;
  title: string;
  body: string;
};

const hubShortcuts: HubShortcut[] = [
  {
    href: '/progression',
    label: 'Archive',
    title: 'Progression',
    body: 'Review archived runs, lifetime stats, and unlock coverage.',
  },
  {
    href: '/bonds',
    label: 'Roster',
    title: 'Bonds',
    body: 'Check companion bond levels, current dive pairing, and milestones.',
  },
  {
    href: '/codex',
    label: 'Reference',
    title: 'Codex',
    body: 'Browse live classes, items, events, enemies, and statuses.',
  },
  {
    href: '/settings',
    label: 'Config',
    title: 'Settings',
    body: 'Adjust accessibility, contrast, text scale, and comfort settings stored in the profile.',
  },
];

async function loadHubData(input: {
  ensureBootstrapLoaded: () => Promise<void>;
}) {
  await input.ensureBootstrapLoaded();

  const latestArchive = await loadLatestRunHistoryEntryAsync();

  return latestArchive;
}

export default function HubScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const purchaseClassUnlock = useProfileStore((state) => state.purchaseClassUnlock);
  const purchaseCompanionUnlock = useProfileStore(
    (state) => state.purchaseCompanionUnlock
  );
  const purchaseMetaUpgrade = useProfileStore(
    (state) => state.purchaseMetaUpgrade
  );
  const bootstrapProfile = useGameStore((state) => state.profile);
  const bootstrapStatus = useGameStore((state) => state.bootstrapStatus);
  const bootstrapError = useGameStore((state) => state.error);
  const activeRun = useGameStore((state) => state.activeRun);
  const recoveredFromBackup = useGameStore((state) => state.recoveredFromBackup);
  const initializeApp = useGameStore((state) => state.initializeApp);
  const refreshBootstrap = useGameStore((state) => state.refreshBootstrap);
  const [latestArchive, setLatestArchive] = useState<RunHistoryEntry | null>(null);
  const [loadStatus, setLoadStatus] = useState<HubLoadStatus>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionMessage, setTransactionMessage] = useState<string | null>(null);
  const [lastTransactionKind, setLastTransactionKind] = useState<
    'requisition' | 'upgrade' | null
  >(null);
  const [activeRequisitionId, setActiveRequisitionId] = useState<string | null>(null);
  const [activeUpgradeId, setActiveUpgradeId] = useState<string | null>(null);
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
      setLoadError(
        bootstrapError ?? 'The breakroom hub could not be reopened.'
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

        const nextLatestArchive = await loadHubData({
          ensureBootstrapLoaded: async () => {},
        });

        if (isCancelled) {
          return;
        }

        setLatestArchive(nextLatestArchive);
        setLoadStatus('ready');
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setLoadStatus('error');
        setLoadError(
          error instanceof Error && error.message
            ? error.message
            : 'The breakroom hub could not be reopened.'
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
      const nextLatestArchive = await loadLatestRunHistoryEntryAsync();

      setLatestArchive(nextLatestArchive);
      setLoadStatus('ready');
    } catch (error) {
      setLoadStatus('error');
      setLoadError(
        error instanceof Error && error.message
          ? error.message
          : 'The breakroom hub could not be refreshed.'
      );
    }
  };

  const resumeTarget = useMemo(
    () => (activeRun ? getRunResumeTarget(activeRun) : null),
    [activeRun]
  );
  const currentNode = useMemo(
    () => (activeRun ? getCurrentRunNode(activeRun) : null),
    [activeRun]
  );
  const activeClassName = useMemo(
    () =>
      activeRun
        ? getClassDefinition(activeRun.heroClassId)?.name ?? activeRun.heroClassId
        : null,
    [activeRun]
  );
  const activeCompanionName = useMemo(
    () =>
      activeRun
        ? getCompanionDefinition(activeRun.activeCompanionId)?.name ??
          activeRun.activeCompanionId
        : null,
    [activeRun]
  );
  const loadoutLabel = useMemo(() => {
    if (!activeRun) {
      return 'No active contraband loadout.';
    }

    if (activeRun.inventoryItemIds.length === 0) {
      return 'No carried contraband yet.';
    }

    return activeRun.inventoryItemIds
      .map((itemId) => getItemDefinition(itemId)?.name ?? itemId)
      .join(', ');
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
  const requisitionCatalog = useMemo(
    () => (resolvedProfile ? buildRequisitionCatalog(resolvedProfile) : null),
    [resolvedProfile]
  );
  const metaUpgradeCatalog = useMemo(
    () => (resolvedProfile ? buildMetaUpgradeCatalog(resolvedProfile) : null),
    [resolvedProfile]
  );
  const lockedClassOffers =
    requisitionCatalog?.classes
      .filter((offer) => !offer.owned)
      .sort((left, right) => left.cost - right.cost) ?? [];
  const lockedCompanionOffers =
    requisitionCatalog?.companions
      .filter((offer) => !offer.owned)
      .sort((left, right) => left.cost - right.cost) ?? [];
  const availableUpgradeOffers =
    metaUpgradeCatalog
      ?.filter((offer) => !offer.exhausted)
      .sort(
        (left, right) =>
          (left.nextCost ?? Number.MAX_SAFE_INTEGER) -
          (right.nextCost ?? Number.MAX_SAFE_INTEGER)
      ) ?? [];
  const nextClassOffer = lockedClassOffers[0] ?? null;
  const nextCompanionOffer = lockedCompanionOffers[0] ?? null;
  const nextUpgradeOffer = availableUpgradeOffers[0] ?? null;
  const maxedUpgradeCount =
    metaUpgradeCatalog?.filter((offer) => offer.exhausted).length ?? 0;

  const totalRuns = resolvedProfile?.stats.totalRuns ?? 0;
  const totalWins = resolvedProfile?.stats.totalWins ?? 0;
  const totalDeaths = resolvedProfile?.stats.totalDeaths ?? 0;
  const totalAbandons = Math.max(0, totalRuns - totalWins - totalDeaths);
  const winRateLabel =
    totalRuns > 0 ? `${Math.round((totalWins / totalRuns) * 100)}%` : '0%';
  const latestArchiveLabel = latestArchive
    ? formatSaveTimestampLabel(latestArchive.updatedAt)
    : 'No archive yet';

  const handlePurchase = async (offer: RequisitionOffer) => {
    setActiveRequisitionId(`${offer.kind}:${offer.id}`);
    setLastTransactionKind('requisition');
    setTransactionError(null);
    setTransactionMessage(null);

    try {
      if (offer.kind === 'class') {
        await purchaseClassUnlock(offer.id);
      } else {
        await purchaseCompanionUnlock(offer.id);
      }

      await refreshBootstrap();
      setTransactionMessage(
        `${offer.title} unlocked for ${offer.cost} chit${offer.cost === 1 ? '' : 's'}.`
      );
    } catch (error) {
      setTransactionError(
        error instanceof Error && error.message
          ? error.message
          : 'The requisition request bounced back from procurement.'
      );
    } finally {
      setActiveRequisitionId(null);
    }
  };

  const handleUpgradePurchase = async (offer: MetaUpgradeOffer) => {
    setActiveUpgradeId(offer.id);
    setLastTransactionKind('upgrade');
    setTransactionError(null);
    setTransactionMessage(null);

    try {
      await purchaseMetaUpgrade(offer.id);
      await refreshBootstrap();
      setTransactionMessage(
        `${offer.title} improved to rank ${offer.currentLevel + 1} for ${
          offer.nextCost ?? 0
        } chit${offer.nextCost === 1 ? '' : 's'}.`
      );
    } catch (error) {
      setTransactionError(
        error instanceof Error && error.message
          ? error.message
          : 'The operations upgrade request stalled out in procurement.'
      );
    } finally {
      setActiveUpgradeId(null);
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
            <Text style={styles.title}>Breakroom Hub</Text>
            <Text style={styles.subtitle}>
              The between-runs operations space is now a real route.
            </Text>
            <Text style={styles.body}>
              Use this screen to check the live dive, archive pulse, roster health,
              and the rest of the meta routes without bouncing back through the
              title shell.
            </Text>
          </View>

          {loadStatus === 'idle' || loadStatus === 'loading' ? (
            <LoadingPanel label="Restocking the breakroom whiteboard..." />
          ) : loadStatus === 'error' ? (
            <InfoPanel
              title="Hub Error"
              body={loadError ?? 'The breakroom hub could not be reconstructed.'}
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
              body="The profile did not finish loading, so the breakroom dashboard is still blank."
              primaryLabel="Reload Hub"
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
                <Text style={styles.panelTitle}>Operations Snapshot</Text>
                <Text style={styles.panelBody}>
                  This is the current profile-wide picture: economy, run outcomes,
                  unlock coverage, and which companion has become the most reliable
                  bad influence so far.
                </Text>
                <View style={styles.statGrid}>
                  <StatCard
                    label="Chits"
                    value={String(resolvedProfile.metaCurrency)}
                  />
                  <StatCard label="Win Rate" value={winRateLabel} />
                </View>
                <View style={styles.statGrid}>
                  <StatCard label="Runs" value={String(totalRuns)} />
                  <StatCard
                    label="Bosses"
                    value={String(resolvedProfile.stats.totalBossesKilled)}
                  />
                </View>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Classes"
                    value={`${resolvedProfile.unlockedClassIds.length}/${classDefinitions.length} unlocked`}
                  />
                  <DetailLine
                    label="Companions"
                    value={`${resolvedProfile.unlockedCompanionIds.length}/${companionDefinitions.length} unlocked`}
                  />
                  <DetailLine
                    label="Contraband"
                    value={`${resolvedProfile.unlockedItemIds.length}/${itemDefinitions.length} cataloged`}
                  />
                  <DetailLine
                    label="Events Seen"
                    value={`${resolvedProfile.unlockedEventIds.length}/${eventDefinitions.length} archived`}
                  />
                  <DetailLine
                    label="Abandons"
                    value={String(totalAbandons)}
                  />
                  <DetailLine
                    label="Bond Lead"
                    value={
                      highestBondCompanion
                        ? `${highestBondCompanion.name} - level ${
                            resolvedProfile.bondLevels[highestBondCompanion.id] ?? 0
                          }`
                        : 'No companion roster loaded'
                    }
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Active Dive Desk</Text>
                <Text style={styles.panelBody}>
                  Resume routing is live now, so the hub can hand you back to the
                  correct live handoff for the run, including floor-start
                  deployment screens when a reserve rotation is available.
                </Text>
                {activeRun && resumeTarget ? (
                  <>
                    <View style={styles.detailCard}>
                      <DetailLine label="Route" value={resumeTarget.summaryLabel} />
                      <DetailLine
                        label="Class"
                        value={activeClassName ?? activeRun.heroClassId}
                      />
                      <DetailLine
                        label="Companion"
                        value={activeCompanionName ?? activeRun.activeCompanionId}
                      />
                      <DetailLine
                        label="Current Floor"
                        value={`Floor ${activeRun.floorIndex}`}
                      />
                      <DetailLine
                        label="Current Stop"
                        value={currentNode?.label ?? 'Run Map'}
                      />
                      <DetailLine
                        label="Hero HP"
                        value={`${activeRun.hero.currentHp}/${activeRun.hero.maxHp}`}
                      />
                      <DetailLine
                        label="Run Items"
                        value={String(activeRun.inventoryItemIds.length)}
                      />
                      <DetailLine label="Loadout" value={loadoutLabel} />
                      {recoveredFromBackup ? (
                        <DetailLine
                          label="Recovery"
                          value="Recovered from your latest emergency save."
                        />
                      ) : null}
                    </View>
                    <View style={styles.actionGroup}>
                      <GameButton
                        label={`Resume ${resumeTarget.buttonLabel}`}
                        onPress={() => {
                          router.push(resumeTarget.route as Href);
                        }}
                      />
                      <GameButton
                        label="Open Run Map"
                        onPress={() => {
                          router.push('/run-map' as Href);
                        }}
                        variant="secondary"
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.detailCard}>
                      <DetailLine label="Status" value="No active dive loaded" />
                      <DetailLine
                        label="Archive Pulse"
                        value={
                          latestArchive
                            ? `${latestArchive.className} ${humanizeId(
                                latestArchive.result
                              ).toLowerCase()} ${latestArchiveLabel}`
                            : 'No archived incidents yet'
                        }
                      />
                    </View>
                    <View style={styles.actionGroup}>
                      <GameButton
                        label="Return to Title"
                        onPress={() => {
                          router.push('/' as Href);
                        }}
                      />
                      <GameButton
                        label="Open Archive"
                        onPress={() => {
                          router.push('/progression' as Href);
                        }}
                        variant="secondary"
                      />
                    </View>
                  </>
                )}
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Operations Upgrades</Text>
                <Text style={styles.panelBody}>
                  Requisitions widen the roster. These permanent operations upgrades
                  deepen every future run with better survivability, richer payouts,
                  and cleaner recovery between disasters.
                </Text>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Available Chits"
                    value={String(resolvedProfile.metaCurrency)}
                  />
                  <DetailLine
                    label="Next Upgrade"
                    value={
                      nextUpgradeOffer && nextUpgradeOffer.nextCost != null
                        ? `${nextUpgradeOffer.title} - ${nextUpgradeOffer.nextCost} chits`
                        : 'All operations upgrades maxed'
                    }
                  />
                  <DetailLine
                    label="Maxed Tracks"
                    value={`${maxedUpgradeCount}/${
                      metaUpgradeCatalog?.length ?? 0
                    } complete`}
                  />
                </View>
                {lastTransactionKind === 'upgrade' && transactionMessage ? (
                  <Text style={styles.successText}>{transactionMessage}</Text>
                ) : null}
                {lastTransactionKind === 'upgrade' && transactionError ? (
                  <Text style={styles.errorText}>{transactionError}</Text>
                ) : null}
                {metaUpgradeCatalog?.length ? (
                  <View style={styles.requisitionList}>
                    {metaUpgradeCatalog.map((offer) => (
                      <MetaUpgradeCard
                        key={offer.id}
                        offer={offer}
                        activeUpgradeId={activeUpgradeId}
                        onPurchase={handleUpgradePurchase}
                      />
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyState}>
                    Operations upgrades could not be loaded for this profile.
                  </Text>
                )}
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Requisitions Board</Text>
                <Text style={styles.panelBody}>
                  Meta currency now buys permanent roster growth. Unlocks apply
                  straight to the profile, so new classes and companions show up
                  in the next run setup immediately.
                </Text>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Available Chits"
                    value={String(resolvedProfile.metaCurrency)}
                  />
                  <DetailLine
                    label="Next Class"
                    value={
                      nextClassOffer
                        ? `${nextClassOffer.title} - ${nextClassOffer.cost} chits`
                        : 'All class requisitions filled'
                    }
                  />
                  <DetailLine
                    label="Next Companion"
                    value={
                      nextCompanionOffer
                        ? `${nextCompanionOffer.title} - ${nextCompanionOffer.cost} chits`
                        : 'All companion requisitions filled'
                    }
                  />
                </View>
                {lastTransactionKind === 'requisition' && transactionMessage ? (
                  <Text style={styles.successText}>{transactionMessage}</Text>
                ) : null}
                {lastTransactionKind === 'requisition' && transactionError ? (
                  <Text style={styles.errorText}>{transactionError}</Text>
                ) : null}
                {lockedClassOffers.length === 0 && lockedCompanionOffers.length === 0 ? (
                  <View style={styles.detailCard}>
                    <DetailLine
                      label="Procurement"
                      value="Every currently authored class and companion is already unlocked on this profile."
                    />
                  </View>
                ) : (
                  <View style={styles.requisitionSections}>
                    <View style={styles.requisitionSection}>
                      <Text style={styles.subsectionTitle}>Class Licenses</Text>
                      {lockedClassOffers.length > 0 ? (
                        <View style={styles.requisitionList}>
                          {lockedClassOffers.map((offer) => (
                            <RequisitionCard
                              key={`class-${offer.id}`}
                              offer={offer}
                              activeRequisitionId={activeRequisitionId}
                              onPurchase={handlePurchase}
                            />
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.emptyState}>
                          All currently authored classes are already unlocked.
                        </Text>
                      )}
                    </View>
                    <View style={styles.requisitionSection}>
                      <Text style={styles.subsectionTitle}>Companion Contracts</Text>
                      {lockedCompanionOffers.length > 0 ? (
                        <View style={styles.requisitionList}>
                          {lockedCompanionOffers.map((offer) => (
                            <RequisitionCard
                              key={`companion-${offer.id}`}
                              offer={offer}
                              activeRequisitionId={activeRequisitionId}
                              onPurchase={handlePurchase}
                            />
                          ))}
                        </View>
                      ) : (
                        <Text style={styles.emptyState}>
                          All currently authored companions are already unlocked.
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Latest Incident Report</Text>
                <Text style={styles.panelBody}>
                  The newest archived run is surfaced directly here, so the hub can
                  feel like an actual operations space instead of only a route menu.
                </Text>
                {latestArchive ? (
                  <View style={styles.archiveCard}>
                    <View style={styles.archiveHeader}>
                      <View style={styles.archiveHeading}>
                        <Text style={styles.archiveTitle}>
                          {latestArchive.className}
                        </Text>
                        <Text style={styles.archiveMeta}>
                          Floor {latestArchive.floorReached} - archived{' '}
                          {latestArchiveLabel}
                        </Text>
                      </View>
                      <ResultBadge result={latestArchive.result} />
                    </View>
                    <View style={styles.detailCard}>
                      <DetailLine
                        label="Companion"
                        value={
                          latestArchive.recap
                            ? getCompanionDefinition(
                                latestArchive.recap.activeCompanionId
                              )?.name ?? latestArchive.recap.activeCompanionId
                            : 'Unavailable in legacy archive'
                        }
                      />
                      <DetailLine
                        label="Final HP"
                        value={
                          latestArchive.recap
                            ? `${latestArchive.recap.finalHero.currentHp}/${latestArchive.recap.finalHero.maxHp}`
                            : 'Unavailable in legacy archive'
                        }
                      />
                      <DetailLine
                        label="Recovered Items"
                        value={formatArchiveItems(latestArchive)}
                      />
                    </View>
                    {latestArchive.recap ? (
                      <View style={styles.archiveStats}>
                        <ArchiveStat
                          label={`Meta +${latestArchive.recap.stats.metaCurrencyEarned}`}
                        />
                        <ArchiveStat
                          label={`Rewards ${latestArchive.recap.stats.rewardsClaimed}`}
                        />
                        <ArchiveStat
                          label={`Events ${latestArchive.recap.stats.eventsResolved}`}
                        />
                        <ArchiveStat
                          label={`Battles ${latestArchive.recap.stats.battlesWon}`}
                        />
                      </View>
                    ) : null}
                    <Text style={styles.archiveBody}>
                      {latestArchive.recap
                        ? latestArchive.recap.outcome.detail
                        : 'This older archive row still opens, but it predates the richer recap payload.'}
                    </Text>
                    <View style={styles.actionGroup}>
                      <GameButton
                        label="Open Recap"
                        onPress={() => {
                          router.push(
                            `/end-run?runId=${encodeURIComponent(
                              latestArchive.runId
                            )}` as Href
                          );
                        }}
                      />
                      <GameButton
                        label="Open Archive"
                        onPress={() => {
                          router.push('/progression' as Href);
                        }}
                        variant="secondary"
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.detailCard}>
                    <DetailLine
                      label="Archive"
                      value="No completed or abandoned runs have been archived yet."
                    />
                    <DetailLine
                      label="Next Trigger"
                      value="Finish, lose, or abandon a dive to populate this feed."
                    />
                  </View>
                )}
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Departments</Text>
                <Text style={styles.panelBody}>
                  The other meta routes are now real screens too. These shortcuts
                  turn the hub into the connective tissue between archive review,
                  roster management, reference browsing, and settings.
                </Text>
                <View style={styles.shortcutList}>
                  {hubShortcuts.map((shortcut) => (
                    <Pressable
                      key={String(shortcut.href)}
                      style={styles.shortcutCard}
                      onPress={() => {
                        router.push(shortcut.href);
                      }}
                    >
                      <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
                      <Text style={styles.shortcutTitle}>{shortcut.title}</Text>
                      <Text style={styles.shortcutBody}>{shortcut.body}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Actions</Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Refresh Hub"
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

function formatArchiveItems(entry: RunHistoryEntry) {
  if (!entry.recap) {
    return 'Unavailable in legacy archive';
  }

  if (entry.recap.stats.collectedItemIds.length === 0) {
    return 'No new contraband found';
  }

  return entry.recap.stats.collectedItemIds
    .map((itemId) => getItemDefinition(itemId)?.name ?? itemId)
    .join(', ');
}

function RequisitionCard({
  offer,
  activeRequisitionId,
  onPurchase,
}: {
  offer: RequisitionOffer;
  activeRequisitionId: string | null;
  onPurchase: (offer: RequisitionOffer) => Promise<void>;
}) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);
  const requisitionKey = `${offer.kind}:${offer.id}`;
  const isPending = activeRequisitionId === requisitionKey;
  const buttonLabel = isPending
    ? 'Processing...'
    : offer.affordable
      ? `Unlock for ${offer.cost}`
      : `Need ${offer.shortage} More`;
  const statusLabel = offer.affordable
    ? 'Ready for procurement'
    : `Short ${offer.shortage} chit${offer.shortage === 1 ? '' : 's'}`;

  return (
    <View
      style={[
        styles.requisitionCard,
        offer.affordable ? styles.requisitionCardAffordable : null,
      ]}
    >
      <View style={styles.requisitionHeader}>
        <View style={styles.requisitionHeading}>
          <Text style={styles.requisitionTitle}>{offer.title}</Text>
          <Text style={styles.requisitionSubtitle}>{offer.subtitle}</Text>
        </View>
        <View
          style={[
            styles.costBadge,
            offer.affordable ? styles.costBadgeAffordable : null,
          ]}
        >
          <Text
            style={[
              styles.costBadgeText,
              offer.affordable ? styles.costBadgeTextAffordable : null,
            ]}
          >
            {offer.cost} chits
          </Text>
        </View>
      </View>
      <Text style={styles.requisitionBody}>{offer.description}</Text>
      <Text style={styles.requisitionHint}>{statusLabel}</Text>
      <GameButton
        label={buttonLabel}
        onPress={() => onPurchase(offer)}
        disabled={!offer.affordable || isPending}
      />
    </View>
  );
}

function MetaUpgradeCard({
  offer,
  activeUpgradeId,
  onPurchase,
}: {
  offer: MetaUpgradeOffer;
  activeUpgradeId: string | null;
  onPurchase: (offer: MetaUpgradeOffer) => Promise<void>;
}) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);
  const isPending = activeUpgradeId === offer.id;
  const buttonLabel = offer.exhausted
    ? 'Maxed'
    : isPending
      ? 'Processing...'
      : offer.affordable
        ? `Upgrade for ${offer.nextCost}`
        : `Need ${offer.shortage} More`;
  const statusLabel = offer.exhausted
    ? 'Fully upgraded'
    : offer.affordable
      ? 'Ready for approval'
      : `Short ${offer.shortage} chit${offer.shortage === 1 ? '' : 's'}`;

  return (
    <View
      style={[
        styles.requisitionCard,
        offer.affordable || offer.exhausted ? styles.requisitionCardAffordable : null,
      ]}
    >
      <View style={styles.requisitionHeader}>
        <View style={styles.requisitionHeading}>
          <Text style={styles.requisitionTitle}>{offer.title}</Text>
          <Text style={styles.requisitionSubtitle}>{offer.subtitle}</Text>
        </View>
        <View
          style={[
            styles.costBadge,
            offer.affordable || offer.exhausted ? styles.costBadgeAffordable : null,
          ]}
        >
          <Text
            style={[
              styles.costBadgeText,
              offer.affordable || offer.exhausted
                ? styles.costBadgeTextAffordable
                : null,
            ]}
          >
            rank {offer.currentLevel}/{offer.maxLevel}
          </Text>
        </View>
      </View>
      <Text style={styles.requisitionBody}>{offer.description}</Text>
      <Text style={styles.requisitionHint}>{offer.currentEffectLabel}</Text>
      {offer.nextEffectLabel ? (
        <Text style={styles.requisitionHint}>{offer.nextEffectLabel}</Text>
      ) : null}
      <Text style={styles.requisitionHint}>{statusLabel}</Text>
      <GameButton
        label={buttonLabel}
        onPress={() => onPurchase(offer)}
        disabled={!offer.affordable || isPending || offer.exhausted}
      />
    </View>
  );
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

function ArchiveStat({ label }: { label: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return <Text style={styles.archiveStat}>{label}</Text>;
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
  successText: {
    color: colors.accent,
    fontSize: scaleFontSize(13, settings),
    fontWeight: '700',
    lineHeight: scaleLineHeight(19, settings),
  },
  errorText: {
    color: colors.error,
    fontSize: scaleFontSize(13, settings),
    fontWeight: '700',
    lineHeight: scaleLineHeight(19, settings),
  },
  requisitionSections: {
    gap: spacing.md,
  },
  requisitionSection: {
    gap: spacing.sm + 2,
  },
  subsectionTitle: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(15, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(20, settings),
  },
  requisitionList: {
    gap: spacing.sm + 2,
  },
  requisitionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: spacing.sm,
  },
  requisitionCardAffordable: {
    borderColor: colors.accent,
  },
  requisitionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  requisitionHeading: {
    flex: 1,
    gap: spacing.xs,
  },
  requisitionTitle: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(17, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(21, settings),
  },
  requisitionSubtitle: {
    color: colors.accent,
    fontSize: scaleFontSize(13, settings),
    fontWeight: '700',
    lineHeight: scaleLineHeight(18, settings),
  },
  requisitionBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  requisitionHint: {
    color: colors.textSubtle,
    fontSize: scaleFontSize(12, settings),
    fontWeight: '700',
    lineHeight: scaleLineHeight(18, settings),
  },
  costBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
  },
  costBadgeAffordable: {
    borderColor: colors.accent,
  },
  costBadgeText: {
    color: colors.textMuted,
    fontSize: scaleFontSize(11, settings),
    fontWeight: '800',
    letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    textTransform: 'uppercase',
  },
  costBadgeTextAffordable: {
    color: colors.accent,
  },
  emptyState: {
    color: colors.textSubtle,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
  },
  archiveCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: spacing.sm + 2,
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
  shortcutList: {
    gap: spacing.sm + 2,
  },
  shortcutCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: spacing.xs + 2,
  },
  shortcutLabel: {
    color: colors.accent,
    fontSize: scaleFontSize(11, settings),
    fontWeight: '800',
    letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    textTransform: 'uppercase',
  },
  shortcutTitle: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(17, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(21, settings),
  },
  shortcutBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  actionGroup: {
    gap: spacing.sm + 2,
  },
  });
}
