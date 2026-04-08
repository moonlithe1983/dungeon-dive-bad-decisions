import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { setUiSfxEnabledAsync } from '@/src/audio/ui-sfx';
import { trackAnalyticsEvent } from '@/src/analytics/client';
import { GameButton } from '@/src/components/game-button';
import { playUiHaptic } from '@/src/haptics/ui-haptics';
import {
  getCombatActionDisplayLabel,
  moveCombatAction,
} from '@/src/input/combat-input';
import { resetAllSaveDataAsync } from '@/src/save/reset';
import { useGameStore } from '@/src/state/gameStore';
import { useProfileStore } from '@/src/state/profileStore';
import { useRunStore } from '@/src/state/runStore';
import { useUxTelemetryStore } from '@/src/state/uxTelemetryStore';
import {
  getThemePresetDefinitions,
  getThemePresetName,
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { CombatActionId } from '@/src/types/combat';
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

type AudioVolumeKey =
  | 'masterVolume'
  | 'sfxVolume'
  | 'musicVolume'
  | 'voiceVolume'
  | 'ambientVolume';

const audioChannelRows: {
  key: AudioVolumeKey;
  label: string;
  description: string;
  liveNow: boolean;
}[] = [
  {
    key: 'masterVolume',
    label: 'Master',
    description: 'Overall mix level for the full audio stack.',
    liveNow: true,
  },
  {
    key: 'sfxVolume',
    label: 'Sound Effects',
    description: 'Route, reward, event, boss-warning, and recap cues.',
    liveNow: true,
  },
  {
    key: 'musicVolume',
    label: 'Music',
    description: 'Profile-ready channel for future score layers.',
    liveNow: false,
  },
  {
    key: 'voiceVolume',
    label: 'Voice',
    description: 'Profile-ready channel for future spoken lines or voiced narration.',
    liveNow: false,
  },
  {
    key: 'ambientVolume',
    label: 'Ambient',
    description: 'Profile-ready channel for future environmental and tower-bed layers.',
    liveNow: false,
  },
];

const nonAccessibilitySettingKeys = new Set<keyof ProfileSettingsState>([
  'themePreset',
  'profanityFilterEnabled',
]);

const audioSettingKeys = new Set<keyof ProfileSettingsState>([
  'sfxEnabled',
  'musicEnabled',
  'hapticsEnabled',
  'masterVolume',
  'sfxVolume',
  'musicVolume',
  'voiceVolume',
  'ambientVolume',
]);

export default function SettingsScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const updateSettings = useProfileStore((state) => state.updateSettings);
  const refreshBootstrap = useGameStore((state) => state.refreshBootstrap);
  const recordSettingsChange = useUxTelemetryStore(
    (state) => state.recordSettingsChange
  );
  const clearCurrentRunState = useRunStore((state) => state.clearCurrentRunState);
  const [isResettingSaves, setIsResettingSaves] = useState(false);
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  useEffect(() => {
    if (!profile) {
      void refreshProfile();
    }
  }, [profile, refreshProfile]);

  useEffect(() => {
    void trackAnalyticsEvent('meta_screen_viewed', { screen: 'settings' });
  }, []);

  const isLoading = !profile;

  const applySettings = async (nextSettings: Partial<ProfileSettingsState>) => {
    const entries = Object.entries(nextSettings).filter(
      ([, value]) => value !== undefined
    ) as [keyof ProfileSettingsState, ProfileSettingsState[keyof ProfileSettingsState]][];

    for (const [key, value] of entries) {
      if (settings[key] === value) {
        continue;
      }

      const accessibility = !nonAccessibilitySettingKeys.has(key);
      recordSettingsChange({
        key,
        accessibility,
      });
      void trackAnalyticsEvent('settings_changed', { key, value });

      if (accessibility) {
        void trackAnalyticsEvent('accessibility_setting_changed', { key, value });
      }

      if (audioSettingKeys.has(key)) {
        void trackAnalyticsEvent('audio_setting_changed', { key, value });
      }
    }

    void playUiHaptic('select', settings);
    await updateSettings(nextSettings);

    if (typeof nextSettings.sfxEnabled === 'boolean') {
      await setUiSfxEnabledAsync(nextSettings.sfxEnabled);
    }
  };

  const adjustAudioSetting = (key: AudioVolumeKey, delta: number) => {
    const nextValue = Math.max(0, Math.min(100, settings[key] + delta));

    if (nextValue === settings[key]) {
      return;
    }

    void applySettings({
      [key]: nextValue,
    } as Partial<ProfileSettingsState>);
  };

  const moveActionOrder = (
    actionId: CombatActionId,
    delta: -1 | 1
  ) => {
    const nextOrder = moveCombatAction(settings.combatActionOrder, actionId, delta);

    if (nextOrder.join('|') === settings.combatActionOrder.join('|')) {
      return;
    }

    void applySettings({
      combatActionOrder: nextOrder,
    });
  };

  const confirmDeleteAllSaveStates = async () => {
    if (isResettingSaves) {
      return;
    }

    setIsResettingSaves(true);

    try {
      await resetAllSaveDataAsync();
      clearCurrentRunState();
      await refreshBootstrap();
      Alert.alert(
        'Save states deleted',
        'Active runs, backup runs, archive history, unlocked codex progress, and profile stats were reset.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/' as Href);
            },
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'The save wipe did not finish cleanly.';

      Alert.alert('Delete failed', message);
    } finally {
      setIsResettingSaves(false);
    }
  };

  const handleDeleteAllSaveStates = () => {
    if (isResettingSaves) {
      return;
    }

    Alert.alert(
      'Delete all save states?',
      'This permanently removes the active run, emergency backup, archived run history, profile progression, and codex unlocks. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            void confirmDeleteAllSaveStates();
          },
        },
      ]
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
                <Text style={styles.panelTitle}>Audio & Haptics</Text>
                <Text style={styles.panelBody}>
                  Sound and haptic cues reinforce route, reward, event, boss, and recap states, but the UI still stays readable without either channel. The live build actively uses master and SFX levels now; music, voice, and ambient channels are profile-ready for future layers.
                </Text>
                <View style={styles.toggleList}>
                  <ToggleRow
                    label="Sound Effects"
                    description="Plays the short UI cue set for route picks, event confirms, reward moments, boss warnings, and defeat recap opens."
                    value={settings.sfxEnabled}
                    onPress={() => {
                      void applySettings({
                        sfxEnabled: !settings.sfxEnabled,
                      });
                    }}
                  />
                  <ToggleRow
                    label="Haptics"
                    description="Adds touch feedback to core button confirmations and important selection beats without making vibration mandatory."
                    value={settings.hapticsEnabled}
                    onPress={() => {
                      void applySettings({
                        hapticsEnabled: !settings.hapticsEnabled,
                      });
                    }}
                  />
                </View>
                <View style={styles.audioLevelsList}>
                  {audioChannelRows.map((channel) => (
                    <AudioLevelRow
                      key={channel.key}
                      label={channel.label}
                      description={channel.description}
                      value={settings[channel.key]}
                      liveNow={channel.liveNow}
                      onDecrease={() => {
                        adjustAudioSetting(channel.key, -10);
                      }}
                      onIncrease={() => {
                        adjustAudioSetting(channel.key, 10);
                      }}
                    />
                  ))}
                </View>
                <Text style={styles.panelHint}>
                  Critical cues remain non-spatial, so the live SFX set stays readable in mono playback too.
                </Text>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Controls & Input</Text>
                <Text style={styles.panelBody}>
                  Battle actions now use a profile-backed slot layout. Reorder them here, pick the dominant-hand bias for hint placement, and keep controller-style face-button cues visible even before full hardware controller support lands.
                </Text>
                <View style={styles.optionGrid}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Right-hand combat layout"
                    accessibilityState={{ selected: settings.dominantHand === 'right' }}
                    style={[
                      styles.optionCard,
                      settings.dominantHand === 'right'
                        ? styles.optionCardSelected
                        : null,
                    ]}
                    onPress={() => {
                      void applySettings({ dominantHand: 'right' });
                    }}
                  >
                    <Text style={styles.optionTitle}>Right-Hand Bias</Text>
                    <Text style={styles.optionBody}>
                      Places controller/input hint badges on the right side of combat actions.
                    </Text>
                    <Text style={styles.optionFooter}>
                      {settings.dominantHand === 'right'
                        ? 'Selected hand bias'
                        : 'Tap to prefer right-side hints'}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Left-hand combat layout"
                    accessibilityState={{ selected: settings.dominantHand === 'left' }}
                    style={[
                      styles.optionCard,
                      settings.dominantHand === 'left'
                        ? styles.optionCardSelected
                        : null,
                    ]}
                    onPress={() => {
                      void applySettings({ dominantHand: 'left' });
                    }}
                  >
                    <Text style={styles.optionTitle}>Left-Hand Bias</Text>
                    <Text style={styles.optionBody}>
                      Moves hint badges left so primary action guidance sits nearer the left thumb.
                    </Text>
                    <Text style={styles.optionFooter}>
                      {settings.dominantHand === 'left'
                        ? 'Selected hand bias'
                        : 'Tap to prefer left-side hints'}
                    </Text>
                  </Pressable>
                </View>
                <View style={styles.toggleList}>
                  <ToggleRow
                    label="Controller-Style Hints"
                    description="Shows A/X/Y/B bindings on combat actions using the current action slot order. This is controller-ready guidance, even though full hardware controller input is still future work."
                    value={settings.controllerHintsEnabled}
                    onPress={() => {
                      void applySettings({
                        controllerHintsEnabled: !settings.controllerHintsEnabled,
                      });
                    }}
                  />
                </View>
                <View style={styles.actionOrderList}>
                  {settings.combatActionOrder.map((actionId, index) => (
                    <View key={actionId} style={styles.actionOrderRow}>
                      <View style={styles.actionOrderCopy}>
                        <Text style={styles.toggleTitle}>
                          Slot {index + 1}: {getCombatActionDisplayLabel(actionId)}
                        </Text>
                        <Text style={styles.toggleBody}>
                          This slot becomes the {index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : 'fourth'} combat action in battle and receives the matching controller-style hint.
                        </Text>
                      </View>
                      <View style={styles.audioStepper}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Move ${getCombatActionDisplayLabel(actionId)} earlier`}
                          accessibilityHint={`Double tap to move ${getCombatActionDisplayLabel(actionId).toLowerCase()} up in the combat action order.`}
                          onPress={() => {
                            moveActionOrder(actionId, -1);
                          }}
                          style={styles.audioStepButton}
                        >
                          <Text style={styles.audioStepButtonText}>↑</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Move ${getCombatActionDisplayLabel(actionId)} later`}
                          accessibilityHint={`Double tap to move ${getCombatActionDisplayLabel(actionId).toLowerCase()} down in the combat action order.`}
                          onPress={() => {
                            moveActionOrder(actionId, 1);
                          }}
                          style={styles.audioStepButton}
                        >
                          <Text style={styles.audioStepButtonText}>↓</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
                <Text style={styles.panelHint}>
                  The battle screen reads this order directly now, so remapping changes the live combat stack immediately.
                </Text>
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
                    label="Sound Effects"
                    value={settings.sfxEnabled ? 'Enabled' : 'Disabled'}
                  />
                  <DetailLine
                    label="Master Volume"
                    value={`${settings.masterVolume}%`}
                  />
                  <DetailLine
                    label="SFX Volume"
                    value={`${settings.sfxVolume}%`}
                  />
                  <DetailLine
                    label="Music Volume"
                    value={`${settings.musicVolume}%`}
                  />
                  <DetailLine
                    label="Voice Volume"
                    value={`${settings.voiceVolume}%`}
                  />
                  <DetailLine
                    label="Ambient Volume"
                    value={`${settings.ambientVolume}%`}
                  />
                  <DetailLine
                    label="Haptics"
                    value={settings.hapticsEnabled ? 'Enabled' : 'Disabled'}
                  />
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
                  <DetailLine
                    label="Dominant Hand"
                    value={settings.dominantHand === 'left' ? 'Left' : 'Right'}
                  />
                  <DetailLine
                    label="Controller Hints"
                    value={settings.controllerHintsEnabled ? 'Enabled' : 'Disabled'}
                  />
                  <DetailLine
                    label="Combat Layout"
                    value={settings.combatActionOrder
                      .map(getCombatActionDisplayLabel)
                      .join(' -> ')}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Actions</Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Replay Interactive Tutorial"
                    onPress={() => {
                      router.push(
                        '/onboarding?mode=tutorial&returnTo=%2Fsettings' as Href
                      );
                    }}
                    variant="secondary"
                  />
                  <GameButton
                    label={
                      isResettingSaves
                        ? 'Deleting Save States...'
                        : 'Delete All Save States'
                    }
                    onPress={handleDeleteAllSaveStates}
                    variant="secondary"
                    disabled={isResettingSaves}
                  />
                  <GameButton
                    label="Employee Portal"
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

  function AudioLevelRow({
    label,
    description,
    value,
    liveNow,
    onDecrease,
    onIncrease,
  }: {
    label: string;
    description: string;
    value: number;
    liveNow: boolean;
    onDecrease: () => void;
    onIncrease: () => void;
  }) {
    return (
      <View style={styles.audioRow}>
        <View style={styles.audioCopy}>
          <View style={styles.audioHeadingRow}>
            <Text style={styles.toggleTitle}>{label}</Text>
            <Text style={styles.audioStatus}>{liveNow ? 'Live now' : 'Profile-ready'}</Text>
          </View>
          <Text style={styles.toggleBody}>{description}</Text>
        </View>
        <View style={styles.audioStepper}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Lower ${label} volume`}
            accessibilityHint={`Double tap to reduce ${label.toLowerCase()} volume by 10 percent.`}
            onPress={onDecrease}
            style={styles.audioStepButton}
          >
            <Text style={styles.audioStepButtonText}>-</Text>
          </Pressable>
          <Text style={styles.audioValue}>{value}%</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Raise ${label} volume`}
            accessibilityHint={`Double tap to raise ${label.toLowerCase()} volume by 10 percent.`}
            onPress={onIncrease}
            style={styles.audioStepButton}
          >
            <Text style={styles.audioStepButtonText}>+</Text>
          </Pressable>
        </View>
      </View>
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
    panelHint: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      lineHeight: scaleLineHeight(18, settings),
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
    audioLevelsList: {
      gap: spacing.sm,
    },
    actionOrderList: {
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
    audioRow: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    actionOrderRow: {
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
    actionOrderCopy: {
      flex: 1,
      gap: spacing.xs,
    },
    audioCopy: {
      gap: spacing.xs,
    },
    audioHeadingRow: {
      flexDirection: settings.textSize === 'largest' ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: settings.textSize === 'largest' ? 'flex-start' : 'center',
      gap: spacing.xs,
    },
    audioStatus: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    audioStepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    audioStepButton: {
      width: 40,
      minHeight: 40,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surfaceRaised,
      alignItems: 'center',
      justifyContent: 'center',
    },
    audioStepButtonText: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(18, settings),
      fontWeight: '900',
      lineHeight: scaleLineHeight(20, settings),
    },
    audioValue: {
      minWidth: 64,
      color: colors.textPrimary,
      fontSize: scaleFontSize(15, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
      textAlign: 'center',
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
