import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
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
  getLoopSurfaceArtSource,
  getRewardPackageArtSource,
  getRouteNodeArtSource,
} from '@/src/assets/loop-art-sources';
import { GameButton } from '@/src/components/game-button';
import { LoopArtPanel } from '@/src/components/loop-art-panel';
import {
  getPartyScene,
  getRewardPackagePitch,
} from '@/src/content/authored-voice';
import { getItemDefinition } from '@/src/content/items';
import { applyPendingRewardToRun } from '@/src/engine/reward/apply-pending-reward-to-run';
import { useRunStore } from '@/src/state/runStore';
import { useHydratedRun } from '@/src/state/use-hydrated-run';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';

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
  const [showDetails, setShowDetails] = useState(false);
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  useEffect(() => {
    if (!run || run.pendingReward) {
      return;
    }

    if (!currentNode || currentNode.kind !== 'reward') {
      return;
    }

    void preparePendingRewardForCurrentNode().catch(() => {
      // Store captures the error for the UI.
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
  const rewardScene = useMemo(() => {
    if (!run) {
      return null;
    }

    return getPartyScene('suspicious-reward-screen', run.chosenCompanionIds);
  }, [run]);
  const rewardPackagePitch = useMemo(
    () => getRewardPackagePitch(selectedRewardOption?.optionId),
    [selectedRewardOption?.optionId]
  );
  const rewardSurfaceArtSource = useMemo(
    () => getLoopSurfaceArtSource('reward', settings),
    [settings]
  );
  const selectedRewardArtSource = useMemo(
    () =>
      getRewardPackageArtSource(selectedRewardOption?.optionId, settings) ??
      getRouteNodeArtSource('reward', settings),
    [selectedRewardOption?.optionId, settings]
  );

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
            <Text style={styles.eyebrow}>REWARD</Text>
            <Text style={styles.title}>Claim The Haul</Text>
            <Text style={styles.subtitle}>
              Pick the package that makes the next rooms easier to survive.
            </Text>
            <Text style={styles.body}>
              Scrap helps the long game. Healing and contraband keep this run alive right now.
            </Text>
          </View>

          {loadState === 'idle' || loadState === 'loading' ? (
            <LoadingPanel label="Reopening the loot paperwork..." />
          ) : loadState === 'error' ? (
            <ErrorPanel message={error} />
          ) : !run ? (
            <InfoPanel
              title="No Reward Loaded"
              body="There is no active run to pay out."
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
              body="There is no reward waiting right now."
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
                  <RewardStatCard label="Scrap" value={`+${pendingReward.metaCurrency}`} />
                  <RewardStatCard label="Recovery" value={`+${pendingReward.runHealing} HP`} />
                </View>
                <View style={styles.previewCard}>
                  <Text style={styles.previewLabel}>Selected Package</Text>
                  <Text style={styles.previewValue}>
                    {selectedRewardOption?.label ?? 'Standard payout'}
                  </Text>
                  <Text style={styles.previewBody}>
                    {selectedRewardOption?.description ??
                      'A straightforward haul: keep the run alive now and the profile stronger later.'}
                  </Text>
                  {(selectedRewardOption?.companionBonusLabel ||
                    selectedRewardOption?.synergyBonusLabel) ? (
                    <Text style={styles.previewEdge}>
                      {[selectedRewardOption?.companionBonusLabel, selectedRewardOption?.synergyBonusLabel]
                        .filter(Boolean)
                        .join(' / ')}
                    </Text>
                  ) : null}
                  {rewardPackagePitch ? (
                    <Text style={styles.previewEdge}>
                      Build lane: {rewardPackagePitch.name}. {rewardPackagePitch.description}
                    </Text>
                  ) : null}
                </View>
              </View>

              {hasSelectableOptions ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Choose One Package</Text>
                  <Text style={styles.panelBody}>
                    Pick the package that changes this run the most right now.
                  </Text>
                  <LoopArtPanel
                    title={selectedRewardOption ? 'Selected Package' : 'Package Preview'}
                    body={
                      selectedRewardOption
                        ? selectedRewardOption.description
                        : 'Pick a package below to preview it here.'
                    }
                    source={selectedRewardArtSource}
                    backgroundSource={rewardSurfaceArtSource}
                    frameVariant="portrait"
                  />
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
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                        >
                          <View style={styles.optionHeader}>
                            <View style={styles.optionHeaderContent}>
                              <View style={styles.optionIconWrap}>
                                <Image
                                  source={
                                    getRewardPackageArtSource(option.optionId, settings) ??
                                    getRouteNodeArtSource('reward', settings)
                                  }
                                  style={styles.optionIcon}
                                  resizeMode="contain"
                                />
                              </View>
                              <Text style={styles.optionTitle}>{option.label}</Text>
                            </View>
                            {isSelected ? (
                              <Text style={styles.optionBadge}>Selected</Text>
                            ) : null}
                          </View>
                          <Text style={styles.optionBody}>{option.description}</Text>
                          <View style={styles.optionStats}>
                            <RewardOptionPill label="Scrap" value={`+${option.metaCurrency}`} />
                            <RewardOptionPill label="HP" value={`+${option.runHealing}`} />
                            <RewardOptionPill label="Item" value={optionItem?.name ?? 'None'} />
                          </View>
                          {option.companionBonusLabel ? (
                            <Text style={styles.optionEdge}>
                              Crew edge: {option.companionBonusLabel}
                            </Text>
                          ) : null}
                          {option.synergyBonusLabel ? (
                            <Text style={styles.optionEdge}>
                              Synergy edge: {option.synergyBonusLabel}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}

              <View style={styles.panel}>
                <Pressable
                  style={styles.toggleRow}
                  onPress={() => {
                    setShowDetails((current) => !current);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.panelTitle}>Reward Details</Text>
                  <Text style={styles.toggleLabel}>{showDetails ? 'Hide' : 'Show'}</Text>
                </Pressable>
                {showDetails ? (
                  <>
                    {rewardScene ? (
                      <View style={styles.detailCard}>
                        <Text style={styles.detailCardTitle}>{rewardScene.title}</Text>
                        {rewardScene.lines.map((line) => (
                          <Text key={line.speakerId} style={styles.detailCardBody}>
                            {line.speakerName}: {line.text}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                    <View style={styles.detailCard}>
                      <DetailLine
                        label="Source"
                        value={
                          pendingReward.sourceKind === 'battle-victory'
                            ? 'Battle win'
                            : 'Reward room'
                        }
                      />
                      <DetailLine label="Origin node" value={pendingReward.sourceNodeId} />
                      <DetailLine label="Current node" value={currentNode?.label ?? 'Not required'} />
                      <DetailLine
                        label="Item pickup"
                        value={rewardItem?.name ?? 'No item attached'}
                      />
                    </View>
                    <View style={styles.detailCard}>
                      <Text style={styles.detailCardTitle}>Run Impact Preview</Text>
                      <Text style={styles.detailCardBody}>
                        {rewardPreview
                          ? `${run.hero.currentHp}/${run.hero.maxHp} HP -> ${rewardPreview.run.hero.currentHp}/${rewardPreview.run.hero.maxHp} HP`
                          : 'Preview unavailable'}
                      </Text>
                      <Text style={styles.detailCardBody}>
                        {rewardItem
                          ? rewardPreview?.addedRunItemId
                            ? `${rewardItem.effectSummary} It joins this run immediately.`
                            : `${rewardItem.effectSummary} You already carry one, so this mostly strengthens the meta pool.`
                          : 'This package is all resources and no gear.'}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.panelBody}>
                    Extra source notes, crew flavor, and run-impact previews stay hidden unless you want the paperwork.
                  </Text>
                )}
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
      <Text style={styles.panelTitle}>Reward Error</Text>
      <Text style={styles.errorBody}>
        {message ?? 'The reward payload could not be prepared.'}
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

function RewardStatCard({ label, value }: { label: string; value: string }) {
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

function RewardOptionPill({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.optionPill}>
      <Text style={styles.optionPillLabel}>{label}</Text>
      <Text style={styles.optionPillValue}>{value}</Text>
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
    previewCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs + 2,
    },
    previewLabel: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    previewValue: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(18, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    previewBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    previewEdge: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(18, settings),
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
      minHeight: 88,
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
    optionHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    optionIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 8,
    },
    optionIcon: {
      width: 24,
      height: 24,
    },
    optionTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(16, settings),
      fontWeight: '800',
      flex: 1,
      lineHeight: scaleLineHeight(20, settings),
    },
    optionBadge: {
      color: colors.background,
      backgroundColor: colors.accent,
      fontSize: scaleFontSize(11, settings),
      fontWeight: '900',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      overflow: 'hidden',
    },
    optionBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    optionEdge: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
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
      minHeight: 36,
      justifyContent: 'center',
    },
    optionPillLabel: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(10, settings),
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    optionPillValue: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(18, settings),
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
