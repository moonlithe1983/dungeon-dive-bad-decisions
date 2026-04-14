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

import { trackAnalyticsEvent } from '@/src/analytics/client';
import {
  getClassEmblemAlignmentLabel,
  getClassEmblemSource,
} from '@/src/assets/supplemental-art-sources';
import { playUiSfx } from '@/src/audio/ui-sfx';
import { GameButton } from '@/src/components/game-button';
import { getClassActionKit } from '@/src/content/class-actions';
import { classDefinitions, getClassUnlockCost } from '@/src/content/classes';
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

function getClassPickPitch(classId: string) {
  switch (classId) {
    case 'it-support':
      return 'Pick this if you want the cleanest control tools and the safest first learning curve.';
    case 'sales-rep':
      return 'Pick this if you want faster kills, riskier tempo, and a more aggressive room plan.';
    case 'customer-service-rep':
      return 'Pick this if you want steadier health, better recovery, and fewer panic turns.';
    case 'intern':
      return 'Pick this if you want chaos, scaling, and a stranger run every time.';
    case 'paralegal':
      return 'Pick this if you want precise punishment windows and cleaner technical play.';
    default:
      return 'Pick this if its strengths match how you want the run to feel.';
  }
}

export default function ClassSelectScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const selectedClassId = useRunStore((state) => state.selectedClassId);
  const setSelectedClassId = useRunStore((state) => state.setSelectedClassId);
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  useEffect(() => {
    if (!profile) {
      void refreshProfile();
    }
  }, [profile, refreshProfile]);

  useEffect(() => {
    void trackAnalyticsEvent('screen_viewed', {
      screen: 'class-select',
      unlockedClasses: profile?.unlockedClassIds.length ?? 0,
    });
  }, [profile?.unlockedClassIds.length]);

  const unlockedClassIds = profile?.unlockedClassIds ?? [];
  const unlockedClasses = classDefinitions.filter((classDefinition) =>
    unlockedClassIds.includes(classDefinition.id)
  );
  const hasMultipleClassChoices = unlockedClasses.length > 1;
  const selectableClassId =
    selectedClassId && unlockedClassIds.includes(selectedClassId)
      ? selectedClassId
      : unlockedClasses[0]?.id ?? null;
  const selectedClass = classDefinitions.find((item) => item.id === selectableClassId) ?? null;
  const lockedClasses = classDefinitions.filter(
    (classDefinition) => !unlockedClassIds.includes(classDefinition.id)
  );

  useEffect(() => {
    if (!selectableClassId) {
      return;
    }

    if (selectedClassId !== selectableClassId) {
      setSelectedClassId(selectableClassId);
    }
  }, [selectableClassId, selectedClassId, setSelectedClassId]);

  if (!profile) {
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
              <Text style={styles.title}>Choose Your Department</Text>
              <Text style={styles.subtitle}>Loading the available survivors.</Text>
            </View>
            <View style={styles.panel}>
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.panelBody}>Checking your starting roster...</Text>
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
            <Text style={styles.title}>
              {hasMultipleClassChoices ? 'Choose Your Department' : 'Your Starting Department'}
            </Text>
            <Text style={styles.subtitle}>
              {hasMultipleClassChoices
                ? 'Pick the class that makes the first run feel the way you want it to feel.'
                : 'You are starting with one department. More open up as the roster grows.'}
            </Text>
            <Text style={styles.body}>
              Classes should feel like distinct playstyles, not paperwork. Pick the one
              whose strengths match how you want to solve rooms.
            </Text>
          </View>

          <View style={styles.panel}>
            <Text style={styles.panelTitle}>
              {hasMultipleClassChoices ? 'Available Now' : 'Start Here'}
            </Text>
            <Text style={styles.panelBody}>
              Each card should answer the same question quickly: why would you pick this
              class over another one?
            </Text>
            <View style={styles.cardGrid}>
              {unlockedClasses.map((classDefinition) => {
                const isSelected = selectableClassId === classDefinition.id;
                const emblemSource = getClassEmblemSource(classDefinition.id, settings);
                const actionKit = getClassActionKit(classDefinition.id).actions.slice(0, 2);

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

                      void trackAnalyticsEvent('class_selected', {
                        classId: classDefinition.id,
                        selected: true,
                      });
                      setSelectedClassId(classDefinition.id);
                    }}
                    style={({ pressed }) => [
                      styles.optionCard,
                      isSelected ? styles.optionCardSelected : null,
                      pressed && hasMultipleClassChoices ? styles.optionCardPressed : null,
                    ]}
                  >
                    <View style={styles.optionHeader}>
                      {emblemSource ? (
                        <View style={styles.optionArtFrame}>
                          <Image
                            source={emblemSource}
                            style={styles.optionArt}
                            resizeMode="contain"
                          />
                        </View>
                      ) : null}
                      <View style={styles.optionHeaderCopy}>
                        <Text style={styles.optionTitle}>{classDefinition.name}</Text>
                        <Text style={styles.optionMeta}>{classDefinition.combatIdentity}</Text>
                        <Text style={styles.optionTrack}>
                          {getClassEmblemAlignmentLabel(classDefinition.id) ??
                            getClassTruthRouteSummary(classDefinition.id).shortLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.optionPitch}>
                      {getClassPickPitch(classDefinition.id)}
                    </Text>
                    <Text style={styles.optionBody}>{classDefinition.description}</Text>
                    <View style={styles.kitList}>
                      {actionKit.map((action) => (
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
                          ? 'Selected for this run'
                          : 'Tap to choose this class'
                        : 'Starting class for the first case file'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {selectedClass ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Why this class is live now</Text>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>{selectedClass.name}</Text>
                <Text style={styles.summaryBody}>
                  {getClassPickPitch(selectedClass.id)}
                </Text>
                <Text style={styles.summaryDetail}>
                  Truth route: {getClassTruthRouteSummary(selectedClass.id).label}
                </Text>
                <Text style={styles.summaryDetail}>
                  First-room identity: {selectedClass.combatIdentity}
                </Text>
              </View>
              <View style={styles.actionGroup}>
                <GameButton
                  label="Continue to Crew"
                  onPress={() => {
                    router.push('/companion-select' as Href);
                  }}
                  disabled={!selectableClassId}
                />
                <GameButton
                  label="Back to Employee Portal"
                  onPress={() => {
                    router.push('/' as Href);
                  }}
                  variant="secondary"
                />
              </View>
            </View>
          ) : null}

          {lockedClasses.length > 0 ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>More Departments Later</Text>
              <Text style={styles.panelBody}>
                These are future class directions. They matter because replay should come
                from genuinely different playstyles, not from repeating the same route with
                a bigger number.
              </Text>
              <View style={styles.lockedList}>
                {lockedClasses.map((classDefinition) => (
                  <View key={`locked-${classDefinition.id}`} style={styles.lockedCard}>
                    <Text style={styles.lockedTitle}>{classDefinition.name}</Text>
                    <Text style={styles.lockedMeta}>
                      {classDefinition.combatIdentity} - unlock for{' '}
                      {getClassUnlockCost(classDefinition.id)} chits
                    </Text>
                    <Text style={styles.lockedBody}>
                      {getClassPickPitch(classDefinition.id)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
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
      gap: spacing.sm,
    },
    optionCardSelected: {
      borderColor: colors.accent,
    },
    optionCardPressed: {
      opacity: settings.reducedMotionEnabled ? 0.98 : 0.94,
    },
    optionHeader: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'center',
    },
    optionHeaderCopy: {
      flex: 1,
      gap: spacing.xs,
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
    },
    optionArt: {
      width: '100%',
      height: '100%',
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
    optionTrack: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(17, settings),
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
    kitList: {
      gap: spacing.xs,
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
    },
    summaryCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: spacing.md,
      gap: spacing.xs,
    },
    summaryTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(16, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(21, settings),
    },
    summaryBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    summaryDetail: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    lockedList: {
      gap: spacing.sm,
    },
    lockedCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: spacing.md,
      gap: spacing.xs,
      opacity: 0.9,
    },
    lockedTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(15, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
    },
    lockedMeta: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(17, settings),
    },
    lockedBody: {
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
