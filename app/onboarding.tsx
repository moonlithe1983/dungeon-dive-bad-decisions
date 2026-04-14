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

function pickParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function OnboardingScreen() {
  const params = useLocalSearchParams<{
    mode?: string | string[];
    returnTo?: string | string[];
  }>();
  const updateOnboarding = useProfileStore((state) => state.updateOnboarding);
  const beginNewRunSetup = useRunStore((state) => state.beginNewRunSetup);
  const [isContinuing, setIsContinuing] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [tutorialSelections, setTutorialSelections] = useState<Record<string, string>>(
    {}
  );
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>('tutorial');
  const tutorialStartedRef = useRef(false);
  const { colors, settings } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );

  const modeParam = pickParam(params.mode);
  const isFirstRun = modeParam === 'first-run';
  const returnHref = useMemo(() => {
    const candidate = pickParam(params.returnTo);

    if (candidate === '/' || candidate === '/codex' || candidate === '/settings') {
      return candidate as Href;
    }

    return '/codex' as Href;
  }, [params.returnTo]);

  useEffect(() => {
    setExperienceMode(modeParam === 'packet' ? 'packet' : 'tutorial');
    setTutorialStepIndex(0);
    setTutorialSelections({});
    tutorialStartedRef.current = false;
  }, [modeParam]);

  useEffect(() => {
    void trackAnalyticsEvent('screen_viewed', {
      screen: 'onboarding',
      source: isFirstRun ? 'first-run' : 'replay',
      mode: experienceMode,
    });
  }, [experienceMode, isFirstRun]);

  useEffect(() => {
    if (experienceMode !== 'tutorial' || tutorialStartedRef.current) {
      return;
    }

    tutorialStartedRef.current = true;
    void trackAnalyticsEvent('tutorial_started', {
      source: isFirstRun ? 'first-run' : 'replay',
    });
  }, [experienceMode, isFirstRun]);

  const currentStep = onboardingTutorialSteps[tutorialStepIndex] ?? null;
  const selectedChoiceId = currentStep ? tutorialSelections[currentStep.id] : null;
  const selectedChoice =
    currentStep?.choices?.find((choice) => choice.id === selectedChoiceId) ?? null;
  const tutorialProgress = `${tutorialStepIndex + 1}/${onboardingTutorialSteps.length}`;

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

  const handleSelectChoice = (choiceId: string) => {
    if (!currentStep) {
      return;
    }

    const currentChoiceId = tutorialSelections[currentStep.id] ?? null;

    if (currentChoiceId === choiceId) {
      void playUiHaptic('error', settings);
      void playUiSfx('invalid-tap', settings);
      return;
    }

    setTutorialSelections((current) => ({
      ...current,
      [currentStep.id]: choiceId,
    }));

    void playUiHaptic('select', settings);
    void playUiSfx(
      currentStep.kind === 'battle' ? 'event-confirm' : 'route-select',
      settings
    );
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
            <Text style={styles.eyebrow}>FIRST SESSION</Text>
            <Text style={styles.title}>
              {experienceMode === 'tutorial'
                ? 'Live Orientation'
                : onboardingBriefingTitle}
            </Text>
            <Text style={styles.subtitle}>
              {experienceMode === 'tutorial'
                ? 'A short, choice-driven setup before the first real case file.'
                : onboardingBriefingSubtitle}
            </Text>
            <Text style={styles.body}>{getOnboardingHeroBody()}</Text>
            <View style={styles.calloutCard}>
              <Text style={styles.calloutTitle}>Before you start</Text>
              <Text style={styles.calloutBody}>
                Open Settings now if you want larger text, higher contrast,
                reduced motion, dyslexia assist, handedness changes, or quieter
                audio before the first live dive.
              </Text>
            </View>
            <View style={styles.actionGroup}>
              <GameButton
                label="Settings & Accessibility"
                onPress={() => {
                  router.push('/settings' as Href);
                }}
                variant="secondary"
              />
              <GameButton
                label={
                  experienceMode === 'tutorial'
                    ? 'Read Briefing Packet'
                    : 'Return to Live Orientation'
                }
                onPress={() => {
                  setExperienceMode((current) =>
                    current === 'tutorial' ? 'packet' : 'tutorial'
                  );
                }}
                variant="secondary"
              />
            </View>
          </View>

          {experienceMode === 'tutorial' && currentStep ? (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Orientation Roadmap</Text>
                <Text style={styles.panelBody}>
                  This should get you to the first real decision quickly: know
                  the job, read one room, win one exchange, take one reward, and
                  see why another run matters.
                </Text>
                <View style={styles.progressCard}>
                  <Text style={styles.progressEyebrow}>{currentStep.eyebrow}</Text>
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
                            handleSelectChoice(choice.id);
                          }}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                          accessibilityLabel={`${choice.title}. ${choice.description}. ${choice.preview}`}
                        >
                          <View style={styles.choiceHeader}>
                            <Text style={styles.choiceTitle}>{choice.title}</Text>
                            {isSelected ? (
                              <Text style={styles.choiceBadge}>Selected</Text>
                            ) : null}
                          </View>
                          <Text style={styles.choiceBody}>{choice.description}</Text>
                          <Text style={styles.choicePreview}>{choice.preview}</Text>
                          {isSelected ? (
                            <View style={styles.resolutionCard}>
                              <Text style={styles.resolutionTitle}>Why this works</Text>
                              <Text style={styles.resolutionBody}>
                                {choice.resolution}
                              </Text>
                            </View>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.calloutCard}>
                    <Text style={styles.calloutTitle}>What to notice</Text>
                    <Text style={styles.calloutBody}>
                      The first-session shell should explain the fantasy quickly,
                      surface accessibility early, and move you toward the first
                      real choice without burying the point under admin text.
                    </Text>
                  </View>
                )}

                <View style={styles.actionGroup}>
                  <GameButton
                    label={
                      isContinuing
                        ? tutorialStepIndex >= onboardingTutorialSteps.length - 1
                          ? isFirstRun
                            ? 'Opening Class Select...'
                            : 'Finishing Orientation...'
                          : 'Advancing...'
                        : tutorialStepIndex >= onboardingTutorialSteps.length - 1
                          ? isFirstRun
                            ? 'Finish Orientation'
                            : 'Finish Replay'
                          : 'Continue'
                    }
                    onPress={() => {
                      void handleAdvanceTutorial();
                    }}
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
              {onboardingBriefingSections.map((section) => (
                <View key={section.id} style={styles.panel}>
                  <Text style={styles.sectionEyebrow}>{section.eyebrow}</Text>
                  <Text style={styles.panelTitle}>{section.title}</Text>
                  <Text style={styles.sectionSummary}>{section.summary}</Text>
                  <Text style={styles.panelBody}>{section.body}</Text>
                </View>
              ))}

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Packet Use</Text>
                <Text style={styles.panelBody}>
                  This packet is reference material. The live orientation is the
                  main first-session path because the game should teach itself by
                  doing, not by asking the player to read all the lore first.
                </Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Return to Live Orientation"
                    onPress={() => {
                      setExperienceMode('tutorial');
                    }}
                  />
                  <GameButton
                    label={isFirstRun ? 'Back to Employee Portal' : getOnboardingReplayLabel()}
                    onPress={isFirstRun ? () => router.replace('/' as Href) : handleReturn}
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
    sectionEyebrow: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.8 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    sectionSummary: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
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
      borderRadius: 14,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.accent,
      gap: spacing.xs,
      marginTop: spacing.sm,
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
    calloutCard: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: 16,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      gap: spacing.xs,
    },
    calloutTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(14, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(18, settings),
    },
    calloutBody: {
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
