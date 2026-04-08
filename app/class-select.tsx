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

import { GameButton } from '@/src/components/game-button';
import {
  getClassEmblemAlignmentLabel,
  getClassEmblemSource,
} from '@/src/assets/supplemental-art-sources';
import { playUiSfx } from '@/src/audio/ui-sfx';
import { getClassActionKit } from '@/src/content/class-actions';
import { classDefinitions } from '@/src/content/classes';
import {
  COMPANY_NAME,
  TOWER_NAME,
  createTicketBrief,
  getClassNarrative,
  getCompanyDisasterSummary,
} from '@/src/content/company-lore';
import {
  buildMetaUpgradeCatalog,
  getMetaUpgradeRewardCurrencyBonus,
  getMetaUpgradeRewardHealingBonus,
} from '@/src/engine/meta/meta-upgrade-engine';
import { getRunHeroMaxHp } from '@/src/engine/run/run-hero';
import { getClassTruthRouteSummary } from '@/src/engine/retention/retention-engine';
import { useProfileStore } from '@/src/state/profileStore';
import { useRunStore } from '@/src/state/runStore';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';

export default function ClassSelectScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const selectedClassId = useRunStore((state) => state.selectedClassId);
  const setSelectedClassId = useRunStore((state) => state.setSelectedClassId);
  const [showRoleDetails, setShowRoleDetails] = useState(false);
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  useEffect(() => {
    if (!profile) {
      void refreshProfile();
    }
  }, [profile, refreshProfile]);

  const unlockedClasses = classDefinitions.filter((classDefinition) =>
    profile?.unlockedClassIds.includes(classDefinition.id)
  );
  const hasMultipleClassChoices = unlockedClasses.length > 1;
  const assignedClassDefinition = unlockedClasses[0] ?? null;
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
    if (!profile || unlockedClasses.length !== 1) {
      return;
    }

    const onlyUnlockedClassId = unlockedClasses[0]?.id ?? null;

    if (onlyUnlockedClassId && selectedClassId !== onlyUnlockedClassId) {
      setSelectedClassId(onlyUnlockedClassId);
    }
  }, [profile, selectedClassId, setSelectedClassId, unlockedClasses]);

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
            <Text style={styles.title}>
              {hasMultipleClassChoices ? 'Choose Your Class' : 'Assigned Role'}
            </Text>
            <Text style={styles.subtitle}>
              {hasMultipleClassChoices
                ? 'Pick the role you want to pilot through the climb.'
                : `${assignedClassDefinition?.name ?? 'IT Support'} drew the short straw.`}
            </Text>
            <Text style={styles.body}>
              {hasMultipleClassChoices
                ? `Your class sets your starting health, action kit, and the kind of trouble you solve best inside ${COMPANY_NAME}.`
                : `${COMPANY_NAME} already picked the department. Read the role fast, then choose the crew that supports it.`}
            </Text>
          </View>

          {!profile ? (
            <View style={styles.panel}>
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.panelBody}>
                  Checking your personnel roster...
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>
                  {hasMultipleClassChoices ? 'Unlocked Classes' : 'Assigned Class'}
                </Text>
                <View style={styles.cardGrid}>
                  {unlockedClasses.map((classDefinition) => {
                    const isSelected = selectedClassId === classDefinition.id;
                    const emblemSource = getClassEmblemSource(
                      classDefinition.id,
                      settings
                    );
                    const emblemLabel = getClassEmblemAlignmentLabel(
                      classDefinition.id
                    );

                    return (
                      <Pressable
                        key={classDefinition.id}
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: isSelected,
                          disabled: !hasMultipleClassChoices,
                        }}
                        onPress={() => {
                          if (!hasMultipleClassChoices) {
                            void playUiSfx('invalid-tap', settings);
                            return;
                          }

                          setSelectedClassId(classDefinition.id);
                        }}
                        style={({ pressed }) => [
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                          pressed && hasMultipleClassChoices && styles.optionCardPressed,
                        ]}
                      >
                        {emblemSource ? (
                          <View style={styles.optionArtFrame}>
                            <Image
                              source={emblemSource}
                              style={styles.optionArt}
                              resizeMode="contain"
                            />
                          </View>
                        ) : null}
                        <Text style={styles.optionTitle}>
                          {classDefinition.name}
                        </Text>
                        <Text style={styles.optionRole}>
                          {getClassNarrative(classDefinition.id).roleLabel}
                        </Text>
                        {emblemLabel ? (
                          <Text style={styles.optionTrack}>{emblemLabel}</Text>
                        ) : null}
                        <Text style={styles.optionTrack}>
                          {getClassTruthRouteSummary(classDefinition.id).shortLabel}: {getClassTruthRouteSummary(classDefinition.id).label}
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
                          {hasMultipleClassChoices
                            ? isSelected
                              ? 'Selected for this dive'
                              : 'Tap to select'
                            : 'Assigned for this dive'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>
                  {hasMultipleClassChoices ? 'Current Selection' : 'Role Briefing'}
                </Text>
                {selectedClassDefinition ? (
                  <View style={styles.selectionDetailCard}>
                    {getClassEmblemSource(selectedClassDefinition.id, settings) ? (
                      <View style={styles.selectionArtRow}>
                        <View style={styles.selectionArtFrame}>
                          <Image
                            source={getClassEmblemSource(
                              selectedClassDefinition.id,
                              settings
                            )!}
                            style={styles.selectionArt}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.selectionArtCopy}>
                          <Text style={styles.selectionIdentity}>
                            {selectedClassDefinition.name}
                          </Text>
                          {getClassEmblemAlignmentLabel(selectedClassDefinition.id) ? (
                            <Text style={styles.selectionTrack}>
                              {getClassEmblemAlignmentLabel(selectedClassDefinition.id)}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.selectionIdentity}>
                        {selectedClassDefinition.name}
                      </Text>
                    )}
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>Role: </Text>
                      {selectedNarrative?.roleLabel ?? 'Unknown'}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>Truth Route: </Text>
                      {getClassTruthRouteSummary(selectedClassDefinition.id).label}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      {getClassTruthRouteSummary(selectedClassDefinition.id).body}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      {selectedNarrative?.openingHook ?? getCompanyDisasterSummary()}
                    </Text>
                    {ticketBrief ? (
                      <>
                        <Text style={styles.selectionActionLine}>
                          <Text style={styles.selectionActionLabel}>Current Ticket: </Text>
                          {ticketBrief.ticketId}
                        </Text>
                        <Text style={styles.selectionActionLine}>
                          <Text style={styles.selectionActionLabel}>Subject: </Text>
                          {ticketBrief.subject}
                        </Text>
                        <Text style={styles.selectionActionLine}>
                          <Text style={styles.selectionActionLabel}>Escalation Track: </Text>
                          {ticketBrief.escalationTrack}
                        </Text>
                      </>
                    ) : null}
                    {selectedStartingHp ? (
                      <Text style={styles.selectionActionLine}>
                        <Text style={styles.selectionActionLabel}>
                          Starting Max HP:{' '}
                        </Text>
                        {selectedStartingHp}
                      </Text>
                    ) : null}
                    {getClassActionKit(selectedClassDefinition.id).actions.slice(0, 2).map((action) => (
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
                <Pressable
                  style={styles.toggleRow}
                  onPress={() => {
                    setShowRoleDetails((current) => !current);
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.panelTitle}>Role Details</Text>
                  <Text style={styles.toggleLabel}>
                    {showRoleDetails ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
                {showRoleDetails && selectedNarrative ? (
                  <View style={styles.selectionDetailCard}>
                    {ticketBrief ? (
                      <>
                        <Text style={styles.selectionActionLine}>
                          <Text style={styles.selectionActionLabel}>Filed By:</Text>{' '}
                          {ticketBrief.filedBy}
                        </Text>
                        <Text style={styles.selectionActionLine}>
                          <Text style={styles.selectionActionLabel}>Current Desk:</Text>{' '}
                          {ticketBrief.currentOwner}
                        </Text>
                        <Text style={styles.selectionActionLine}>
                          <Text style={styles.selectionActionLabel}>Why It Matters:</Text>{' '}
                          {ticketBrief.summary}
                        </Text>
                      </>
                    ) : null}
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>What Leadership Broke:</Text>{' '}
                      {selectedNarrative.leadershipFailure}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>What It Costs You:</Text>{' '}
                      {selectedNarrative.stake}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>What Slows You Down:</Text>{' '}
                      {selectedNarrative.approvalConstraint}
                    </Text>
                    <Text style={styles.selectionActionLine}>
                      <Text style={styles.selectionActionLabel}>Run Perks:</Text>{' '}
                      +{rewardCurrencyBonus} chits, +{rewardHealingBonus} healing per reward
                    </Text>
                    {metaUpgradeCatalog.slice(0, 2).map((offer) => (
                      <Text
                        key={`ops-${offer.id}`}
                        style={styles.selectionActionLine}
                      >
                        <Text style={styles.selectionActionLabel}>
                          {offer.title}:
                        </Text>{' '}
                        {offer.currentEffectLabel}
                      </Text>
                    ))}
                  </View>
                ) : null}
                {profile.unlockedClassIds.length < classDefinitions.length ? (
                  <Text style={styles.hintText}>
                    Unlock more departments from the hub before future climbs up {TOWER_NAME}.
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
                    label="Employee Portal"
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
      width: 72,
      height: 72,
      borderRadius: 18,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.sm,
      marginBottom: spacing.xs,
    },
    optionArt: {
      width: '100%',
      height: '100%',
    },
    optionCardSelected: {
      borderColor: colors.accent,
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
    optionRole: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      letterSpacing: 0.5 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
      textTransform: 'uppercase',
    },
    optionTrack: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(17, settings),
    },
    optionBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(21, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    optionStat: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(19, settings),
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
      fontSize: scaleFontSize(13, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(18, settings),
    },
    kitBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(12, settings),
      lineHeight: scaleLineHeight(18, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    optionFooter: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(18, settings),
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
    selectionArtRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginBottom: spacing.xs,
    },
    selectionArtFrame: {
      width: 70,
      height: 70,
      borderRadius: 18,
      backgroundColor: colors.surfaceRaised,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.sm,
    },
    selectionArt: {
      width: '100%',
      height: '100%',
    },
    selectionArtCopy: {
      flex: 1,
      gap: spacing.xs,
    },
    selectionIdentity: {
      color: colors.accent,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(18, settings),
    },
    selectionTrack: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(17, settings),
    },
    selectionActionLine: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    selectionActionLabel: {
      color: colors.textPrimary,
      fontWeight: '800',
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
