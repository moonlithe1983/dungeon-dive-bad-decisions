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
import { getClassActionKit } from '@/src/content/class-actions';
import { classDefinitions } from '@/src/content/classes';
import {
  COMPANY_NAME,
  TOWER_NAME,
  getClassNarrative,
  getCompanyDisasterSummary,
} from '@/src/content/company-lore';
import {
  buildMetaUpgradeCatalog,
  getMetaUpgradeRewardCurrencyBonus,
  getMetaUpgradeRewardHealingBonus,
} from '@/src/engine/meta/meta-upgrade-engine';
import { getRunHeroMaxHp } from '@/src/engine/run/run-hero';
import { useProfileStore } from '@/src/state/profileStore';
import { useRunStore } from '@/src/state/runStore';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

export default function ClassSelectScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const selectedClassId = useRunStore((state) => state.selectedClassId);
  const setSelectedClassId = useRunStore((state) => state.setSelectedClassId);

  useEffect(() => {
    if (!profile) {
      void refreshProfile();
    }
  }, [profile, refreshProfile]);

  const unlockedClasses = classDefinitions.filter((classDefinition) =>
    profile?.unlockedClassIds.includes(classDefinition.id)
  );
  const selectedClassDefinition =
    classDefinitions.find((item) => item.id === selectedClassId) ?? null;
  const metaUpgradeCatalog = profile ? buildMetaUpgradeCatalog(profile) : [];
  const rewardCurrencyBonus = profile
    ? getMetaUpgradeRewardCurrencyBonus(profile.metaUpgradeLevels)
    : 0;
  const rewardHealingBonus = profile
    ? getMetaUpgradeRewardHealingBonus(profile.metaUpgradeLevels)
    : 0;
  const selectedStartingHp =
    profile && selectedClassId
      ? getRunHeroMaxHp(selectedClassId, [], profile.metaUpgradeLevels)
      : null;
  const selectedNarrative = selectedClassId
    ? getClassNarrative(selectedClassId)
    : null;

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
            <Text style={styles.title}>Choose Your Class</Text>
            <Text style={styles.subtitle}>
              Pick the employee identity that has to survive the climb.
            </Text>
            <Text style={styles.body}>
              {getCompanyDisasterSummary()}
            </Text>
            <Text style={styles.body}>
              Your class choice decides who you are at {COMPANY_NAME}, why
              leadership needs you, who they are ready to blame, and what kind
              of disaster language you bring into the tower.
            </Text>
          </View>

          {!profile ? (
            <View style={styles.panel}>
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.panelBody}>
                  Pulling your unlocked class roster...
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Unlocked Classes</Text>
                <View style={styles.cardGrid}>
                  {unlockedClasses.map((classDefinition) => {
                    const isSelected = selectedClassId === classDefinition.id;

                    return (
                      <Pressable
                        key={classDefinition.id}
                        onPress={() => {
                          setSelectedClassId(classDefinition.id);
                        }}
                        style={({ pressed }) => [
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                          pressed && styles.optionCardPressed,
                        ]}
                      >
                        <Text style={styles.optionTitle}>
                          {classDefinition.name}
                        </Text>
                        <Text style={styles.optionRole}>
                          {getClassNarrative(classDefinition.id).roleLabel}
                        </Text>
                        <Text style={styles.optionMeta}>
                          {classDefinition.combatIdentity}
                        </Text>
                        <Text style={styles.optionBody}>
                          {classDefinition.description}
                        </Text>
                        {profile ? (
                          <Text style={styles.optionStat}>
                            Starting Max HP{' '}
                            {getRunHeroMaxHp(
                              classDefinition.id,
                              [],
                              profile.metaUpgradeLevels
                            )}
                          </Text>
                        ) : null}
                        <View style={styles.kitList}>
                          {getClassActionKit(classDefinition.id).actions.map((action) => (
                            <View
                              key={`${classDefinition.id}-${action.id}`}
                              style={styles.kitCard}
                            >
                              <Text style={styles.kitTitle}>{action.label}</Text>
                              <Text style={styles.kitBody}>{action.summary}</Text>
                            </View>
                          ))}
                        </View>
                        <Text style={styles.optionFooter}>
                          {isSelected ? 'Selected for this dive' : 'Tap to select'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Current Selection</Text>
                <Text style={styles.panelBody}>
                  {selectedClassId
                    ? selectedClassDefinition?.name ?? selectedClassId
                    : 'No class selected yet.'}
                </Text>
                {selectedClassDefinition ? (
                  <View style={styles.selectionDetailCard}>
                    <Text style={styles.selectionIdentity}>
                      {selectedClassDefinition.combatIdentity}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>Role: </Text>
                      {selectedNarrative?.roleLabel ?? 'Unknown'}
                    </Text>
                    {selectedStartingHp ? (
                      <Text style={styles.selectionActionLine}>
                        <Text style={styles.selectionActionLabel}>
                          Starting Max HP:{' '}
                        </Text>
                        {selectedStartingHp}
                      </Text>
                    ) : null}
                    {getClassActionKit(selectedClassDefinition.id).actions.map((action) => (
                      <Text
                        key={`selected-${action.id}`}
                        style={styles.selectionActionLine}
                      >
                        <Text style={styles.selectionActionLabel}>
                          {action.label}:{' '}
                        </Text>
                        {action.summary}
                      </Text>
                    ))}
                  </View>
                ) : null}
                {selectedNarrative ? (
                  <View style={styles.selectionDetailCard}>
                    <Text style={styles.selectionIdentity}>Narrative Briefing</Text>
                    <Text style={styles.selectionActionLine}>
                      {selectedNarrative.openingHook}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>
                        Leadership Broke:
                      </Text>{' '}
                      {selectedNarrative.leadershipFailure}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>Job On The Line:</Text>{' '}
                      {selectedNarrative.stake}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>Approval Trap:</Text>{' '}
                      {selectedNarrative.approvalConstraint}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>
                        Department Baggage:
                      </Text>{' '}
                      {selectedNarrative.rivalDepartments}
                    </Text>
                  </View>
                ) : null}
                {profile ? (
                  <View style={styles.selectionDetailCard}>
                    <Text style={styles.selectionIdentity}>Operations Forecast</Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>
                        Reward Chits:{' '}
                      </Text>
                      +{rewardCurrencyBonus} per claim
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>
                        Reward Healing:{' '}
                      </Text>
                      +{rewardHealingBonus} per claim
                    </Text>
                    {metaUpgradeCatalog.map((offer) => (
                      <Text
                        key={`ops-${offer.id}`}
                        style={styles.selectionActionLine}
                      >
                        <Text style={styles.selectionActionLabel}>
                          {offer.title}:
                        </Text>{' '}
                        Rank {offer.currentLevel}/{offer.maxLevel}.{' '}
                        {offer.currentEffectLabel}
                      </Text>
                    ))}
                  </View>
                ) : null}
                {profile.unlockedClassIds.length < classDefinitions.length ? (
                  <Text style={styles.hintText}>
                    Need more roles? Spend breakroom chits in the hub to requisition
                    more doomed employees before the next attempt up {TOWER_NAME}.
                  </Text>
                ) : null}
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Continue to Companions"
                    onPress={() => {
                      router.push('/companion-select' as Href);
                    }}
                    disabled={!selectedClassId}
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
  optionRole: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  optionBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  optionStat: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  kitList: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  kitCard: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  kitTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  kitBody: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  optionFooter: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  selectionDetailCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.md,
    gap: spacing.xs,
  },
  selectionIdentity: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  selectionActionLine: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  selectionActionLabel: {
    color: colors.textPrimary,
    fontWeight: '800',
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
