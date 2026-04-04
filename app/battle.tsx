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
import { getPartyScene } from '@/src/content/authored-voice';
import { getCombatActionDefinitions } from '@/src/engine/battle/combat-engine';
import { formatCombatStatusLabel } from '@/src/engine/battle/combat-statuses';
import { getRunCompanionSupportCards } from '@/src/engine/bond/companion-perks';
import { getRunNodeRoute } from '@/src/engine/run/progress-run';
import { getClassDefinition } from '@/src/content/classes';
import { createClassEncounterBrief } from '@/src/content/company-lore';
import { getCompanionDefinition } from '@/src/content/companions';
import { getEnemyTeamCountermeasureCards } from '@/src/content/enemy-team-reactions';
import { getItemDefinition } from '@/src/content/items';
import { getActiveTeamSynergyCards } from '@/src/content/team-synergies';
import { getStatusDefinition } from '@/src/content/statuses';
import { useRunStore } from '@/src/state/runStore';
import { useHydratedRun } from '@/src/state/use-hydrated-run';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';
import type { CombatActionId } from '@/src/types/combat';

function splitActionDescription(description: string) {
  const [core, modifiers] = description.split(' Active modifiers: ');

  return {
    core: core?.trim() ?? description,
    modifiers: modifiers?.trim() ?? null,
  };
}

export default function BattleScreen() {
  const { run, currentNode, loadState, error } = useHydratedRun();
  const prepareCombatForCurrentNode = useRunStore(
    (state) => state.prepareCombatForCurrentNode
  );
  const performCombatAction = useRunStore((state) => state.performCombatAction);
  const isPreparingCombat = useRunStore((state) => state.isPreparingCombat);
  const isPerformingCombatAction = useRunStore(
    (state) => state.isPerformingCombatAction
  );
  const [showTactics, setShowTactics] = useState(false);
  const [showFullLog, setShowFullLog] = useState(false);
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  useEffect(() => {
    if (!run || !currentNode) {
      return;
    }

    if (run.pendingReward) {
      return;
    }

    if (currentNode.kind !== 'battle' && currentNode.kind !== 'boss') {
      return;
    }

    if (
      run.combatState &&
      run.combatState.nodeId === currentNode.id &&
      run.combatState.phase === 'player-turn'
    ) {
      return;
    }

    void prepareCombatForCurrentNode().catch(() => {
      // Store captures the error for the UI.
    });
  }, [currentNode, prepareCombatForCurrentNode, run]);

  const className = useMemo(() => {
    if (!run) {
      return null;
    }

    return getClassDefinition(run.heroClassId)?.name ?? run.heroClassId;
  }, [run]);
  const companionName = useMemo(() => {
    if (!run) {
      return null;
    }

    return getCompanionDefinition(run.activeCompanionId)?.name ?? run.activeCompanionId;
  }, [run]);
  const carriedItems = useMemo(() => {
    if (!run) {
      return [];
    }

    return run.inventoryItemIds.map((itemId) => {
      const item = getItemDefinition(itemId);

      return {
        id: itemId,
        name: item?.name ?? itemId,
        effectSummary: item?.effectSummary ?? 'Effect summary missing.',
      };
    });
  }, [run]);
  const companionSupportCards = useMemo(() => {
    if (!run) {
      return [];
    }

    return getRunCompanionSupportCards(run);
  }, [run]);
  const teamSynergyCards = useMemo(() => {
    if (!run) {
      return [];
    }

    return getActiveTeamSynergyCards(run);
  }, [run]);

  const combatState = run?.combatState ?? null;
  const enemyCountermeasureCards = useMemo(() => {
    if (!run || !combatState) {
      return [];
    }

    return getEnemyTeamCountermeasureCards(run, combatState.enemy.enemyId);
  }, [combatState, run]);
  const heroStatusCards = useMemo(() => {
    if (!combatState) {
      return [];
    }

    return combatState.heroStatuses.map((status) => ({
      id: status.id,
      label: formatCombatStatusLabel(status),
      summary:
        getStatusDefinition(status.id)?.effectSummary ?? 'Effect summary missing.',
    }));
  }, [combatState]);
  const enemyStatusCards = useMemo(() => {
    if (!combatState) {
      return [];
    }

    return combatState.enemyStatuses.map((status) => ({
      id: status.id,
      label: formatCombatStatusLabel(status),
      summary:
        getStatusDefinition(status.id)?.effectSummary ?? 'Effect summary missing.',
    }));
  }, [combatState]);
  const actions = useMemo(
    () =>
      run
        ? getCombatActionDefinitions(run).map((action) => ({
            ...action,
            ...splitActionDescription(action.description),
          }))
        : [],
    [run]
  );
  const wrongSceneRoute =
    currentNode && currentNode.kind !== 'battle' && currentNode.kind !== 'boss'
      ? getRunNodeRoute(currentNode.kind)
      : null;
  const visibleLog = useMemo(() => {
    if (!combatState) {
      return [];
    }

    const entries = combatState.log.slice().reverse();
    return showFullLog ? entries : entries.slice(0, 4);
  }, [combatState, showFullLog]);
  const crewChannelScene = useMemo(() => {
    if (!run || !combatState) {
      return null;
    }

    return getPartyScene(
      combatState.heroHp * 2 <= combatState.heroMaxHp ? 'low-health' : 'battle-intro',
      run.chosenCompanionIds
    );
  }, [combatState, run]);

  const handleAction = async (actionId: CombatActionId) => {
    const result = await performCombatAction(actionId);

    if (result.nextRoute === '/end-run') {
      router.replace(
        `/end-run?runId=${encodeURIComponent(result.run.runId)}` as Href
      );
      return;
    }

    if (result.nextRoute !== '/battle') {
      router.replace(result.nextRoute as Href);
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
            <Text style={styles.eyebrow}>ENCOUNTER</Text>
            <Text style={styles.title}>
              {currentNode?.kind === 'boss' ? 'Boss Fight' : 'Battle'}
            </Text>
            <Text style={styles.subtitle}>
              Read the room fast. Hit hard. Keep enough HP to climb again.
            </Text>
            {run && currentNode ? (
              <Text style={styles.body}>
                {createClassEncounterBrief(run.heroClassId, currentNode.label)}
              </Text>
            ) : null}
          </View>

          {loadState === 'idle' || loadState === 'loading' ? (
            <LoadingPanel label="Reopening the incident report..." />
          ) : loadState === 'error' ? (
            <ErrorPanel message={error} />
          ) : !run || !currentNode ? (
            <InfoPanel
              title="No Encounter Loaded"
              body="There is no active combat node to continue."
              primaryLabel="Return to Map"
              primaryHref="/run-map"
            />
          ) : wrongSceneRoute ? (
            <InfoPanel
              title="Wrong Route"
              body={`The active node is a ${currentNode.kind} node, so this screen cannot resolve it.`}
              primaryLabel="Open Correct Node"
              primaryHref={wrongSceneRoute}
              secondaryLabel="Return to Map"
              secondaryHref="/run-map"
            />
          ) : run.pendingReward ? (
            <InfoPanel
              title="Reward Waiting"
              body="Claim the current payout before starting another fight."
              primaryLabel="Claim Reward"
              primaryHref="/reward"
              secondaryLabel="Return to Map"
              secondaryHref="/run-map"
            />
          ) : !combatState || isPreparingCombat ? (
            <LoadingPanel label="Constructing the current encounter..." />
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{currentNode.label}</Text>
                <Text style={styles.panelBody}>{currentNode.description}</Text>
                <View style={styles.statGrid}>
                  <CombatStatCard
                    label={`${className ?? 'Hero'} HP`}
                    value={`${combatState.heroHp}/${combatState.heroMaxHp}`}
                  />
                  <CombatStatCard
                    label={`${combatState.enemy.name} HP`}
                    value={`${combatState.enemy.currentHp}/${combatState.enemy.maxHp}`}
                  />
                </View>
                <View style={styles.readCard}>
                  <Text style={styles.readLabel}>Enemy Intent</Text>
                  <Text style={styles.readValue}>{combatState.enemy.intent}</Text>
                  <Text style={styles.readHint}>
                    Keep the board readable: the enemy acts right after you unless you end the fight first.
                  </Text>
                </View>
                <View style={styles.tagRow}>
                  <InfoTag label={`Lead: ${companionName ?? 'Unknown'}`} />
                  <InfoTag label={`Gear: ${carriedItems.length}`} />
                  <InfoTag label={`Synergies: ${teamSynergyCards.length}`} />
                </View>
                {heroStatusCards.length > 0 || enemyStatusCards.length > 0 ? (
                  <View style={styles.statusStack}>
                    {heroStatusCards.length > 0 ? (
                      <View style={styles.statusCard}>
                        <Text style={styles.statusHeading}>On You</Text>
                        <Text style={styles.statusBody}>
                          {heroStatusCards.map((status) => status.label).join(', ')}
                        </Text>
                      </View>
                    ) : null}
                    {enemyStatusCards.length > 0 ? (
                      <View style={styles.statusCard}>
                        <Text style={styles.statusHeading}>On Them</Text>
                        <Text style={styles.statusBody}>
                          {enemyStatusCards.map((status) => status.label).join(', ')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
                {crewChannelScene ? (
                  <View style={styles.detailCard}>
                    <Text style={styles.detailCardTitle}>{crewChannelScene.title}</Text>
                    {crewChannelScene.lines.map((line) => (
                      <Text key={line.speakerId} style={styles.detailCardBody}>
                        {line.speakerName}: {line.text}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Pick One Action</Text>
                <Text style={styles.panelBody}>
                  Each action tells you the immediate tradeoff. Extra rules live in details, not in your way.
                </Text>
                <View style={styles.actionList}>
                  {actions.map((action) => (
                    <View key={action.id} style={styles.actionCard}>
                      <GameButton
                        label={isPerformingCombatAction ? 'Resolving...' : action.label}
                        onPress={() => {
                          void handleAction(action.id);
                        }}
                        disabled={isPerformingCombatAction}
                      />
                      <Text style={styles.actionDescription}>{action.core}</Text>
                      {action.modifiers ? (
                        <Text style={styles.actionModifiers}>{action.modifiers}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.panel}>
                <Pressable
                  style={styles.toggleRow}
                  onPress={() => {
                    setShowFullLog((current) => !current);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.panelTitle}>Combat Log</Text>
                  <Text style={styles.toggleLabel}>
                    {showFullLog ? 'Show Less' : 'Show More'}
                  </Text>
                </Pressable>
                <Text style={styles.panelBody}>
                  The latest beats come first so you can tell what just happened.
                </Text>
                <View style={styles.logList}>
                  {visibleLog.map((entry, index) => (
                    <Text key={`${combatState.combatId}-${index}`} style={styles.logEntry}>
                      {entry}
                    </Text>
                  ))}
                </View>
                <GameButton
                  label="Retreat to Map"
                  onPress={() => {
                    router.replace('/run-map' as Href);
                  }}
                  variant="secondary"
                  disabled={isPerformingCombatAction}
                />
              </View>

              <View style={styles.panel}>
                <Pressable
                  style={styles.toggleRow}
                  onPress={() => {
                    setShowTactics((current) => !current);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.panelTitle}>Tactical Details</Text>
                  <Text style={styles.toggleLabel}>
                    {showTactics ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
                {showTactics ? (
                  <>
                    {teamSynergyCards.length > 0 ? (
                      <CardList
                        title="Team Synergies"
                        cards={teamSynergyCards.map((card) => ({
                          id: card.id,
                          title: card.title,
                          summary: card.summary,
                        }))}
                      />
                    ) : null}
                    {enemyCountermeasureCards.length > 0 ? (
                      <CardList
                        title="Enemy Countermeasures"
                        cards={enemyCountermeasureCards.map((card) => ({
                          id: card.id,
                          title: card.title,
                          summary: card.summary,
                        }))}
                      />
                    ) : null}
                    {companionSupportCards.length > 0 ? (
                      <CardList
                        title="Companion Support"
                        cards={companionSupportCards.map((card) => ({
                          id: card.companionId,
                          title: `${card.companionName} (${card.role === 'active' ? 'Lead' : 'Reserve'})`,
                          summary: `Bond ${card.bondLevel}: ${card.summary}${card.nextUpgradeSummary ? ` ${card.nextUpgradeSummary}` : ''}`,
                        }))}
                      />
                    ) : null}
                    {carriedItems.length > 0 ? (
                      <CardList
                        title="Carried Gear"
                        cards={carriedItems.map((item) => ({
                          id: item.id,
                          title: item.name,
                          summary: item.effectSummary,
                        }))}
                      />
                    ) : null}
                    {heroStatusCards.length > 0 ? (
                      <CardList
                        title="Hero Status Details"
                        cards={heroStatusCards.map((status) => ({
                          id: `hero-${status.id}`,
                          title: status.label,
                          summary: status.summary,
                        }))}
                      />
                    ) : null}
                    {enemyStatusCards.length > 0 ? (
                      <CardList
                        title="Enemy Status Details"
                        cards={enemyStatusCards.map((status) => ({
                          id: `enemy-${status.id}`,
                          title: status.label,
                          summary: status.summary,
                        }))}
                      />
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.panelBody}>
                    Expanded notes stay hidden unless you want the fine print on synergies, gear, and status interactions.
                  </Text>
                )}
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

function ErrorPanel({ message }: { message: string | null }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Combat Error</Text>
      <Text style={styles.errorBody}>
        {message ?? 'The encounter could not be reconstructed.'}
      </Text>
      <GameButton
        label="Return to Map"
        onPress={() => {
          router.replace('/run-map' as Href);
        }}
      />
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

function CombatStatCard({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoTag({ label }: { label: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.infoTag}>
      <Text style={styles.infoTagText}>{label}</Text>
    </View>
  );
}

function CardList({
  title,
  cards,
}: {
  title: string;
  cards: { id: string; title: string; summary: string }[];
}) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.cardList}>
      <Text style={styles.cardListTitle}>{title}</Text>
      {cards.map((card) => (
        <View key={card.id} style={styles.detailCard}>
          <Text style={styles.detailCardTitle}>{card.title}</Text>
          <Text style={styles.detailCardBody}>{card.summary}</Text>
        </View>
      ))}
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
    errorBody: {
      color: colors.errorMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
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
    },
    statLabel: {
      color: colors.textMuted,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
      textAlign: 'center',
    },
    readCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs + 2,
    },
    readLabel: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    readValue: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(18, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    readHint: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs + 2,
    },
    infoTag: {
      backgroundColor: colors.surface,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 36,
      justifyContent: 'center',
    },
    infoTagText: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(16, settings),
    },
    statusStack: {
      gap: spacing.sm,
    },
    statusCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs + 2,
    },
    statusHeading: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    statusBody: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
    },
    actionList: {
      gap: spacing.md,
    },
    actionCard: {
      gap: spacing.xs + 2,
    },
    actionDescription: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
      paddingHorizontal: 2,
    },
    actionModifiers: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      lineHeight: scaleLineHeight(18, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
      paddingHorizontal: 2,
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
      fontSize: scaleFontSize(13, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(18, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    logList: {
      gap: spacing.xs + 2,
    },
    logEntry: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    cardList: {
      gap: spacing.sm,
    },
    cardListTitle: {
      color: colors.accent,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(18, settings),
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
    detailCardTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(14, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
    },
    detailCardBody: {
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
