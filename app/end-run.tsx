import { router, type Href, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getArchivedResultArtSource,
  getLoopSurfaceArtSource,
} from '@/src/assets/loop-art-sources';
import { playUiSfx } from '@/src/audio/ui-sfx';
import {
  getBiomeAmbientArtSource,
  getBossArchiveArtSource,
  getEndingAccentArtSources,
} from '@/src/assets/supplemental-art-sources';
import { GameButton } from '@/src/components/game-button';
import { useRunHelpStartsCollapsed } from '@/src/hooks/use-run-help-starts-collapsed';
import { LoopArtPanel } from '@/src/components/loop-art-panel';
import { getBondScenesUnlockedByBondGains } from '@/src/content/bond-scenes';
import { getCompanionDefinition } from '@/src/content/companions';
import {
  createClassRecapDirective,
  createTicketBrief,
} from '@/src/content/company-lore';
import { getItemDefinition } from '@/src/content/items';
import {
  loadLatestRunHistoryEntryAsync,
  loadRunHistoryEntryByRunIdAsync,
} from '@/src/save/runRepo';
import { useRunStore } from '@/src/state/runStore';
import { useUxTelemetryStore } from '@/src/state/uxTelemetryStore';
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

type EndRunLoadStatus = 'loading' | 'ready' | 'missing' | 'error';

function pickSingleParam(value: string | string[] | undefined): string | null {
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
  const beginNewRunSetup = useRunStore((state) => state.beginNewRunSetup);
  const recordRunItBack = useUxTelemetryStore((state) => state.recordRunItBack);
  const [archivedRun, setArchivedRun] = useState<RunHistoryEntry | null>(null);
  const [showFailureRead, setShowFailureRead] = useState(false);
  const [loadStatus, setLoadStatus] = useState<EndRunLoadStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const recapCueRunIdRef = useRef<string | null>(null);
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);
  const helpStartsCollapsed = useRunHelpStartsCollapsed(archivedRun?.floorReached ?? 1);
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

  useEffect(() => {
    if (
      loadStatus !== 'ready' ||
      !archivedRun ||
      archivedRun.result !== 'loss'
    ) {
      return;
    }

    if (recapCueRunIdRef.current === archivedRun.runId) {
      return;
    }

    recapCueRunIdRef.current = archivedRun.runId;
    void playUiSfx('recap-sting', settings);
  }, [archivedRun, loadStatus, settings]);

  useEffect(() => {
    setShowFailureRead(!helpStartsCollapsed);
  }, [helpStartsCollapsed, archivedRun?.runId]);

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
  const buildSummary = useMemo(() => {
    if (!archivedRun?.recap) {
      return null;
    }

    return [
      archivedRun.className,
      activeCompanionName ? `with ${activeCompanionName}` : null,
      carriedItemNames.length > 0 ? `carrying ${carriedItemNames.join(', ')}` : null,
    ]
      .filter(Boolean)
      .join(' ');
  }, [activeCompanionName, archivedRun, carriedItemNames]);
  const ticketBrief = useMemo(() => {
    if (!archivedRun) {
      return null;
    }

    return createTicketBrief({
      classId: archivedRun.classId,
      floorIndex: archivedRun.floorReached,
      runId: archivedRun.runId,
      currentNodeLabel: archivedRun.recap?.defeatSummary?.nodeLabel ?? null,
    });
  }, [archivedRun]);
  const endRunSurfaceArtSource = useMemo(
    () => getLoopSurfaceArtSource('end-run', settings),
    [settings]
  );
  const endRunAmbientArtSource = useMemo(
    () => getBiomeAmbientArtSource(archivedRun?.floorReached, settings),
    [archivedRun?.floorReached, settings]
  );
  const archivedResultArtSource = useMemo(
    () => getArchivedResultArtSource(archivedRun?.result ?? 'loss', settings),
    [archivedRun?.result, settings]
  );
  const bossArchiveArtSource = useMemo(
    () => getBossArchiveArtSource(archivedRun?.floorReached, settings),
    [archivedRun?.floorReached, settings]
  );
  const endingAccent = useMemo(
    () =>
      getEndingAccentArtSources(
        archivedRun?.result,
        archivedRun?.floorReached,
        settings
      ),
    [archivedRun?.floorReached, archivedRun?.result, settings]
  );
  const bossArchiveUpdate = useMemo(() => {
    const floorReached = archivedRun?.floorReached;

    if (!floorReached || floorReached < 4) {
      return null;
    }

    if (floorReached >= 10) {
      return {
        title: 'Board Archive Update',
        subtitle: 'Executive containment breach',
        body:
          archivedRun.result === 'win'
            ? 'The archive now closes with the board-level panel because this run forced the executive layer fully into the open.'
            : 'The archive now escalates this recap into the board layer, where the report stops pretending the disaster belonged to anyone lower in the org chart.',
      };
    }

    if (floorReached >= 7) {
      return {
        title: 'Throughput Archive Update',
        subtitle: 'Cross-functional morale escalation',
        body:
          archivedRun.result === 'win'
            ? 'This run pushed the archive into the throughput executive layer, so the recap now uses the matching executive record instead of another plain checkpoint.'
            : 'The archive now records the run inside the throughput executive layer, where alignment theater starts treating the incident like company myth.',
      };
    }

    return {
      title: 'Onboarding Archive Update',
      subtitle: 'Formal compliance escalation',
      body:
        archivedRun.result === 'win'
          ? 'The archive reached the onboarding and compliance layer, so the post-run record now gets the first boss archive panel instead of a plain text escalation note.'
          : 'The archive now tags this run as having breached the onboarding and compliance layer, where the incident stops being local and starts becoming policy.',
    };
  }, [archivedRun]);
  const endingAccentSummary = useMemo(() => {
    if (!archivedRun || !endingAccent) {
      return null;
    }

    if (archivedRun.result === 'win' && archivedRun.floorReached >= 10) {
      return 'The archive no longer treats this as a contained incident. The run breached the executive layer, forced the cover story open, and logged the company itself as the harm source.';
    }

    if (archivedRun.result === 'win') {
      return 'You closed the run before the tower closed around you. The blast radius stays narrower than a full exposure ending, but the archive now admits authority helped carry the wound.';
    }

    if (archivedRun.result === 'abandon') {
      return 'You got out alive, and the archive treats that survival as unfinished testimony. The truth is deferred instead of erased, which is still more honest than a clean company lie.';
    }

    if (archivedRun.floorReached >= 8) {
      return 'You climbed high enough for the confession to start forming, then lost the clean chain that would have finished it. The archive keeps the damage visible even though the story broke on the way out.';
    }

    return 'The run ended before the tower had to admit much, so the incident still wears a badge and a containment stamp. The leak remains real, even when the record tries to keep it local.';
  }, [archivedRun, endingAccent]);
  const restartReadBody = useMemo(() => {
    if (!archivedRun) {
      return 'The archive should explain the outcome before it asks for another run.';
    }

    const classDirective = createClassRecapDirective(
      archivedRun.classId,
      archivedRun.result
    );

    if (archivedRun.result === 'win') {
      return `${classDirective} Keep the part of the build that actually closed fights and do not assume the next climb will be as kind.`;
    }

    if (archivedRun.result === 'abandon') {
      return `${classDirective} Even a retreat should leave a clear note about why you bailed and what has to change before the next climb.`;
    }

    return (
      `${classDirective} ${
        archivedRun.recap?.defeatSummary?.recommendation ??
        'A loss should tell you what failed, explain any status effects in plain language, and point at the next experiment immediately.'
      }`
    );
  }, [archivedRun]);
  const restartReadTitle = useMemo(() => {
    if (!archivedRun) {
      return 'Archive Read';
    }

    if (archivedRun.result === 'win') {
      return 'Closure Note';
    }

    if (archivedRun.result === 'abandon') {
      return 'Reopen Conditions';
    }

    return 'Postmortem Directive';
  }, [archivedRun]);

  const handleReturnToTitle = () => {
    clearCurrentRunState();
    router.replace('/' as Href);
  };

  const handleRunItBack = () => {
    recordRunItBack();
    beginNewRunSetup();
    clearCurrentRunState();
    router.replace('/class-select' as Href);
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
            <Text style={styles.title}>
              {isFailedRun ? 'Read The Wreckage' : 'End Run'}
            </Text>
            <Text style={styles.subtitle}>
              {loadStatus === 'ready'
                ? isAbandonedRun
                  ? 'Even a retreat leaves a paper trail.'
                  : isFailedRun
                    ? 'Read the failure. Keep the lesson.'
                    : 'Victory is only useful if you know what made it work.'
                : 'The archive is opening your latest result.'}
            </Text>
            <Text style={styles.body}>
              {loadStatus === 'ready'
                ? 'This recap is pulled from the run archive, so the climb is gone but the lesson remains.'
                : 'The climb is already over. The archive is rebuilding the final report.'}
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
              primaryLabel="Employee Portal"
              onPrimaryPress={handleReturnToTitle}
            />
          ) : loadStatus === 'missing' || !archivedRun ? (
            <InfoPanel
              title="No Archived Run Found"
              body={
                requestedRunId
                  ? 'No archived recap matched this run ID.'
                  : 'There is no archived run recap available yet.'
              }
              primaryLabel="Employee Portal"
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
                  <DetailLine label="Result" value={humanizeId(archivedRun.result)} />
                  <DetailLine label="Archived" value={archivedAtLabel} />
                </View>
                {buildSummary ? (
                  <Text style={styles.panelBody}>Build snapshot: {buildSummary}.</Text>
                ) : null}
              </View>

              {ticketBrief ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Ticket Record</Text>
                  <Text style={styles.ticketTitle}>
                    {ticketBrief.ticketId} - {ticketBrief.subject}
                  </Text>
                  <View style={styles.detailCard}>
                    <DetailLine label="Filed by" value={ticketBrief.filedBy} />
                    <DetailLine
                      label="Escalation track"
                      value={ticketBrief.escalationTrack}
                    />
                    <DetailLine
                      label="Current owner"
                      value={ticketBrief.currentOwner}
                    />
                  </View>
                  <Text style={styles.panelBody}>{ticketBrief.summary}</Text>
                </View>
              ) : null}

              {bossArchiveArtSource && bossArchiveUpdate ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>{bossArchiveUpdate.title}</Text>
                  <Text style={styles.panelBody}>{bossArchiveUpdate.body}</Text>
                  <View style={styles.bossArchiveCard}>
                    {endRunAmbientArtSource ? (
                      <Image
                        source={endRunAmbientArtSource}
                        style={styles.bossArchiveAmbientArt}
                        resizeMode="cover"
                      />
                    ) : null}
                    <Image
                      source={bossArchiveArtSource}
                      style={styles.bossArchiveArt}
                      resizeMode="cover"
                    />
                    <View style={styles.bossArchiveCopy}>
                      <Text style={styles.bossArchiveSubtitle}>
                        {bossArchiveUpdate.subtitle}
                      </Text>
                      <Text style={styles.bossArchiveMeta}>
                        Floor {archivedRun.floorReached} record layer
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {endingAccent && endingAccentSummary ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>{endingAccent.archiveHeader}</Text>
                  <View style={styles.endingAccentCard}>
                    {endRunAmbientArtSource ? (
                      <Image
                        source={endRunAmbientArtSource}
                        style={styles.endingAccentAmbientArt}
                        resizeMode="cover"
                      />
                    ) : null}
                    {endingAccent.headerSource ? (
                      <Image
                        source={endingAccent.headerSource}
                        style={styles.endingHeaderArt}
                        resizeMode="contain"
                      />
                    ) : null}
                    <View style={styles.endingRecapPanelWrap}>
                      {endingAccent.recapPanelSource ? (
                        <View style={styles.endingRecapArtFrame}>
                          <Image
                            source={endingAccent.recapPanelSource}
                            style={styles.endingRecapPanelArt}
                            resizeMode="cover"
                          />
                        </View>
                      ) : null}
                      <View style={styles.endingRecapCopy}>
                        <Text style={styles.endingAccentEyebrow}>
                          {endingAccent.title}
                        </Text>
                        <Text style={styles.endingAccentTitle}>
                          {endingAccent.recapTitle}
                        </Text>
                        <Text style={styles.endingAccentBody}>
                          {endingAccentSummary}
                        </Text>
                        <Text style={styles.endingAccentMeta}>
                          Floor {archivedRun.floorReached} record
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ) : null}

              <LoopArtPanel
                title={restartReadTitle}
                body={restartReadBody}
                ambientSource={endRunAmbientArtSource}
                source={archivedResultArtSource}
                backgroundSource={endRunSurfaceArtSource}
                frameVariant="portrait"
              />

              {isFailedRun && archivedRun.recap?.defeatSummary ? (
                <View style={styles.panel}>
                  <Pressable
                    style={styles.toggleRow}
                    onPress={() => {
                      setShowFailureRead((current) => !current);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Why the run ended"
                    accessibilityHint={
                      showFailureRead
                        ? 'Double tap to collapse the defeat breakdown.'
                        : 'Double tap to expand the defeat breakdown.'
                    }
                    accessibilityState={{ expanded: showFailureRead }}
                  >
                    <Text style={styles.panelTitle}>Why The Run Ended</Text>
                    <Text style={styles.toggleLabel}>
                      {showFailureRead ? 'Hide' : 'Show'}
                    </Text>
                  </Pressable>
                  {showFailureRead ? (
                    <>
                      <View style={styles.detailCard}>
                        <DetailLine
                          label="Encounter"
                          value={archivedRun.recap.defeatSummary.nodeLabel}
                        />
                        <DetailLine
                          label="Enemy"
                          value={archivedRun.recap.defeatSummary.enemyName}
                        />
                        <DetailLine
                          label="Intent"
                          value={archivedRun.recap.defeatSummary.enemyIntent}
                        />
                      </View>
                      <Text style={styles.summaryLead}>Final exchange</Text>
                      <Text style={styles.panelBody}>{archivedRun.recap.defeatSummary.finalBlow}</Text>
                      {archivedRun.recap.defeatSummary.heroStatusLabels.length > 0 ? (
                        <>
                          <Text style={styles.summaryLead}>On you</Text>
                          <Text style={styles.panelBody}>
                            {archivedRun.recap.defeatSummary.heroStatusLabels.join(', ')}
                          </Text>
                          {archivedRun.recap.defeatSummary.heroStatusNotes?.length ? (
                            <Text style={styles.panelBody}>
                              Meaning: {archivedRun.recap.defeatSummary.heroStatusNotes.join(' ')}
                            </Text>
                          ) : null}
                        </>
                      ) : null}
                      {archivedRun.recap.defeatSummary.enemyStatusLabels.length > 0 ? (
                        <>
                          <Text style={styles.summaryLead}>On them</Text>
                          <Text style={styles.panelBody}>
                            {archivedRun.recap.defeatSummary.enemyStatusLabels.join(', ')}
                          </Text>
                          {archivedRun.recap.defeatSummary.enemyStatusNotes?.length ? (
                            <Text style={styles.panelBody}>
                              Meaning: {archivedRun.recap.defeatSummary.enemyStatusNotes.join(' ')}
                            </Text>
                          ) : null}
                        </>
                      ) : null}
                      <Text style={styles.summaryLead}>Next run idea</Text>
                      <Text style={styles.panelBody}>
                        {archivedRun.recap.defeatSummary.recommendation}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.panelBody}>
                      The finishing hit, status read, and next-run lesson stay tucked here once you know the recap flow.
                    </Text>
                  )}
                </View>
              ) : null}

              {archivedRun.recap ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>{archivedRun.recap.outcome.title}</Text>
                  <Text style={styles.panelBody}>{archivedRun.recap.outcome.detail}</Text>
                  <View style={styles.statGrid}>
                    <StatCard
                      label="Chits Earned"
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
                <Text style={styles.panelTitle}>Next Run</Text>
                <Text style={styles.panelBody}>
                  The run is safely archived. If the postmortem gave you a clear next experiment, start another dive while the lesson is still fresh.
                </Text>
                <View style={styles.actionGroup}>
                  <GameButton label="Start Another Dive" onPress={handleRunItBack} />
                  <GameButton
                    label="Employee Portal"
                    onPress={handleReturnToTitle}
                    variant="secondary"
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
}: {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
}) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelBody}>{body}</Text>
      <GameButton label={primaryLabel} onPress={onPrimaryPress} />
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
      backgroundColor: colors.background,
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
    ticketTitle: {
      color: colors.accent,
      fontSize: scaleFontSize(18, settings),
      fontWeight: '900',
      lineHeight: scaleLineHeight(24, settings),
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
    summaryLead: {
      color: colors.accent,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(18, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    sectionLabel: {
      color: colors.accent,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '800',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
      textTransform: 'uppercase',
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 48,
    },
    toggleLabel: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    actionGroup: {
      gap: spacing.sm + 2,
    },
    bossArchiveCard: {
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      gap: spacing.sm,
      paddingBottom: spacing.sm + 2,
    },
    bossArchiveAmbientArt: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.18,
      width: undefined,
      height: undefined,
    },
    bossArchiveArt: {
      width: '100%',
      height: 150,
      alignSelf: 'center',
    },
    bossArchiveCopy: {
      gap: spacing.xs,
      paddingHorizontal: spacing.sm + 2,
    },
    bossArchiveSubtitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(15, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
    },
    bossArchiveMeta: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(17, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    endingAccentCard: {
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      gap: spacing.sm,
      paddingBottom: spacing.sm + 2,
    },
    endingAccentAmbientArt: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.18,
      width: undefined,
      height: undefined,
    },
    endingHeaderArt: {
      width: '100%',
      height: 96,
      marginTop: spacing.xs,
      alignSelf: 'center',
    },
    endingRecapPanelWrap: {
      gap: spacing.sm,
      paddingHorizontal: spacing.sm + 2,
      paddingBottom: spacing.sm + 2,
    },
    endingRecapArtFrame: {
      height: 118,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceRaised,
    },
    endingRecapPanelArt: {
      width: '100%',
      height: '100%',
      opacity: 0.78,
    },
    endingRecapCopy: {
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm + 2,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 14,
    },
    endingAccentEyebrow: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(17, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    endingAccentTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(17, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    endingAccentBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    endingAccentMeta: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(17, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
  });
}



