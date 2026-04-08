import { router, useLocalSearchParams, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { trackAnalyticsEvent } from '@/src/analytics/client';
import { playUiSfx } from '@/src/audio/ui-sfx';
import { GameButton } from '@/src/components/game-button';
import {
  getOnboardingHeroBody,
  getOnboardingReplayLabel,
  onboardingBriefingSections,
  onboardingBriefingSubtitle,
  onboardingBriefingTitle,
  onboardingTutorialSteps,
  onboardingTutorialSubtitle,
  onboardingTutorialTitle,
  type OnboardingTutorialStep,
} from '@/src/content/onboarding';
import { useResponsiveLayout } from '@/src/hooks/use-responsive-layout';
import { playUiHaptic } from '@/src/haptics/ui-haptics';
import { useProfileStore } from '@/src/state/profileStore';
import { useRunStore } from '@/src/state/runStore';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';

type ExperienceMode = 'tutorial' | 'packet';

export default function OnboardingScreen() {
  const params = useLocalSearchParams<{
    mode?: string | string[];
    returnTo?: string | string[];
  }>();
  const updateOnboarding = useProfileStore((state) => state.updateOnboarding);
  const totalRuns = useProfileStore((state) => state.profile?.stats.totalRuns ?? 0);
  const beginNewRunSetup = useRunStore((state) => state.beginNewRunSetup);
  const [isContinuing, setIsContinuing] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [showTutorialOverview, setShowTutorialOverview] = useState(true);
  const [showStepLesson, setShowStepLesson] = useState(false);
  const [tutorialSelections, setTutorialSelections] = useState<
    Record<string, string>
  >({});
  const { colors, settings } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );
  const hasTrackedTutorialStart = useRef(false);

  const modeParam = useMemo(() => {
    const candidate = Array.isArray(params.mode) ? params.mode[0] : params.mode;

    if (candidate === 'packet') {
      return 'packet';
    }

    return 'tutorial';
  }, [params.mode]);
  const isFirstRun = useMemo(() => {
    const candidate = Array.isArray(params.mode) ? params.mode[0] : params.mode;
    return candidate === 'first-run';
  }, [params.mode]);
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>(modeParam);
  const returnHref = useMemo(() => {
    const candidate = Array.isArray(params.returnTo)
      ? params.returnTo[0]
      : params.returnTo;

    if (
      candidate === '/' ||
      candidate === '/codex' ||
      candidate === '/settings'
    ) {
      return candidate as Href;
    }

    return '/codex' as Href;
  }, [params.returnTo]);

  useEffect(() => {
    setExperienceMode(modeParam);
    setTutorialStepIndex(0);
    setTutorialSelections({});
    setShowTutorialOverview(true);
    setShowStepLesson(false);
    hasTrackedTutorialStart.current = false;
  }, [modeParam]);

  useEffect(() => {
    if (experienceMode !== 'tutorial' || hasTrackedTutorialStart.current) {
      return;
    }

    hasTrackedTutorialStart.current = true;
    void trackAnalyticsEvent('tutorial_started', {
      source: isFirstRun ? 'first-run' : 'replay',
    });
  }, [experienceMode, isFirstRun]);

  useEffect(() => {
    setShowTutorialOverview(tutorialStepIndex === 0);
  }, [tutorialStepIndex]);

  const currentStep = onboardingTutorialSteps[tutorialStepIndex] ?? null;
  const selectedChoiceId = currentStep ? tutorialSelections[currentStep.id] : null;
  const selectedChoice =
    currentStep?.choices?.find((choice) => choice.id === selectedChoiceId) ?? null;
  const tutorialProgress = `${tutorialStepIndex + 1}/${onboardingTutorialSteps.length}`;

  useEffect(() => {
    if (!selectedChoice) {
      setShowStepLesson(false);
      return;
    }

    setShowStepLesson(isFirstRun && totalRuns === 0 && tutorialStepIndex < 2);
  }, [isFirstRun, selectedChoice, totalRuns, tutorialStepIndex]);

  const handleReturn = () => {
    router.replace(returnHref);
  };

  const finalizeTutorial = async () => {
    await trackAnalyticsEvent('tutorial_completed', {
      source: isFirstRun ? 'first-run' : 'replay',
      totalSteps: onboardingTutorialSteps.length,
    });

    if (isFirstRun) {
      await updateOnboarding({ narrativeIntroSeen: true });
      beginNewRunSetup();
      router.replace('/class-select' as Href);
      return;
    }

    router.replace(returnHref);
  };

  const handleAdvanceTutorial = async () => {
    if (!currentStep || isContinuing) {
      return;
    }

    if (currentStep.choices?.length && !selectedChoice) {
      void playUiHaptic('error', settings);
      void playUiSfx('invalid-tap', settings);
      return;
    }

    setIsContinuing(true);

    try {
      await trackAnalyticsEvent('tutorial_step_completed', {
        stepId: currentStep.id,
        stepKind: currentStep.kind,
        choiceId: selectedChoice?.id ?? null,
      });

      if (tutorialStepIndex >= onboardingTutorialSteps.length - 1) {
        await finalizeTutorial();
        return;
      }

      void playUiHaptic('success', settings);
      setTutorialStepIndex((current) => current + 1);
    } finally {
      setIsContinuing(false);
    }
  };

  const handleSelectChoice = (step: OnboardingTutorialStep, choiceId: string) => {
    const currentChoiceId = tutorialSelections[step.id] ?? null;

    if (currentChoiceId === choiceId) {
      void playUiHaptic('error', settings);
      void playUiSfx('invalid-tap', settings);
      return;
    }

    setTutorialSelections((current) => ({
      ...current,
      [step.id]: choiceId,
    }));

    void playUiHaptic('select', settings);
    void playUiSfx(step.kind === 'route' ? 'route-select' : 'event-confirm', settings);
  };

  const handleContinueFromPacket = async () => {
    if (isContinuing) {
      return;
    }

    setIsContinuing(true);

    try {
      if (isFirstRun) {
        await updateOnboarding({ narrativeIntroSeen: true });
        beginNewRunSetup();
        router.replace('/class-select' as Href);
        return;
      }

      router.replace(returnHref);
    } finally {
      setIsContinuing(false);
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
            <Text style={styles.eyebrow}>ORIENTATION</Text>
            <Text style={styles.title}>
              {experienceMode === 'tutorial'
                ? onboardingTutorialTitle
                : onboardingBriefingTitle}
            </Text>
            <Text style={styles.subtitle}>
              {experienceMode === 'tutorial'
                ? onboardingTutorialSubtitle
                : onboardingBriefingSubtitle}
            </Text>
            <Text style={styles.body}>{getOnboardingHeroBody()}</Text>
            <View style={styles.modeRow}>
              <ModeButton
                label="Interactive Tutorial"
                active={experienceMode === 'tutorial'}
                onPress={() => {
                  setExperienceMode('tutorial');
                }}
              />
              <ModeButton
                label="Briefing Packet"
                active={experienceMode === 'packet'}
                onPress={() => {
                  setExperienceMode('packet');
                }}
              />
            </View>
          </View>

          {experienceMode === 'tutorial' && currentStep ? (
            <>
              <View style={styles.panel}>
                <Pressable
                  style={styles.toggleRow}
                  onPress={() => {
                    setShowTutorialOverview((current) => !current);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Tutorial progress"
                  accessibilityHint={
                    showTutorialOverview
                      ? 'Double tap to collapse the tutorial overview.'
                      : 'Double tap to expand the tutorial overview.'
                  }
                  accessibilityState={{ expanded: showTutorialOverview }}
                >
                  <Text style={styles.panelTitle}>Tutorial Progress</Text>
                  <Text style={styles.toggleLabel}>
                    {showTutorialOverview ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
                {showTutorialOverview ? (
                  <Text style={styles.panelBody}>
                    One practice floor: route, fight, reward, event, then carry-forward.
                  </Text>
                ) : null}
                <View style={styles.progressCard}>
                  <Text style={styles.progressEyebrow}>
                    {currentStep.eyebrow}
                  </Text>
                  <Text style={styles.progressTitle}>{currentStep.title}</Text>
                  <Text style={styles.progressBody}>{currentStep.summary}</Text>
                  <Text style={styles.progressStep}>Step {tutorialProgress}</Text>
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{currentStep.title}</Text>
                <Text style={styles.panelBody}>{currentStep.body}</Text>
                <Text style={styles.instructionText}>{currentStep.instruction}</Text>

                {currentStep.choices?.length ? (
                  <View style={styles.choiceList}>
                    {currentStep.choices.map((choice) => {
                      const isSelected = selectedChoice?.id === choice.id;

                      return (
                        <Pressable
                          key={choice.id}
                          style={[
                            styles.choiceCard,
                            isSelected ? styles.choiceCardSelected : null,
                          ]}
                          onPress={() => {
                            handleSelectChoice(currentStep, choice.id);
                          }}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          accessibilityLabel={`${choice.title}. ${choice.description}. ${choice.preview}`}
                          accessibilityHint={
                            isSelected
                              ? 'Already selected. Use Continue to move to the next step.'
                              : 'Double tap to select this tutorial choice.'
                          }
                        >
                          <View style={styles.choiceHeader}>
                            <Text style={styles.choiceTitle}>{choice.title}</Text>
                            {isSelected ? (
                              <Text style={styles.choiceBadge}>Selected</Text>
                            ) : null}
                          </View>
                          <Text style={styles.choiceBody}>{choice.description}</Text>
                          <Text style={styles.choicePreview}>{choice.preview}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}

                {selectedChoice ? (
                  <View style={styles.resolutionCard}>
                    <Pressable
                      style={styles.toggleRow}
                      onPress={() => {
                        setShowStepLesson((current) => !current);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="Why it matters"
                      accessibilityHint={
                        showStepLesson
                          ? 'Double tap to collapse the lesson for this choice.'
                          : 'Double tap to expand the lesson for this choice.'
                      }
                      accessibilityState={{ expanded: showStepLesson }}
                    >
                      <Text style={styles.resolutionTitle}>Why It Matters</Text>
                      <Text style={styles.toggleLabel}>
                        {showStepLesson ? 'Hide' : 'Show'}
                      </Text>
                    </Pressable>
                    {showStepLesson ? (
                      <Text style={styles.resolutionBody}>
                        {selectedChoice.resolution}
                      </Text>
                    ) : (
                      <Text style={styles.panelBody}>
                        Open this if you want the short lesson tied to this practice choice.
                      </Text>
                    )}
                  </View>
                ) : null}

                <View style={styles.actionGroup}>
                  <GameButton
                    label={
                      isContinuing
                        ? tutorialStepIndex >= onboardingTutorialSteps.length - 1
                          ? 'Opening Class Assignment...'
                          : 'Advancing...'
                        : tutorialStepIndex >= onboardingTutorialSteps.length - 1
                          ? isFirstRun
                            ? 'Finish Orientation'
                            : 'Finish Tutorial'
                          : 'Continue'
                    }
                    onPress={() => {
                      void handleAdvanceTutorial();
                    }}
                    disabled={isContinuing}
                  />
                  <GameButton
                    label="Open Briefing Packet"
                    onPress={() => {
                      setExperienceMode('packet');
                    }}
                    variant="secondary"
                    disabled={isContinuing}
                  />
                  <GameButton
                    label={isFirstRun ? 'Back to Employee Portal' : 'Return'}
                    onPress={isFirstRun ? () => router.replace('/' as Href) : handleReturn}
                    variant="secondary"
                    disabled={isContinuing}
                  />
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>What This Covers</Text>
                <Text style={styles.panelBody}>
                  This packet walks through the story setup, the floor-by-floor run
                  structure, combat expectations, event and reward logic, and what
                  profile progress survives between dives.
                </Text>
              </View>

              {onboardingBriefingSections.map((section, index) => (
                <View key={section.id} style={styles.panel}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    <View style={styles.sectionHeading}>
                      <Text style={styles.sectionEyebrow}>{section.eyebrow}</Text>
                      <Text style={styles.sectionTitle}>{section.title}</Text>
                      <Text style={styles.sectionSummary}>{section.summary}</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionBody}>{section.body}</Text>
                </View>
              ))}

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Archive Note</Text>
                <Text style={styles.panelBody}>
                  This packet stays in the codex, and the interactive tutorial can
                  be replayed from settings or the archive whenever you want the
                  loop explained by doing instead of reading.
                </Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Open Interactive Tutorial"
                    onPress={() => {
                      setExperienceMode('tutorial');
                    }}
                  />
                  <GameButton
                    label={
                      isFirstRun
                        ? isContinuing
                          ? 'Opening Class Assignment...'
                          : 'Continue to Class Assignment'
                        : isContinuing
                          ? 'Returning...'
                          : 'Return to Archive'
                    }
                    onPress={() => {
                      void handleContinueFromPacket();
                    }}
                    disabled={isContinuing}
                    variant="secondary"
                  />
                  <GameButton
                    label="Employee Portal"
                    onPress={() => {
                      router.replace('/' as Href);
                    }}
                    variant="secondary"
                    disabled={isContinuing}
                  />
                </View>
                {!isFirstRun ? (
                  <Text style={styles.panelHint}>
                    {getOnboardingReplayLabel()} stays available from the codex.
                  </Text>
                ) : null}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function ModeButton({
    active,
    label,
    onPress,
  }: {
    active: boolean;
    label: string;
    onPress: () => void;
  }) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={label}
        accessibilityHint={
          active
            ? 'This onboarding mode is already open.'
            : 'Double tap to switch onboarding modes.'
        }
        onPress={onPress}
        style={[styles.modeButton, active ? styles.modeButtonSelected : null]}
      >
        <Text style={styles.modeButtonText}>{label}</Text>
      </Pressable>
    );
  }
}

function createStyles(
  settings: ProfileSettingsState,
  colors: ReturnType<typeof useAppTheme>['colors'],
  layout: ReturnType<typeof useResponsiveLayout>
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
      width: '100%',
      maxWidth: layout.maxContentWidth,
      alignSelf: 'center',
      paddingHorizontal: layout.shellPaddingHorizontal,
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
    modeRow: {
      flexDirection: layout.stackInlineHeader ? 'column' : 'row',
      gap: spacing.sm,
    },
    modeButton: {
      flex: layout.stackInlineHeader ? 0 : 1,
      minHeight: 46,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceRaised,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    modeButtonSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    modeButtonText: {
      color: colors.buttonText,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textAlign: 'center',
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
      fontSize: scaleFontSize(18, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    panelBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(21, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    panelHint: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      lineHeight: scaleLineHeight(18, settings),
    },
    progressCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs + 2,
    },
    progressEyebrow: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
      flex: 1,
    },
    progressTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(18, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    progressBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    progressStep: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(16, settings),
    },
    instructionText: {
      color: colors.accent,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(19, settings),
    },
    choiceList: {
      gap: spacing.sm + 2,
    },
    choiceCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: spacing.lg,
      gap: spacing.xs + 2,
    },
    choiceCardSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.surfaceRaised,
    },
    choiceHeader: {
      flexDirection: layout.stackInlineHeader ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: layout.stackInlineHeader ? 'flex-start' : 'center',
      gap: spacing.sm,
    },
    choiceTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(16, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
      flex: 1,
    },
    choiceBadge: {
      color: colors.buttonText,
      backgroundColor: colors.accent,
      fontSize: scaleFontSize(11, settings),
      fontWeight: '900',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      overflow: 'hidden',
    },
    choiceBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    choicePreview: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    resolutionCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.accent,
      gap: spacing.xs + 2,
    },
    toggleRow: {
      flexDirection: layout.stackInlineHeader ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: layout.stackInlineHeader ? 'flex-start' : 'center',
      gap: spacing.sm,
      minHeight: 48,
    },
    toggleLabel: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    resolutionTitle: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    resolutionBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    sectionNumber: {
      minWidth: 36,
      color: colors.accent,
      fontSize: scaleFontSize(22, settings),
      fontWeight: '900',
      lineHeight: scaleLineHeight(26, settings),
    },
    sectionHeading: {
      flex: 1,
      gap: spacing.xs,
    },
    sectionEyebrow: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.8 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(18, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    sectionSummary: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    sectionBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(21, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    actionGroup: {
      gap: spacing.sm + 2,
    },
  });
}
