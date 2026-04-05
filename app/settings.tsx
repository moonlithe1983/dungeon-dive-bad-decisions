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
import { useProfileStore } from '@/src/state/profileStore';
import {
  getThemePresetDefinitions,
  getThemePresetName,
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState, TextSizeSetting } from '@/src/types/profile';

const textSizeOptions: { id: TextSizeSetting; label: string; description: string }[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Base readable size with standard scaling.',
  },
  {
    id: 'large',
    label: 'Large',
    description: 'Bigger body and button text for easier scanning.',
  },
  {
    id: 'largest',
    label: 'Largest',
    description: 'Maximum readable text scale for the live UI.',
  },
];

type ToggleRowProps = {
  label: string;
  description: string;
  value: boolean;
  onPress: () => void;
};

export default function SettingsScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const updateSettings = useProfileStore((state) => state.updateSettings);
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  useEffect(() => {
    if (!profile) {
      void refreshProfile();
    }
  }, [profile, refreshProfile]);

  const isLoading = !profile;

  const applySettings = async (nextSettings: Partial<ProfileSettingsState>) => {
    await updateSettings(nextSettings);
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
            <Text style={styles.eyebrow}>SYSTEM</Text>
            <Text style={styles.title}>Accessibility & Theme</Text>
            <Text style={styles.subtitle}>
              Set the tower up so you can read it on your terms.
            </Text>
            <Text style={styles.body}>
              Pick a color preset, raise readability, reduce motion, keep words
              from splitting badly on Android, and turn on extra assistive cues
              before the next climb. These choices follow you through the main
              menus, the climb itself, and the game&apos;s archive screens.
            </Text>
          </View>

          {isLoading ? (
            <View style={styles.panel}>
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.panelBody}>Loading saved accessibility settings...</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Color Presets</Text>
                <Text style={styles.panelBody}>
                  All presets stay readable in dark conditions. ADA Contrast
                  pushes the strongest edge separation. Shared controls update
                  immediately, and your chosen theme carries across the game&apos;s
                  primary screens.
                </Text>
                <View style={styles.optionGrid}>
                  {getThemePresetDefinitions().map((preset) => {
                    const isSelected = settings.themePreset === preset.id;

                    return (
                      <Pressable
                        key={preset.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Theme preset ${preset.name}`}
                        style={[
                          styles.optionCard,
                          isSelected ? styles.optionCardSelected : null,
                        ]}
                        onPress={() => {
                          void applySettings({ themePreset: preset.id });
                        }}
                      >
                        <Text style={styles.optionTitle}>{preset.name}</Text>
                        <Text style={styles.optionBody}>{preset.description}</Text>
                        <View style={styles.swatchRow}>
                          <View
                            style={[
                              styles.swatch,
                              { backgroundColor: preset.palette.background },
                            ]}
                          />
                          <View
                            style={[
                              styles.swatch,
                              { backgroundColor: preset.palette.surfaceRaised },
                            ]}
                          />
                          <View
                            style={[
                              styles.swatch,
                              { backgroundColor: preset.palette.accent },
                            ]}
                          />
                        </View>
                        <Text style={styles.optionFooter}>
                          {isSelected ? 'Selected preset' : 'Tap to apply preset'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Readable Text</Text>
                <Text style={styles.panelBody}>
                  Text scaling and readability settings are applied to the live
                  interface and saved to your profile.
                </Text>
                <View style={styles.optionGrid}>
                  {textSizeOptions.map((option) => {
                    const isSelected = settings.textSize === option.id;

                    return (
                      <Pressable
                        key={option.id}
                        accessibilityRole="button"
                        accessibilityLabel={`Text size ${option.label}`}
                        style={[
                          styles.optionCard,
                          isSelected ? styles.optionCardSelected : null,
                        ]}
                        onPress={() => {
                          void applySettings({ textSize: option.id });
                        }}
                      >
                        <Text style={styles.optionTitle}>{option.label}</Text>
                        <Text style={styles.optionBody}>{option.description}</Text>
                        <Text style={styles.optionFooter}>
                          {isSelected ? 'Selected size' : 'Tap to use this size'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={styles.toggleList}>
                  <ToggleRow
                    label="Dyslexia-Friendly Spacing"
                    description="Adds more breathing room to line height and letter spacing in the main flow."
                    value={settings.dyslexiaAssistEnabled}
                    onPress={() => {
                      void applySettings({
                        dyslexiaAssistEnabled: !settings.dyslexiaAssistEnabled,
                      });
                    }}
                  />
                  <ToggleRow
                    label="Screen Reader Hints"
                    description="Adds clearer spoken hints to primary and secondary action buttons."
                    value={settings.screenReaderHintsEnabled}
                    onPress={() => {
                      void applySettings({
                        screenReaderHintsEnabled: !settings.screenReaderHintsEnabled,
                      });
                    }}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Contrast & Motion</Text>
                <View style={styles.toggleList}>
                  <ToggleRow
                    label="High Contrast"
                    description="Makes borders thicker, brightens separation, and increases button emphasis immediately."
                    value={settings.highContrastEnabled}
                    onPress={() => {
                      void applySettings({
                        highContrastEnabled: !settings.highContrastEnabled,
                      });
                    }}
                  />
                  <ToggleRow
                    label="Color Assist"
                    description="Shifts accent and alert colors toward safer, easier-to-distinguish combinations."
                    value={settings.colorAssistEnabled}
                    onPress={() => {
                      void applySettings({
                        colorAssistEnabled: !settings.colorAssistEnabled,
                      });
                    }}
                  />
                  <ToggleRow
                    label="Reduced Motion"
                    description="Removes navigation fades and button compression where possible."
                    value={settings.reducedMotionEnabled}
                    onPress={() => {
                      void applySettings({
                        reducedMotionEnabled: !settings.reducedMotionEnabled,
                      });
                    }}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Live Preview</Text>
                <Text style={styles.panelBody}>
                  This sample reflects your current settings right now, so each toggle has a visible result before the next run.
                </Text>
                <View style={styles.previewCard}>
                  <Text style={styles.previewEyebrow}>Preview Card</Text>
                  <Text style={styles.previewTitle}>Readable Warning</Text>
                  <Text style={styles.previewBody}>
                    Borders, spacing, color separation, and button emphasis should all change here when you adjust the controls above.
                  </Text>
                  <View style={styles.previewPillRow}>
                    <View style={styles.previewPill}>
                      <Text style={styles.previewPillText}>Accent</Text>
                    </View>
                    <View style={[styles.previewPill, styles.previewPillMuted]}>
                      <Text style={[styles.previewPillText, styles.previewPillTextMuted]}>
                        Secondary
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.previewButtonRow}>
                  <GameButton label="Primary Preview" onPress={() => undefined} />
                  <GameButton
                    label="Secondary Preview"
                    onPress={() => undefined}
                    variant="secondary"
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Current Profile</Text>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Theme"
                    value={getThemePresetName(settings.themePreset)}
                  />
                  <DetailLine label="Text Size" value={settings.textSize} />
                  <DetailLine
                    label="High Contrast"
                    value={settings.highContrastEnabled ? 'Enabled' : 'Disabled'}
                  />
                  <DetailLine
                    label="Color Assist"
                    value={settings.colorAssistEnabled ? 'Enabled' : 'Disabled'}
                  />
                  <DetailLine
                    label="Reduced Motion"
                    value={settings.reducedMotionEnabled ? 'Enabled' : 'Disabled'}
                  />
                  <DetailLine
                    label="Reader Hints"
                    value={
                      settings.screenReaderHintsEnabled ? 'Enabled' : 'Disabled'
                    }
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Actions</Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Return to Title"
                    onPress={() => {
                      router.push('/' as Href);
                    }}
                  />
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function ToggleRow({ label, description, value, onPress }: ToggleRowProps) {
    return (
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={label}
        accessibilityState={{ checked: value }}
        onPress={onPress}
        style={[styles.toggleRow, value ? styles.toggleRowSelected : null]}
      >
        <View style={styles.toggleCopy}>
          <Text style={styles.toggleTitle}>{label}</Text>
          <Text style={styles.toggleBody}>{description}</Text>
        </View>
        <View style={[styles.togglePill, value ? styles.togglePillOn : null]}>
          <Text style={styles.togglePillText}>{value ? 'On' : 'Off'}</Text>
        </View>
      </Pressable>
    );
  }
}

function DetailLine({ label, value }: { label: string; value: string }) {
  const { settings, colors } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <Text style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

function createStyles(settings: ProfileSettingsState, colors: ReturnType<typeof useAppTheme>['colors']) {
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
      letterSpacing: 1 + (settings.dyslexiaAssistEnabled ? 0.2 : 0),
    },
    title: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(32, settings),
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
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.18 : 0,
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
      lineHeight: scaleLineHeight(22, settings),
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
    optionGrid: {
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
      borderWidth: 2,
    },
    optionTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(16, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
    },
    optionBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    optionFooter: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(16, settings),
    },
    swatchRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingTop: spacing.xs,
    },
    swatch: {
      height: 18,
      flex: 1,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    toggleList: {
      gap: spacing.sm,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: spacing.lg,
    },
    toggleRowSelected: {
      borderColor: colors.accent,
    },
    toggleCopy: {
      flex: 1,
      gap: spacing.xs,
    },
    toggleTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(15, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
    },
    toggleBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    togglePill: {
      minWidth: 66,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceRaised,
      alignItems: 'center',
    },
    togglePillOn: {
      borderColor: colors.accent,
      backgroundColor: colors.accent,
    },
    togglePillText: {
      color: settings.highContrastEnabled ? '#0a0a0a' : colors.buttonText,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '900',
    },
    detailCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.xs + 2,
    },
    previewCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      borderWidth: settings.highContrastEnabled ? 2 : 1,
      borderColor: colors.borderStrong,
      gap: spacing.sm,
    },
    previewEyebrow: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    previewTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(17, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    previewBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(21, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    previewPillRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    previewPill: {
      borderRadius: 999,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.accent,
      borderWidth: settings.highContrastEnabled ? 2 : 1,
      borderColor: settings.highContrastEnabled ? colors.textPrimary : colors.accent,
    },
    previewPillMuted: {
      backgroundColor: colors.surfaceRaised,
      borderColor: colors.borderStrong,
    },
    previewPillText: {
      color: colors.buttonText,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
    },
    previewPillTextMuted: {
      color: colors.textPrimary,
    },
    previewButtonRow: {
      gap: spacing.sm,
    },
    detailLine: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
    },
    detailLabel: {
      color: colors.textPrimary,
      fontWeight: '800',
    },
    actionGroup: {
      gap: spacing.sm,
    },
  });
}
