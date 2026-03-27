import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
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
import { useProfileStore } from '@/src/state/profileStore';
import { useRunStore } from '@/src/state/runStore';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

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
              <Text style={styles.subtitle}>
                A class choice has to come first.
              </Text>
              <Text style={styles.body}>
                The setup store does not currently have a selected class. Head
                back to the previous step and pick one before choosing
                companions.
              </Text>
            </View>
            <View style={styles.panel}>
              <View style={styles.actionGroup}>
                <GameButton
                  label="Back to Class Select"
                  onPress={() => {
                    router.push('/class-select' as Href);
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
              Current class: {selectedClass?.name ?? selectedClassId}. Choose
              exactly two companions to build the first real persisted run.
            </Text>
          </View>

          {!profile ? (
            <View style={styles.panel}>
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.panelBody}>
                  Pulling your companion roster...
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
                      No authored team synergy is active yet. Selection order
                      matters for class-plus-lead combinations.
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
                    label="Back to Class Select"
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
    opacity: 0.94,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  optionMeta: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  optionBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  optionEdge: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
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
    fontSize: 15,
    fontWeight: '800',
  },
  selectionDetailItem: {
    gap: spacing.xs,
  },
  selectionDetailName: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  selectionDetailBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  optionFooter: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  hintText: {
    color: colors.textSubtle,
    fontSize: 13,
    lineHeight: 19,
  },
  actionGroup: {
    gap: spacing.sm + 2,
  },
});
