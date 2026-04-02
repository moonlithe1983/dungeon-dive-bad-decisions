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
import { getClassDefinition } from '@/src/content/classes';
import { companionDefinitions } from '@/src/content/companions';
import { getCompanionRewardEdgePreview } from '@/src/content/reward-companion-hooks';
import { getActiveTeamSynergyCardsForParty } from '@/src/content/team-synergies';
import {
  getCompanionSupportSummary,
  getNextCompanionSupportSummary,
} from '@/src/engine/bond/companion-perks';
import { useProfileStore } from '@/src/state/profileStore';
import { useRunStore } from '@/src/state/runStore';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';

export default function CompanionSelectScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const selectedClassId = useRunStore((state) => state.selectedClassId);
  const selectedCompanionIds = useRunStore((state) => state.selectedCompanionIds);
  const toggleSelectedCompanionId = useRunStore(
    (state) => state.toggleSelectedCompanionId
  );
  const createRunFromSetup = useRunStore((state) => state.createRunFromSetup);
  const isCreatingRun = useRunStore((state) => state.isCreatingRun);
  const setupError = useRunStore((state) => state.setupError);
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  useEffect(() => {
    if (!profile) {
      void refreshProfile();
    }
  }, [profile, refreshProfile]);

  const selectedClass = selectedClassId
    ? getClassDefinition(selectedClassId)
    : null;
  const activeTeamSynergies = selectedClassId
    ? getActiveTeamSynergyCardsForParty({
        heroClassId: selectedClassId,
        chosenCompanionIds: selectedCompanionIds,
        activeCompanionId: selectedCompanionIds[0] ?? null,
      })
    : [];
  const unlockedCompanions = companionDefinitions.filter((companion) =>
    profile?.unlockedCompanionIds.includes(companion.id)
  );
  const hasMultipleClassChoices = (profile?.unlockedClassIds.length ?? 0) > 1;

  useEffect(() => {
    if (!profile || profile.unlockedClassIds.length !== 1 || selectedClassId) {
      return;
    }

    const onlyUnlockedClassId = profile.unlockedClassIds[0] ?? null;

    if (onlyUnlockedClassId) {
      useRunStore.getState().setSelectedClassId(onlyUnlockedClassId);
    }
  }, [profile, selectedClassId]);

  if (!selectedClassId) {
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
              <Text style={styles.eyebrow}>RUN SETUP</Text>
              <Text style={styles.title}>Companion Select</Text>
              <Text style={styles.subtitle}>The climb needs a crew.</Text>
              <Text style={styles.body}>
                The opening paperwork is still settling. Give the tower a
                second, or head back and start the dive again.
              </Text>
            </View>
            <View style={styles.panel}>
              <View style={styles.actionGroup}>
                <GameButton
                  label="Return to Title"
                  onPress={() => {
                    router.push('/' as Href);
                  }}
                  variant="secondary"
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.eyebrow}>RUN SETUP</Text>
            <Text style={styles.title}>Choose Two Companions</Text>
            <Text style={styles.subtitle}>
              First pick is active. Second pick is reserve.
            </Text>
            <Text style={styles.body}>
              {hasMultipleClassChoices
                ? `Current class: ${selectedClass?.name ?? selectedClassId}. Choose exactly two companions to build your crew for the climb.`
                : `${selectedClass?.name ?? selectedClassId} is already carrying the ticket. Choose exactly two companions to decide how this climb feels.`}
            </Text>
          </View>

          {!profile ? (
            <View style={styles.panel}>
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.panelBody}>
                  Gathering your companion roster...
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Unlocked Companions</Text>
                <View style={styles.cardGrid}>
                  {unlockedCompanions.map((companion) => {
                    const selectedIndex = selectedCompanionIds.indexOf(
                      companion.id
                    );
                    const isSelected = selectedIndex >= 0;
                    const isDisabled =
                      !isSelected && selectedCompanionIds.length >= 2;
                    const bondLevel = profile.bondLevels[companion.id] ?? 1;
                    const activePerk = getCompanionSupportSummary(
                      companion.id,
                      'active',
                      bondLevel
                    );
                    const reservePerk = getCompanionSupportSummary(
                      companion.id,
                      'reserve',
                      bondLevel
                    );
                    const nextActivePerk = getNextCompanionSupportSummary(
                      companion.id,
                      'active',
                      bondLevel
                    );
                    const nextReservePerk = getNextCompanionSupportSummary(
                      companion.id,
                      'reserve',
                      bondLevel
                    );

                    return (
                      <Pressable
                        key={companion.id}
                        onPress={() => {
                          toggleSelectedCompanionId(companion.id);
                        }}
                        disabled={isDisabled}
                        style={({ pressed }) => [
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                          isDisabled && styles.optionCardDisabled,
                          pressed && !isDisabled && styles.optionCardPressed,
                        ]}
                      >
                        <Text style={styles.optionTitle}>{companion.name}</Text>
                        <Text style={styles.optionMeta}>
                          {companion.specialty}
                        </Text>
                        <Text style={styles.optionBody}>
                          {companion.description}
                        </Text>
                        <Text style={styles.optionEdge}>
                          Bond Level: {bondLevel}
                        </Text>
                        <Text style={styles.optionEdge}>
                          Active Perk: {activePerk.title}. {activePerk.summary}
                        </Text>
                        <Text style={styles.optionEdge}>
                          Reserve Perk: {reservePerk.title}. {reservePerk.summary}
                        </Text>
                        {nextActivePerk || nextReservePerk ? (
                          <Text style={styles.optionEdge}>
                            Next Milestone: {nextActivePerk?.summary ?? 'Maxed'} /{' '}
                            {nextReservePerk?.summary ?? 'Maxed'}
                          </Text>
                        ) : (
                          <Text style={styles.optionEdge}>
                            Bond Cap Reached: this companion is already at peak support.
                          </Text>
                        )}
                        <Text style={styles.optionEdge}>
                          Reward Edge: {getCompanionRewardEdgePreview(companion.id)}
                        </Text>
                        <Text style={styles.optionFooter}>
                          {selectedIndex === 0
                            ? 'Selected as active companion'
                            : selectedIndex === 1
                              ? 'Selected as reserve companion'
                              : isDisabled
                                ? 'Two companions already selected'
                                : 'Tap to add to the run'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Current Team</Text>
                <Text style={styles.panelBody}>
                  {selectedCompanionIds.length === 0
                    ? 'No companions selected yet.'
                    : selectedCompanionIds
                        .map((companionId, index) => {
                          const companion = companionDefinitions.find(
                            (item) => item.id === companionId
                          );
                          const role = index === 0 ? 'Active' : 'Reserve';
                          return `${role}: ${companion?.name ?? companionId}`;
                        })
                        .join(' | ')}
                </Text>
                <Text style={styles.hintText}>
                  Bonds carry forward between dives. The stronger those ties
                  get, the more they can shape your opening turns, recovery,
                  and party identity.
                </Text>
                <View style={styles.selectionDetailCard}>
                  <Text style={styles.selectionDetailTitle}>Team Synergies</Text>
                  {activeTeamSynergies.length > 0 ? (
                    activeTeamSynergies.map((synergy) => (
                      <View key={synergy.id} style={styles.selectionDetailItem}>
                        <Text style={styles.selectionDetailName}>
                          {synergy.title}
                        </Text>
                        <Text style={styles.selectionDetailBody}>
                          {synergy.summary}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.selectionDetailBody}>
                      No known team synergy is active yet. Selection order still
                      matters for class and lead-companion pairings.
                    </Text>
                  )}
                </View>
                {profile.unlockedCompanionIds.length < companionDefinitions.length ? (
                  <Text style={styles.hintText}>
                    Need more recruits? Spend breakroom chits in the hub to
                    requisition additional companions between dives.
                  </Text>
                ) : null}
                {setupError ? (
                  <Text style={styles.errorText}>{setupError}</Text>
                ) : null}
                <View style={styles.actionGroup}>
                  <GameButton
                    label={isCreatingRun ? 'Starting Dive...' : 'Start Dive'}
                    onPress={async () => {
                      try {
                        await createRunFromSetup();
                        router.replace('/run-map' as Href);
                      } catch {
                        // The store already captured the user-facing error state.
                      }
                    }}
                    disabled={selectedCompanionIds.length !== 2 || isCreatingRun}
                  />
                  <GameButton
                    label={
                      hasMultipleClassChoices
                        ? 'Back to Class Select'
                        : 'Review Assigned Role'
                    }
                    onPress={() => {
                      router.push('/class-select' as Href);
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
  cardGrid: {
    gap: spacing.sm + 2,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.xs + 2,
  },
  optionCardSelected: {
    borderColor: colors.accent,
  },
  optionCardDisabled: {
    opacity: 0.5,
  },
  optionCardPressed: {
    opacity: settings.reducedMotionEnabled ? 0.98 : 0.94,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(18, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(22, settings),
  },
  optionMeta: {
    color: colors.accent,
    fontSize: scaleFontSize(13, settings),
    fontWeight: '700',
    lineHeight: scaleLineHeight(18, settings),
  },
  optionBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(14, settings),
    lineHeight: scaleLineHeight(21, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  optionEdge: {
    color: colors.textSecondary,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
  },
  selectionDetailCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
  },
  selectionDetailTitle: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(15, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(20, settings),
  },
  selectionDetailItem: {
    gap: spacing.xs,
  },
  selectionDetailName: {
    color: colors.accent,
    fontSize: scaleFontSize(13, settings),
    fontWeight: '700',
    lineHeight: scaleLineHeight(18, settings),
  },
  selectionDetailBody: {
    color: colors.textMuted,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  optionFooter: {
    color: colors.textSubtle,
    fontSize: scaleFontSize(12, settings),
    fontWeight: '700',
    lineHeight: scaleLineHeight(18, settings),
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: scaleFontSize(13, settings),
    fontWeight: '700',
    lineHeight: scaleLineHeight(19, settings),
  },
  hintText: {
    color: colors.textSubtle,
    fontSize: scaleFontSize(13, settings),
    lineHeight: scaleLineHeight(19, settings),
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
  },
  actionGroup: {
    gap: spacing.sm + 2,
  },
  });
}
