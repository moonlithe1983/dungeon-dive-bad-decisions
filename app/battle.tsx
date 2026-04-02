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
import { getCombatActionDefinitions } from '@/src/engine/battle/combat-engine';
import { formatCombatStatusLabel } from '@/src/engine/battle/combat-statuses';
import { getRunCompanionSupportCards } from '@/src/engine/bond/companion-perks';
import { getRunNodeRoute } from '@/src/engine/run/progress-run';
import { getClassDefinition } from '@/src/content/classes';
import {
  createClassEncounterBrief,
  getClassNarrative,
  getCompanyDisasterSummary,
} from '@/src/content/company-lore';
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
      // The store already captures the error for UI display.
    });
  }, [currentNode, prepareCombatForCurrentNode, run]);

  const className = useMemo(() => {
    if (!run) {
      return null;
    }

    return getClassDefinition(run.heroClassId)?.name ?? run.heroClassId;
  }, [run]);
  const classNarrative = useMemo(() => {
    if (!run) {
      return null;
    }

    return getClassNarrative(run.heroClassId);
  }, [run]);

  const companionName = useMemo(() => {
    if (!run) {
      return null;
    }

    return (
      getCompanionDefinition(run.activeCompanionId)?.name ??
      run.activeCompanionId
    );
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
  const actions = run ? getCombatActionDefinitions(run) : [];
  const wrongSceneRoute =
    currentNode && currentNode.kind !== 'battle' && currentNode.kind !== 'boss'
      ? getRunNodeRoute(currentNode.kind)
      : null;

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
            <Text style={styles.eyebrow}>RUN NODE</Text>
            <Text style={styles.title}>Battle</Text>
            <Text style={styles.subtitle}>
              Every fight carries the cost of the floor before it.
            </Text>
            <Text style={styles.body}>
              {getCompanyDisasterSummary()}
            </Text>
            <Text style={styles.body}>
              Each fight still carries surviving HP, contraband, and companion
              support into the next bad decision, but now every encounter also
              reads like another attempt to save the company before leadership
              decides your unauthorized competence is the real threat.
            </Text>
          </View>

          {loadState === 'idle' || loadState === 'loading' ? (
            <LoadingPanel label="Reopening the incident report..." />
          ) : loadState === 'error' ? (
            <ErrorPanel message={error} />
          ) : !run || !currentNode ? (
            <InfoPanel
              title="No Encounter Loaded"
              body="There is no active combat node to continue. Return to the map and reopen the run from there."
              primaryLabel="Return to Map"
              primaryHref="/run-map"
            />
          ) : wrongSceneRoute ? (
            <InfoPanel
              title="Wrong Route"
              body={`The active node is a ${currentNode.kind} node, so this encounter cannot be entered from here.`}
              primaryLabel="Open Correct Node"
              primaryHref={wrongSceneRoute}
              secondaryLabel="Return to Map"
              secondaryHref="/run-map"
            />
          ) : run.pendingReward ? (
            <InfoPanel
              title="Reward Waiting"
              body="A completed encounter already produced a payout. Claim it before starting another fight."
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
                <Text style={styles.panelTitle}>
                  {currentNode.kind === 'boss' ? 'Boss Encounter' : 'Encounter'}
                </Text>
                <Text style={styles.panelBody}>{currentNode.description}</Text>
                {classNarrative ? (
                  <Text style={styles.storyBody}>
                    {createClassEncounterBrief(run.heroClassId, currentNode.label)}
                  </Text>
                ) : null}
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
                <View style={styles.detailCard}>
                  <DetailLine label="Companion" value={companionName ?? 'Unknown'} />
                  <DetailLine
                    label="Carried Gear"
                    value={
                      carriedItems.length > 0
                        ? carriedItems.map((item) => item.name).join(', ')
                        : 'No active contraband'
                    }
                  />
                  <DetailLine
                    label="Companion Support"
                    value={
                      companionSupportCards.length > 0
                        ? companionSupportCards
                            .map(
                              (card) =>
                                `${card.companionName} (${card.role === 'active' ? 'lead' : 'reserve'})`
                            )
                            .join(', ')
                        : 'No support roster'
                    }
                  />
                  <DetailLine
                    label="Team Synergies"
                    value={
                      teamSynergyCards.length > 0
                        ? teamSynergyCards.map((card) => card.title).join(', ')
                        : 'No active team synergy'
                    }
                  />
                  <DetailLine
                    label="Enemy Reaction"
                    value={
                      enemyCountermeasureCards.length > 0
                        ? enemyCountermeasureCards
                            .map((card) => card.title)
                            .join(', ')
                        : 'No active countermeasure'
                    }
                  />
                  <DetailLine label="Turn" value={String(combatState.turnNumber)} />
                  <DetailLine label="Enemy Tier" value={combatState.enemy.tier} />
                  <DetailLine label="Intent" value={combatState.enemy.intent} />
                  {classNarrative ? (
                    <DetailLine
                      label="Approval Trap"
                      value={classNarrative.approvalConstraint}
                    />
                  ) : null}
                </View>
                {teamSynergyCards.length > 0 ? (
                  <View style={styles.itemEffectList}>
                    <Text style={styles.statusHeading}>Team Synergies</Text>
                    {teamSynergyCards.map((card) => (
                      <View key={card.id} style={styles.itemEffectCard}>
                        <Text style={styles.itemEffectName}>{card.title}</Text>
                        <Text style={styles.itemEffectBody}>{card.summary}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {enemyCountermeasureCards.length > 0 ? (
                  <View style={styles.itemEffectList}>
                    <Text style={styles.statusHeading}>Enemy Countermeasures</Text>
                    {enemyCountermeasureCards.map((card) => (
                      <View key={card.id} style={styles.itemEffectCard}>
                        <Text style={styles.itemEffectName}>{card.title}</Text>
                        <Text style={styles.itemEffectBody}>{card.summary}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {heroStatusCards.length > 0 || enemyStatusCards.length > 0 ? (
                  <View style={styles.statusSection}>
                    {heroStatusCards.length > 0 ? (
                      <View style={styles.itemEffectList}>
                        <Text style={styles.statusHeading}>Hero Statuses</Text>
                        {heroStatusCards.map((status) => (
                          <View key={`hero-${status.id}`} style={styles.itemEffectCard}>
                            <Text style={styles.itemEffectName}>{status.label}</Text>
                            <Text style={styles.itemEffectBody}>{status.summary}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {enemyStatusCards.length > 0 ? (
                      <View style={styles.itemEffectList}>
                        <Text style={styles.statusHeading}>Enemy Statuses</Text>
                        {enemyStatusCards.map((status) => (
                          <View key={`enemy-${status.id}`} style={styles.itemEffectCard}>
                            <Text style={styles.itemEffectName}>{status.label}</Text>
                            <Text style={styles.itemEffectBody}>{status.summary}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ) : null}
                {companionSupportCards.length > 0 ? (
                  <View style={styles.itemEffectList}>
                    {companionSupportCards.map((card) => (
                      <View key={card.companionId} style={styles.itemEffectCard}>
                        <Text style={styles.itemEffectName}>
                          {card.companionName} ({card.role === 'active' ? 'Lead' : 'Reserve'})
                        </Text>
                        <Text style={styles.itemEffectBody}>
                          Bond {card.bondLevel}: {card.summary}
                        </Text>
                        {card.nextUpgradeSummary ? (
                          <Text style={styles.supportUpgradeText}>
                            {card.nextUpgradeSummary}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
                {carriedItems.length > 0 ? (
                  <View style={styles.itemEffectList}>
                    {carriedItems.map((item) => (
                      <View key={item.id} style={styles.itemEffectCard}>
                        <Text style={styles.itemEffectName}>{item.name}</Text>
                        <Text style={styles.itemEffectBody}>
                          {item.effectSummary}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Combat Log & Comms</Text>
                <Text style={styles.panelBody}>
                  Encounter beats, gear notes, and lead or reserve companion
                  callouts all land here in the order they happen.
                </Text>
                <View style={styles.logList}>
                  {combatState.log
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <Text key={`${combatState.combatId}-${index}`} style={styles.logEntry}>
                        {entry}
                      </Text>
                    ))}
                </View>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Retreat to Map"
                    onPress={() => {
                      router.replace('/run-map' as Href);
                    }}
                    variant="secondary"
                    disabled={isPerformingCombatAction}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Actions</Text>
                <Text style={styles.panelBody}>
                  Pick one action each turn. Gear, companion support, and any
                  live team synergy are already reflected in the live action
                  text, enemy countermeasures now show up above, companion
                  comms update inside the rolling log, statuses can shift both
                  sides of the exchange, and the enemy retaliates immediately
                  unless you finish the fight first.
                </Text>
                <View style={styles.actionList}>
                  {actions.map((action) => (
                    <View key={action.id} style={styles.actionCard}>
                      <GameButton
                        label={
                          isPerformingCombatAction
                            ? 'Resolving...'
                            : action.label
                        }
                        onPress={() => {
                          void handleAction(action.id);
                        }}
                        disabled={isPerformingCombatAction}
                      />
                      <Text style={styles.actionDescription}>
                        {action.description}
                      </Text>
                    </View>
                  ))}
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

function ErrorPanel({ message }: { message: string | null }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Combat Error</Text>
      <Text style={styles.errorBody}>
        {message ?? 'The encounter could not be reconstructed.'}
      </Text>
      <View style={styles.actionGroup}>
        <GameButton
          label="Return to Map"
          onPress={() => {
            router.replace('/run-map' as Href);
          }}
        />
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
  storyBody: {
    color: colors.textSecondary,
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
  itemEffectList: {
    gap: spacing.sm,
  },
  itemEffectCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs + 2,
  },
  itemEffectName: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(14, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(20, settings),
  },
  itemEffectBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  supportUpgradeText: {
    color: colors.textSubtle,
    fontSize: scaleFontSize(12, settings),
    lineHeight: scaleLineHeight(18, settings),
  },
  statusSection: {
    gap: spacing.sm,
  },
  statusHeading: {
    color: colors.accent,
    fontSize: scaleFontSize(13, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(18, settings),
    textTransform: 'uppercase',
    letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
  },
  actionList: {
    gap: spacing.md,
  },
  actionCard: {
    gap: spacing.xs + 2,
  },
  actionDescription: {
    color: colors.textMuted,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    paddingHorizontal: 2,
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
  actionGroup: {
    gap: spacing.sm + 2,
  },
  });
}
