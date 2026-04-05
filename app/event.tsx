import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
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
import { LoopArtPanel } from '@/src/components/loop-art-panel';
import { GameButton } from '@/src/components/game-button';
import { getPartyScene } from '@/src/content/authored-voice';
import { getClassDefinition } from '@/src/content/classes';
import { getCompanyDisasterSummary } from '@/src/content/company-lore';
import { getCompanionDefinition } from '@/src/content/companions';
import { getItemDefinition } from '@/src/content/items';
import { getEventSceneForCurrentNode } from '@/src/engine/event/event-engine';
import { getRunNodeRoute } from '@/src/engine/run/progress-run';
import { useRunStore } from '@/src/state/runStore';
import { useHydratedRun } from '@/src/state/use-hydrated-run';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';

export default function EventScreen() {
  const { run, currentNode, loadState, error } = useHydratedRun();
  const applyEventChoice = useRunStore((state) => state.applyEventChoice);
  const isApplyingEventChoice = useRunStore(
    (state) => state.isApplyingEventChoice
  );
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

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

    return getPartyScene('creepy-event-prompt', run.chosenCompanionIds);
  }, [run]);
  const eventArtSource = useMemo(
    () => getEventArtSource(eventScene?.eventId, settings),
    [eventScene?.eventId, settings]
  );
  const eventSurfaceArtSource = useMemo(
    () => getLoopSurfaceArtSource('event', settings),
    [settings]
  );

  const wrongSceneRoute =
    currentNode && currentNode.kind !== 'event'
      ? getRunNodeRoute(currentNode.kind)
      : null;

  const handleChoice = async (choiceId: string) => {
    const result = await applyEventChoice(choiceId);

    if (result.nextRoute === '/end-run') {
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
              Read the room, choose once, and live with the paperwork.
            </Text>
            <Text style={styles.body}>
              {eventScene?.description ??
                getCompanyDisasterSummary()}
            </Text>
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
              secondaryLabel="Return to Title"
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
                <Text style={styles.panelTitle}>{eventScene.title}</Text>
                <Text style={styles.panelBody}>
                  Pick the line that keeps the crew alive and the tower slightly less in control.
                </Text>
                <View style={styles.statGrid}>
                  <StatCard
                    label={`${className ?? 'Hero'} HP`}
                    value={`${run.hero.currentHp}/${run.hero.maxHp}`}
                  />
                  <StatCard
                    label="Companion"
                    value={activeCompanionName ?? 'Unknown'}
                  />
                </View>
                <View style={styles.detailCard}>
                  <DetailLine label="Floor" value={String(run.floorIndex)} />
                  <DetailLine label="Node" value={currentNode.label} />
                  <DetailLine label="Run ID" value={run.runId} />
                </View>
                {eventCrewScene ? (
                  <View style={styles.detailCard}>
                    {eventCrewScene.lines.map((line) => (
                      <Text key={line.speakerId} style={styles.panelBody}>
                        {line.speakerName}: {line.text}
                      </Text>
                    ))}
                  </View>
                ) : null}
                <LoopArtPanel
                  title="Room Read"
                  body={
                    eventScene
                      ? `${eventScene.title} should read at a glance, but the real decision still lives in the choice text below.`
                      : 'Read the room first, then choose the line that keeps the next floor legible.'
                  }
                  source={eventArtSource}
                  backgroundSource={eventSurfaceArtSource}
                />
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Class Read</Text>
                <Text style={styles.panelBody}>
                  Your role should clarify the risk, not bury it in another memo.
                </Text>
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
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Companion Readouts</Text>
                <Text style={styles.panelBody}>
                  Active and reserve reads stay short so the choice remains the center of the screen.
                </Text>
                <View style={styles.banterList}>
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
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Choices</Text>
                <Text style={styles.panelBody}>
                  Pick one path. The art sets the tone, but the labels and previews still carry the actual risk.
                </Text>
                <View style={styles.choiceList}>
                  {eventScene.choices.map((choice) => {
                    const itemName = choice.effect.itemId
                      ? getItemDefinition(choice.effect.itemId)?.name ??
                        choice.effect.itemId
                      : null;

                    return (
                      <View key={choice.id} style={styles.choiceCard}>
                        <Text style={styles.choiceTitle}>{choice.label}</Text>
                        <Text style={styles.choiceBody}>{choice.description}</Text>
                        <Text style={styles.choicePreview}>{choice.preview}</Text>
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
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Return to Map"
                    onPress={() => {
                      router.replace('/run-map' as Href);
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
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

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
  actionGroup: {
    gap: spacing.sm + 2,
  },
  });
}
