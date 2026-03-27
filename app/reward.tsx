import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';
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
import { getItemDefinition } from '@/src/content/items';
import { applyPendingRewardToRun } from '@/src/engine/reward/apply-pending-reward-to-run';
import { useRunStore } from '@/src/state/runStore';
import { useHydratedRun } from '@/src/state/use-hydrated-run';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

export default function RewardScreen() {
  const { run, currentNode, loadState, error } = useHydratedRun();
  const preparePendingRewardForCurrentNode = useRunStore(
    (state) => state.preparePendingRewardForCurrentNode
  );
  const claimPendingReward = useRunStore((state) => state.claimPendingReward);
  const selectPendingRewardOption = useRunStore(
    (state) => state.selectPendingRewardOption
  );
  const isPreparingReward = useRunStore((state) => state.isPreparingReward);
  const isSelectingRewardOption = useRunStore(
    (state) => state.isSelectingRewardOption
  );
  const isClaimingReward = useRunStore((state) => state.isClaimingReward);

  useEffect(() => {
    if (!run || run.pendingReward) {
      return;
    }

    if (!currentNode || currentNode.kind !== 'reward') {
      return;
    }

    void preparePendingRewardForCurrentNode().catch(() => {
      // The store already captures the error for UI display.
    });
  }, [currentNode, preparePendingRewardForCurrentNode, run]);

  const pendingReward = run?.pendingReward ?? null;
  const selectedRewardOption = useMemo(() => {
    if (!pendingReward?.options?.length) {
      return null;
    }

    return (
      pendingReward.options.find(
        (option) => option.optionId === pendingReward.selectedOptionId
      ) ?? pendingReward.options[0]
    );
  }, [pendingReward]);
  const hasSelectableOptions = Boolean(pendingReward?.options?.length);
  const rewardItem = useMemo(() => {
    if (!pendingReward?.itemId) {
      return null;
    }

    return getItemDefinition(pendingReward.itemId);
  }, [pendingReward]);
  const rewardPreview = useMemo(() => {
    if (!run || !pendingReward) {
      return null;
    }

    return applyPendingRewardToRun(run, pendingReward);
  }, [pendingReward, run]);

  const handleSelectOption = async (optionId: string) => {
    if (
      !pendingReward?.options?.length ||
      pendingReward.selectedOptionId === optionId
    ) {
      return;
    }

    await selectPendingRewardOption(optionId);
  };

  const handleClaim = async () => {
    const result = await claimPendingReward();

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
            <Text style={styles.title}>Reward</Text>
            <Text style={styles.subtitle}>
              {hasSelectableOptions
                ? 'Reward rooms now offer biome-specific haul packages with different tradeoffs, companion-tuned edges, and team synergies.'
                : 'Victory and loot now hit both meta and run progression.'}
            </Text>
            <Text style={styles.body}>
              {hasSelectableOptions
                ? 'Choose one package before claiming it. The package themes now change by biome, and the selected option is what gets written into both the profile and the active run save. Your chosen companion pair and a few authored team combinations can now quietly improve specific haul options.'
                : 'Claiming rewards now writes meta currency and item unlocks into the saved profile while also healing and updating the active run.'}
            </Text>
          </View>

          {loadState === 'idle' || loadState === 'loading' ? (
            <LoadingPanel label="Reopening the loot paperwork..." />
          ) : loadState === 'error' ? (
            <ErrorPanel message={error} />
          ) : !run ? (
            <InfoPanel
              title="No Reward Loaded"
              body="There is no active run to pay out. Return to the map or title screen and reopen the current flow from there."
              primaryLabel="Return to Map"
              primaryHref="/run-map"
              secondaryLabel="Return to Title"
              secondaryHref="/"
            />
          ) : isPreparingReward && !pendingReward ? (
            <LoadingPanel label="Sorting contraband into payout categories..." />
          ) : !pendingReward ? (
            <InfoPanel
              title="Nothing To Claim"
              body="This route does not currently have a pending reward. If a battle win or reward node generated loot, it will show up here."
              primaryLabel="Return to Map"
              primaryHref="/run-map"
              secondaryLabel="Return to Title"
              secondaryHref="/"
            />
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{pendingReward.title}</Text>
                <Text style={styles.panelBody}>{pendingReward.description}</Text>
                <View style={styles.statGrid}>
                  <RewardStatCard
                    label="Meta Currency"
                    value={`+${pendingReward.metaCurrency}`}
                  />
                  <RewardStatCard
                    label="Run Healing"
                    value={`+${pendingReward.runHealing}`}
                  />
                </View>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Source"
                    value={
                      pendingReward.sourceKind === 'battle-victory'
                        ? 'Battle Win'
                        : 'Reward Room'
                    }
                  />
                  <DetailLine
                    label="Origin Node"
                    value={pendingReward.sourceNodeId}
                  />
                  <DetailLine
                    label="Current Node"
                    value={currentNode?.label ?? 'Not required'}
                  />
                  <DetailLine
                    label="Selected Package"
                    value={selectedRewardOption?.label ?? 'Standard payout'}
                  />
                  {selectedRewardOption?.companionBonusLabel ? (
                    <DetailLine
                      label="Companion Edge"
                      value={selectedRewardOption.companionBonusLabel}
                    />
                  ) : null}
                  {selectedRewardOption?.synergyBonusLabel ? (
                    <DetailLine
                      label="Synergy Edge"
                      value={selectedRewardOption.synergyBonusLabel}
                    />
                  ) : null}
                </View>
              </View>

              {hasSelectableOptions ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Choose A Haul</Text>
                  <Text style={styles.panelBody}>
                    Reward rooms now branch into biome-specific payout packages.
                    Pick one, preview the exact run impact, then claim it.
                    Companion edges now appear directly on the haul card when
                    your current pair or a live team synergy knows how to work
                    that package harder.
                  </Text>
                  <View style={styles.optionList}>
                    {pendingReward.options?.map((option) => {
                      const optionItem = option.itemId
                        ? getItemDefinition(option.itemId)
                        : null;
                      const isSelected =
                        option.optionId === pendingReward.selectedOptionId;

                      return (
                        <Pressable
                          key={option.optionId}
                          style={[
                            styles.optionCard,
                            isSelected ? styles.optionCardSelected : null,
                          ]}
                          onPress={() => {
                            void handleSelectOption(option.optionId);
                          }}
                          disabled={isClaimingReward || isSelectingRewardOption}
                        >
                          <View style={styles.optionHeader}>
                            <Text style={styles.optionTitle}>{option.label}</Text>
                            {isSelected ? (
                              <Text style={styles.optionBadge}>Selected</Text>
                            ) : null}
                          </View>
                          <Text style={styles.optionBody}>
                            {option.description}
                          </Text>
                          {option.companionBonusLabel ? (
                            <Text style={styles.optionEdge}>
                              Companion Edge: {option.companionBonusLabel}
                            </Text>
                          ) : null}
                          {option.synergyBonusLabel ? (
                            <Text style={styles.optionEdge}>
                              Synergy Edge: {option.synergyBonusLabel}
                            </Text>
                          ) : null}
                          <View style={styles.optionStats}>
                            <RewardOptionPill
                              label="Scrap"
                              value={`+${option.metaCurrency}`}
                            />
                            <RewardOptionPill
                              label="HP"
                              value={`+${option.runHealing}`}
                            />
                            <RewardOptionPill
                              label="Item"
                              value={optionItem?.name ?? 'None'}
                            />
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>
                  {selectedRewardOption?.label ?? 'Progression Payload'}
                </Text>
                <Text style={styles.panelBody}>
                  {selectedRewardOption?.description ??
                    "The meta payout is applied immediately on claim. The same reward also patches up the current run and can add the item to this run's active loadout right away."}
                </Text>
                <View style={styles.rewardPayload}>
                  <View style={styles.rewardCard}>
                    <Text style={styles.rewardLabel}>Meta Currency</Text>
                    <Text style={styles.rewardValue}>+{pendingReward.metaCurrency}</Text>
                  </View>
                  <View style={styles.rewardCard}>
                    <Text style={styles.rewardLabel}>Run Recovery</Text>
                    <Text style={styles.rewardValue}>
                      {rewardPreview
                        ? `${run.hero.currentHp}/${run.hero.maxHp} -> ${rewardPreview.run.hero.currentHp}/${rewardPreview.run.hero.maxHp}`
                        : 'Preview unavailable'}
                    </Text>
                    <Text style={styles.rewardBody}>
                      {rewardPreview
                        ? rewardPreview.maxHpDelta > 0
                          ? `This claim also adds ${rewardPreview.maxHpDelta} max HP to the run.`
                          : `This claim restores ${rewardPreview.healingApplied} HP in the active run.`
                        : 'The run recovery preview could not be prepared.'}
                    </Text>
                  </View>
                  <View style={styles.rewardCard}>
                    <Text style={styles.rewardLabel}>Item Pickup</Text>
                    <Text style={styles.rewardValue}>
                      {rewardItem?.name ?? 'No item attached'}
                    </Text>
                    <Text style={styles.rewardBody}>
                      {rewardItem
                        ? rewardPreview?.addedRunItemId
                          ? `${rewardItem.effectSummary} It will also join this run immediately.`
                          : `${rewardItem.effectSummary} You already carry one this run, so this is mostly a meta unlock.`
                        : 'This payout is all cash, no contraband.'}
                    </Text>
                  </View>
                </View>
                <View style={styles.actionGroup}>
                  <GameButton
                    label={
                      isClaimingReward
                        ? 'Claiming...'
                        : hasSelectableOptions
                          ? 'Claim Selected Package'
                          : 'Claim Reward'
                    }
                    onPress={handleClaim}
                    disabled={isClaimingReward || isSelectingRewardOption}
                  />
                  <GameButton
                    label="Return to Map"
                    onPress={() => {
                      router.replace('/run-map' as Href);
                    }}
                    variant="secondary"
                    disabled={isClaimingReward || isSelectingRewardOption}
                  />
                </View>
                {error ? <Text style={styles.errorBody}>{error}</Text> : null}
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

function ErrorPanel({ message }: { message: string | null }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Reward Error</Text>
      <Text style={styles.errorBody}>
        {message ?? 'The reward payload could not be prepared.'}
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

function RewardStatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RewardOptionPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.optionPill}>
      <Text style={styles.optionPillLabel}>{label}</Text>
      <Text style={styles.optionPillValue}>{value}</Text>
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
  errorBody: {
    color: colors.errorMuted,
    fontSize: 14,
    lineHeight: 20,
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
  rewardPayload: {
    gap: spacing.sm + 2,
  },
  optionList: {
    gap: spacing.sm + 2,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: spacing.sm,
  },
  optionCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceRaised,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  optionBadge: {
    color: colors.background,
    backgroundColor: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  optionBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  optionEdge: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  optionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  optionPill: {
    backgroundColor: colors.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  optionPillLabel: {
    color: colors.textSubtle,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  optionPillValue: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  rewardCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: spacing.xs + 2,
  },
  rewardLabel: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  rewardValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  rewardBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  actionGroup: {
    gap: spacing.sm + 2,
  },
});
