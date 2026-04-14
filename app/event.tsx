import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getEventArtSource,
  getLoopSurfaceArtSource,
} from '@/src/assets/loop-art-sources';
import { trackAnalyticsEvent } from '@/src/analytics/client';
import { playUiSfx } from '@/src/audio/ui-sfx';
import { getBiomeAmbientArtSource } from '@/src/assets/supplemental-art-sources';
import { LoopArtPanel } from '@/src/components/loop-art-panel';
import { GameButton } from '@/src/components/game-button';
import { getRotatedPartyScene } from '@/src/content/authored-voice';
import { getClassDefinition } from '@/src/content/classes';
import { getCompanyDisasterSummary } from '@/src/content/company-lore';
import { getCompanionDefinition } from '@/src/content/companions';
import { getItemDefinition } from '@/src/content/items';
import { applyPendingReward } from '@/src/engine/reward/apply-pending-reward';
import { applyPendingRewardToRun } from '@/src/engine/reward/apply-pending-reward-to-run';
import { getEventSceneForCurrentNode } from '@/src/engine/event/event-engine';
import { getRunNodeRoute } from '@/src/engine/run/progress-run';
import { useProfileStore } from '@/src/state/profileStore';
import { useRunStore } from '@/src/state/runStore';
import { useHydratedRun } from '@/src/state/use-hydrated-run';
import { useResponsiveLayout } from '@/src/hooks/use-responsive-layout';
import { useRunHelpStartsCollapsed } from '@/src/hooks/use-run-help-starts-collapsed';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';
import type { EventChoice } from '@/src/types/event';
import type { PendingRewardState } from '@/src/types/run';

type EventChoicePreview = {
  runHpText: string;
  profileChitsText: string;
  leadAfterText: string;
  itemStateText: string | null;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createEventRewardPreviewPayload(
  runId: string,
  nodeId: string,
  updatedAt: string,
  choice: EventChoice
): PendingRewardState {
  return {
    rewardId: `event-preview-${runId}-${choice.id}`,
    sourceNodeId: nodeId,
    sourceKind: 'reward-node',
    title: choice.label,
    description: choice.outcomeText,
    selectedOptionId: null,
    options: null,
    metaCurrency: choice.effect.metaCurrency,
    runHealing: choice.effect.runHealing,
    itemId: choice.effect.itemId,
    createdAt: updatedAt,
  };
}

export default function EventScreen() {
  const { run, currentNode, loadState, error } = useHydratedRun();
  const profile = useProfileStore((state) => state.profile);
  const applyEventChoice = useRunStore((state) => state.applyEventChoice);
  const isApplyingEventChoice = useRunStore(
    (state) => state.isApplyingEventChoice
  );
  const [showSupportingReads, setShowSupportingReads] = useState(false);
  const eventOpenCueRef = useRef<string | null>(null);
  const { colors, settings } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );

  const className = useMemo(() => {
    if (!run) {
      return null;
    }

    return getClassDefinition(run.heroClassId)?.name ?? run.heroClassId;
  }, [run]);

  const activeCompanionName = useMemo(() => {
    if (!run) {
      return null;
    }

    return (
      getCompanionDefinition(run.activeCompanionId)?.name ??
      run.activeCompanionId
    );
  }, [run]);

  const eventScene = useMemo(() => {
    if (!run || !currentNode || currentNode.kind !== 'event') {
      return null;
    }

    try {
      return getEventSceneForCurrentNode(run);
    } catch {
      return null;
    }
  }, [currentNode, run]);
  const eventCrewScene = useMemo(() => {
    if (!run) {
      return null;
    }

    return getRotatedPartyScene(
      ['creepy-event-prompt', 'creepy-event-prompt-alt-1', 'creepy-event-prompt-alt-2'],
      `${run.runId}:${eventScene?.eventId ?? 'event'}:${currentNode?.id ?? 'node'}:event-read`,
      run.chosenCompanionIds
    );
  }, [currentNode?.id, eventScene?.eventId, run]);
  const eventArtSource = useMemo(
    () => getEventArtSource(eventScene?.eventId, settings),
    [eventScene?.eventId, settings]
  );
  const eventSurfaceArtSource = useMemo(
    () => getLoopSurfaceArtSource('event', settings),
    [settings]
  );
  const eventAmbientArtSource = useMemo(
    () => getBiomeAmbientArtSource(run?.floorIndex, settings),
    [run?.floorIndex, settings]
  );
  const helpStartsCollapsed = useRunHelpStartsCollapsed(run?.floorIndex ?? 1);
  const choicePreviews = useMemo(() => {
    if (!run || !currentNode || !profile || !eventScene) {
      return {};
    }

    return Object.fromEntries(
      eventScene.choices.map((choice) => {
        const damageTaken = clamp(
          choice.effect.runDamage,
          0,
          Math.max(0, run.hero.currentHp - 1)
        );
        const damagedRun = {
          ...run,
          hero: {
            ...run.hero,
            currentHp: run.hero.currentHp - damageTaken,
          },
        };
        const previewReward = createEventRewardPreviewPayload(
          run.runId,
          currentNode.id,
          run.updatedAt,
          {
            ...choice,
            effect: {
              ...choice.effect,
              runDamage: damageTaken,
            },
          }
        );
        const runPreview = applyPendingRewardToRun(damagedRun, previewReward);
        const profilePreview = applyPendingReward(profile, previewReward);
        const nextLeadId =
          choice.effect.nextActiveCompanionId &&
          run.chosenCompanionIds.includes(choice.effect.nextActiveCompanionId)
            ? choice.effect.nextActiveCompanionId
            : run.activeCompanionId;
        const nextLeadName =
          getCompanionDefinition(nextLeadId)?.name ?? nextLeadId;
        const choiceItem = choice.effect.itemId
          ? getItemDefinition(choice.effect.itemId)
          : null;
        const itemStateText = choiceItem
          ? run.inventoryItemIds.includes(choiceItem.id)
            ? `${choiceItem.name} is already equipped on this dive, so this choice stays a resource swing.`
            : profile.unlockedItemIds.includes(choiceItem.id)
              ? `${choiceItem.name} is already archived on this profile, so the duplicate converts into bonus chits instead of a new unlock.`
              : `${choiceItem.name} is new for this profile and joins this dive immediately.`
          : null;

        return [
          choice.id,
          {
            runHpText: `${run.hero.currentHp}/${run.hero.maxHp} HP -> ${runPreview.run.hero.currentHp}/${runPreview.run.hero.maxHp} HP`,
            profileChitsText: `${profile.metaCurrency} -> ${profilePreview.profile.metaCurrency} chits`,
            leadAfterText: nextLeadName,
            itemStateText,
          } satisfies EventChoicePreview,
        ];
      })
    ) as Record<string, EventChoicePreview>;
  }, [currentNode, eventScene, profile, run]);

  const wrongSceneRoute =
    currentNode && currentNode.kind !== 'event'
      ? getRunNodeRoute(currentNode.kind)
      : null;

  useEffect(() => {
    if (!run || !currentNode || currentNode.kind !== 'event' || !eventScene) {
      return;
    }

    const cueKey = `${run.runId}:${currentNode.id}:${eventScene.eventId}`;

    if (eventOpenCueRef.current === cueKey) {
      return;
    }

    eventOpenCueRef.current = cueKey;
    void playUiSfx('event-open', settings);
  }, [currentNode, eventScene, run, settings]);

  useEffect(() => {
    setShowSupportingReads(!helpStartsCollapsed);
  }, [helpStartsCollapsed, run?.runId, currentNode?.id]);

  const handleChoice = async (choiceId: string) => {
    void playUiSfx('event-confirm', settings);
    void trackAnalyticsEvent('event_choice_applied', {
      runId: run?.runId ?? null,
      eventId: eventScene?.eventId ?? null,
      choiceId,
    });
    const result = await applyEventChoice(choiceId);

    if (currentNode && run) {
      void trackAnalyticsEvent('room_exited', {
        runId: run.runId,
        nodeId: currentNode.id,
        kind: currentNode.kind,
        floorIndex: run.floorIndex,
        outcome: result.nextRoute === '/end-run' ? 'run-ended' : 'resolved',
      });
    }

    if (result.nextRoute === '/end-run') {
      void trackAnalyticsEvent('run_ended', {
        runId: result.run.runId,
        result: 'win',
        floorIndex: result.run.floorIndex,
      });
      router.replace(
        `/end-run?runId=${encodeURIComponent(result.run.runId)}` as Href
      );
      return;
    }

    router.replace(result.nextRoute as Href);
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
            <Text style={styles.eyebrow}>RUN NODE</Text>
            <Text style={styles.title}>Event</Text>
            <Text style={styles.subtitle}>
              Make one risk call and live with it.
            </Text>
            {!helpStartsCollapsed ? (
              <Text style={styles.body}>
                {eventScene?.description ??
                  getCompanyDisasterSummary()}
              </Text>
            ) : null}
          </View>

          {loadState === 'idle' || loadState === 'loading' ? (
            <LoadingPanel label="Reopening the current office disaster..." />
          ) : loadState === 'error' ? (
            <InfoPanel
              title="Event Error"
              body={error ?? 'The active event could not be reconstructed.'}
              primaryLabel="Return to Map"
              primaryHref="/run-map"
            />
          ) : !run || !currentNode ? (
            <InfoPanel
              title="No Event Loaded"
              body="There is no active event node to continue. Return to the map and reopen the run from there."
              primaryLabel="Return to Map"
              primaryHref="/run-map"
              secondaryLabel="Employee Portal"
              secondaryHref="/"
            />
          ) : wrongSceneRoute ? (
            <InfoPanel
              title="Wrong Route"
              body={`The active node is a ${currentNode.kind} node, so this room must be entered from the matching screen.`}
              primaryLabel="Open Correct Node"
              primaryHref={wrongSceneRoute}
              secondaryLabel="Return to Map"
              secondaryHref="/run-map"
            />
          ) : !eventScene ? (
            <InfoPanel
              title="Event Unavailable"
              body="The event scene could not be prepared from the active run state."
              primaryLabel="Return to Map"
              primaryHref="/run-map"
            />
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Risk Call</Text>
                <Text style={styles.panelBody}>
                  Pick one response. Each card shows the immediate risk and payoff.
                </Text>
                <View style={styles.detailCard}>
                  <DetailLine
                    label={`${className ?? 'Hero'} HP`}
                    value={`${run.hero.currentHp}/${run.hero.maxHp}`}
                  />
                  <DetailLine
                    label="Lead"
                    value={activeCompanionName ?? 'Unknown'}
                  />
                  <DetailLine
                    label="Profile chits"
                    value={String(profile?.metaCurrency ?? 0)}
                  />
                </View>
                <View style={styles.choiceList}>
                  {eventScene.choices.map((choice) => {
                    const itemName = choice.effect.itemId
                      ? getItemDefinition(choice.effect.itemId)?.name ??
                        choice.effect.itemId
                      : null;
                    const choicePreview = choicePreviews[choice.id] ?? null;

                    return (
                      <View key={choice.id} style={styles.choiceCard}>
                        <Text style={styles.choiceTitle}>{choice.label}</Text>
                        <Text style={styles.choiceBody}>{choice.description}</Text>
                        <Text style={styles.choicePreview}>{choice.preview}</Text>
                        {choicePreview ? (
                          <>
                            <Text style={styles.choiceEdge}>
                              Run HP: {choicePreview.runHpText}
                            </Text>
                            <Text style={styles.choiceEdge}>
                              Profile chits: {choicePreview.profileChitsText}
                            </Text>
                            <Text style={styles.choiceEdge}>
                              Lead after choice: {choicePreview.leadAfterText}
                            </Text>
                            {choicePreview.itemStateText ? (
                              <Text style={styles.choiceEdge}>
                                Item state: {choicePreview.itemStateText}
                              </Text>
                            ) : null}
                          </>
                        ) : null}
                        {choice.classBonusLabel ? (
                          <Text style={styles.choiceEdge}>
                            Class Edge: {choice.classBonusLabel}
                          </Text>
                        ) : null}
                        {choice.companionBonusLabel ? (
                          <Text style={styles.choiceEdge}>
                            Companion Edge: {choice.companionBonusLabel}
                          </Text>
                        ) : null}
                        {choice.synergyBonusLabel ? (
                          <Text style={styles.choiceEdge}>
                            Synergy Edge: {choice.synergyBonusLabel}
                          </Text>
                        ) : null}
                        {itemName ? (
                          <Text style={styles.choiceMeta}>
                            Contraband: {itemName}
                          </Text>
                        ) : null}
                        <GameButton
                          label={
                            isApplyingEventChoice
                              ? 'Resolving...'
                              : `Choose ${choice.label}`
                          }
                          onPress={() => {
                            void handleChoice(choice.id);
                          }}
                          disabled={isApplyingEventChoice}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{eventScene.title}</Text>
                <Text style={styles.panelBody}>
                  Pick the line that keeps the crew alive and the tower slightly less in control.
                </Text>
                <View style={styles.detailCard}>
                  <DetailLine label="Floor" value={String(run.floorIndex)} />
                  <DetailLine label="Room" value={currentNode.label} />
                </View>
                {showSupportingReads ? (
                  <LoopArtPanel
                    title="Room Signal"
                    body={eventScene.description}
                    ambientSource={eventAmbientArtSource}
                    source={eventArtSource}
                    backgroundSource={eventSurfaceArtSource}
                    frameVariant="portrait"
                  />
                ) : (
                  <Text style={styles.panelBody}>
                    Room flavor and extra signal stay below the choice once you already know how events work.
                  </Text>
                )}
              </View>

              <View style={styles.panel}>
                <Pressable
                  style={styles.toggleRow}
                  onPress={() => {
                    setShowSupportingReads((current) => !current);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Class and Crew Reads"
                  accessibilityHint={
                    showSupportingReads
                      ? 'Double tap to collapse class and crew reads.'
                      : 'Double tap to expand class and crew reads.'
                  }
                  accessibilityState={{ expanded: showSupportingReads }}
                >
                  <Text style={styles.panelTitle}>Supporting Reads</Text>
                  <Text style={styles.toggleLabel}>
                    {showSupportingReads ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
                {showSupportingReads ? (
                  <>
                    <View style={styles.classReadCard}>
                      <Text style={styles.classReadName}>
                        {eventScene.classMoment.className}
                      </Text>
                      <Text style={styles.classReadHeadline}>
                        {eventScene.classMoment.headline}
                      </Text>
                      <Text style={styles.classReadBody}>
                        {eventScene.classMoment.line}
                      </Text>
                    </View>
                    <View style={styles.banterList}>
                      {eventCrewScene ? (
                        <View style={styles.detailCard}>
                          <Text style={styles.banterName}>{eventCrewScene.title}</Text>
                          {eventCrewScene.lines.map((line) => (
                            <Text key={line.speakerId} style={styles.banterBody}>
                              {line.speakerName}: {line.text}
                            </Text>
                          ))}
                        </View>
                      ) : null}
                      {eventScene.companionMoments.map((moment) => (
                        <View
                          key={`${moment.companionId}-${moment.role}`}
                          style={[
                            styles.banterCard,
                            moment.role === 'active' ? styles.banterCardActive : null,
                          ]}
                        >
                          <Text style={styles.banterName}>
                            {moment.companionName}
                          </Text>
                          <Text style={styles.banterHeadline}>
                            {moment.headline}
                          </Text>
                          <Text style={styles.banterBody}>{moment.line}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : (
                  <Text style={styles.panelBody}>
                    Extra class context and crew banter stay tucked here once the event decision itself is clear.
                  </Text>
                )}
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Return to Map"
                    onPress={() => {
                      router.replace('/run-map' as Href);
                    }}
                    variant="secondary"
                    disabled={isApplyingEventChoice}
                  />
                  <GameButton
                    label="Open Codex"
                    onPress={() => {
                      router.push('/codex?returnTo=%2Fevent' as Href);
                    }}
                    variant="secondary"
                    disabled={isApplyingEventChoice}
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
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );

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
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  const { colors, settings } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelBody}>{body}</Text>
      <View style={styles.actionGroup}>
        <GameButton
          label={primaryLabel}
          onPress={() => {
            router.replace(primaryHref as Href);
          }}
        />
        {secondaryLabel && secondaryHref ? (
          <GameButton
            label={secondaryLabel}
            onPress={() => {
              router.replace(secondaryHref as Href);
            }}
            variant="secondary"
          />
        ) : null}
      </View>
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );

  return (
    <Text style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
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
    flexDirection: layout.stackStatCards ? 'column' : 'row',
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
    fontSize: scaleFontSize(18, settings),
    fontWeight: '900',
    lineHeight: scaleLineHeight(22, settings),
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
  classReadCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 16,
    padding: 14,
    gap: spacing.xs + 2,
  },
  classReadName: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(15, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(20, settings),
  },
  classReadHeadline: {
    color: colors.accent,
    fontSize: scaleFontSize(12, settings),
    fontWeight: '800',
    letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    textTransform: 'uppercase',
  },
  classReadBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  banterList: {
    gap: spacing.sm,
  },
  banterCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: spacing.xs + 2,
  },
  banterCardActive: {
    borderColor: colors.accent,
  },
  banterName: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(15, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(20, settings),
  },
  banterHeadline: {
    color: colors.accent,
    fontSize: scaleFontSize(12, settings),
    fontWeight: '800',
    letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    textTransform: 'uppercase',
  },
  banterBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  choiceList: {
    gap: spacing.md,
  },
  choiceCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: spacing.xs + 2,
  },
  choiceTitle: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(17, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(21, settings),
  },
  choiceBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(14, settings),
    lineHeight: scaleLineHeight(20, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  choicePreview: {
    color: colors.accent,
    fontSize: scaleFontSize(13, settings),
    fontWeight: '700',
    lineHeight: scaleLineHeight(18, settings),
  },
  choiceEdge: {
    color: colors.textSecondary,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(18, settings),
  },
  choiceMeta: {
    color: colors.textSecondary,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(18, settings),
  },
  toggleRow: {
    flexDirection: layout.stackInlineHeader ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: layout.stackInlineHeader ? 'flex-start' : 'center',
    gap: spacing.sm,
    minHeight: 48,
  },
  toggleLabel: {
    color: colors.accent,
    fontSize: scaleFontSize(12, settings),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
  },
  actionGroup: {
    gap: spacing.sm + 2,
  },
  });
}
