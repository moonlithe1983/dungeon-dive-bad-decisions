import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo } from 'react';
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

import { GameButton } from '@/src/components/game-button';
import { trackAnalyticsEvent } from '@/src/analytics/client';
import { getCompanionCardArtSource } from '@/src/assets/supplemental-art-sources';
import { playUiSfx } from '@/src/audio/ui-sfx';
import { getClassDefinition } from '@/src/content/classes';
import { companionDefinitions } from '@/src/content/companions';
import { createTicketBrief } from '@/src/content/company-lore';
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

function getCompanionPickPitch(companionId: string) {
  switch (companionId) {
    case 'facilities-goblin':
      return 'Pick this if you want the safest early floors and the strongest recovery swing.';
    case 'former-executive-assistant':
      return 'Pick this if you want cleaner first hits, sharper timing, and better boss reads.';
    case 'security-skeleton':
      return 'Pick this if you need a steadier defense and fewer ugly counter-hits.';
    case 'possessed-copier':
      return 'Pick this if you want chaotic pressure, duplicated problems, and a weirder snowball.';
    case 'disillusioned-temp':
      return 'Pick this if you want bargain survival tech and backup plans when runs turn ugly.';
    default:
      return 'Pick this if their perks solve a problem your class cannot solve alone.';
  }
}

function getCompanionFirstRoomPlan(companionId: string) {
  switch (companionId) {
    case 'facilities-goblin':
      return 'Start safer and recover faster through the first ugly exchange.';
    case 'former-executive-assistant':
      return 'Open with sharper damage and cleaner boss-reading pressure.';
    case 'security-skeleton':
      return 'Soak more mistakes and make incoming damage less punishing.';
    case 'possessed-copier':
      return 'Lean into unstable pressure and force stranger room swings.';
    case 'disillusioned-temp':
      return 'Play dirtier, stabilize later, and survive through backup plans.';
    default:
      return 'Solve a weakness your class cannot cover alone.';
  }
}

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

  useEffect(() => {
    void trackAnalyticsEvent('meta_screen_viewed', { screen: 'companion-select' });
  }, []);

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
  const selectionGuidance = useMemo(
    () => [
      {
        title: 'Pick your lead for the first room',
        body: 'Your first pick acts as lead. Choose the companion who solves your biggest early problem: staying alive, landing damage, or controlling the enemy.',
      },
      {
        title: 'Pick your reserve for the weak spot',
        body: 'Your second pick supports from reserve and can become the better floor-start lead later. Use this slot to cover what your class or first companion does poorly.',
      },
      {
        title: 'Compare what changes immediately',
        body: 'Focus on Active Perk, Reserve Perk, and Reward Edge below. Those tell you why this companion is stronger for this run than another option.',
      },
    ],
    []
  );
  const hasMultipleClassChoices = (profile?.unlockedClassIds.length ?? 0) > 1;
  const ticketBrief = useMemo(() => {
    if (!selectedClassId) {
      return null;
    }

    return createTicketBrief({
      classId: selectedClassId,
      floorIndex: 1,
    });
  }, [selectedClassId]);

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
                  label="Employee Portal"
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
            <Text style={styles.eyebrow}>FIRST SESSION</Text>
            <Text style={styles.title}>Build Your Crew</Text>
            <Text style={styles.subtitle}>
              First pick is active. Second pick is reserve.
            </Text>
            <Text style={styles.body}>
              {hasMultipleClassChoices
                ? `Current class: ${selectedClass?.name ?? selectedClassId}. Pick the two companions that make the first rooms feel strongest.`
                : `${selectedClass?.name ?? selectedClassId} is locked in. Pick one lead and one reserve to cover its weak spots and sharpen its strengths.`}
            </Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Crew Goal</Text>
            <View style={styles.selectionDetailCard}>
              <Text style={styles.selectionDetailTitle}>
                {selectedClass?.name ?? selectedClassId}
              </Text>
              <Text style={styles.selectionDetailBody}>
                Your first pick leads the opening room. Your second pick covers the
                blind spot you do not want to discover mid-fight.
              </Text>
              {ticketBrief ? (
                <Text style={styles.selectionDetailBody}>
                  First case file: {ticketBrief.subject}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>How To Choose Companions</Text>
            <View style={styles.selectionDetailCard}>
              {selectionGuidance.map((item) => (
                <View key={item.title} style={styles.selectionDetailItem}>
                  <Text style={styles.selectionDetailName}>{item.title}</Text>
                  <Text style={styles.selectionDetailBody}>{item.body}</Text>
                </View>
              ))}
            </View>
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
                <Text style={styles.panelBody}>
                  Each card should answer one question fast: why would you pick this
                  companion instead of another one?
                </Text>
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
                    const pickPitch = getCompanionPickPitch(companion.id);
                    const companionArtSource = getCompanionCardArtSource(
                      companion.id,
                      settings
                    );

                    return (
                      <Pressable
                        key={companion.id}
                        onPress={() => {
                          if (isDisabled) {
                            void playUiSfx('invalid-tap', settings);
                            return;
                          }

                          const nextSlot =
                            isSelected
                              ? 'removed'
                              : selectedCompanionIds.length === 0
                                ? 'active'
                                : 'reserve';

                          void trackAnalyticsEvent('companion_selected', {
                            companionId: companion.id,
                            classId: selectedClassId,
                            slot: nextSlot,
                            selected: !isSelected,
                          });
                          toggleSelectedCompanionId(companion.id);
                        }}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isSelected, disabled: isDisabled }}
                        style={({ pressed }) => [
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                          isDisabled && styles.optionCardDisabled,
                          pressed && !isDisabled && styles.optionCardPressed,
                        ]}
                      >
                        {companionArtSource ? (
                          <View style={styles.optionArtFrame}>
                            <Image
                              source={companionArtSource}
                              style={styles.optionArt}
                              resizeMode="contain"
                            />
                          </View>
                        ) : null}
                        <Text style={styles.optionTitle}>{companion.name}</Text>
                        <Text style={styles.optionMeta}>
                          {companion.specialty}
                        </Text>
                        <Text style={styles.optionPitch}>{pickPitch}</Text>
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
                {selectedCompanionIds[0] ? (
                  <View style={styles.selectionDetailCard}>
                    <Text style={styles.selectionDetailTitle}>First room plan</Text>
                    <Text style={styles.selectionDetailBody}>
                      {getCompanionFirstRoomPlan(selectedCompanionIds[0])}
                    </Text>
                    <Text style={styles.selectionDetailBody}>
                      Lead companion: {companionDefinitions.find((item) => item.id === selectedCompanionIds[0])?.name ?? selectedCompanionIds[0]}
                    </Text>
                    {selectedCompanionIds[1] ? (
                      <Text style={styles.selectionDetailBody}>
                        Reserve cover: {companionDefinitions.find((item) => item.id === selectedCompanionIds[1])?.name ?? selectedCompanionIds[1]}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                <Text style={styles.hintText}>
                  Bonds carry forward between dives. Stronger ties improve early turns, recovery, and role support.
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
                      No active team synergy yet. Selection order still matters for lead and reserve effects.
                    </Text>
                  )}
                </View>
                {profile.unlockedCompanionIds.length < companionDefinitions.length ? (
                  <Text style={styles.hintText}>
                    Need more recruits? Spend breakroom chits in the hub between dives.
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
                        : 'Back to Role Briefing'
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
  optionArtFrame: {
    minHeight: 112,
    borderRadius: 14,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  optionArt: {
    width: '100%',
    height: 92,
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
  optionPitch: {
    color: colors.textPrimary,
    fontSize: scaleFontSize(13, settings),
    fontWeight: '800',
    lineHeight: scaleLineHeight(19, settings),
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
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
  });
}
