import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameButton } from '@/src/components/game-button';
import { useGameStore } from '@/src/state/gameStore';
import { useProfileStore } from '@/src/state/profileStore';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';

type SettingsLoadStatus = 'idle' | 'loading' | 'ready' | 'error';

type SettingRowProps = {
  label: string;
  description: string;
  value: boolean;
  disabled: boolean;
  onValueChange: (value: boolean) => void;
};

export default function SettingsScreen() {
  const profile = useProfileStore((state) => state.profile);
  const refreshProfile = useProfileStore((state) => state.refreshProfile);
  const bootstrapProfile = useGameStore((state) => state.profile);
  const bootstrapStatus = useGameStore((state) => state.bootstrapStatus);
  const bootstrapError = useGameStore((state) => state.error);
  const initializeApp = useGameStore((state) => state.initializeApp);
  const refreshBootstrap = useGameStore((state) => state.refreshBootstrap);
  const updateSettings = useProfileStore((state) => state.updateSettings);
  const [loadStatus, setLoadStatus] = useState<SettingsLoadStatus>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<keyof ProfileSettingsState | null>(
    null
  );
  const resolvedProfile = profile ?? bootstrapProfile;

  useEffect(() => {
    if (bootstrapStatus === 'idle') {
      void initializeApp();
    }
  }, [bootstrapStatus, initializeApp]);

  useEffect(() => {
    if (bootstrapStatus === 'idle' || bootstrapStatus === 'loading') {
      if (loadStatus !== 'loading') {
        setLoadStatus('loading');
        setLoadError(null);
      }
      return;
    }

    if (bootstrapStatus === 'error') {
      setLoadStatus('error');
      setLoadError(
        bootstrapError ?? 'The settings profile could not be reopened.'
      );
      return;
    }

    if (loadStatus === 'ready' || loadStatus === 'error') {
      return;
    }

    let isCancelled = false;

    setLoadStatus('loading');
    setLoadError(null);

    void (async () => {
      try {
        if (!resolvedProfile) {
          await refreshProfile();
        }

        if (isCancelled) {
          return;
        }

        setLoadStatus('ready');
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setLoadStatus('error');
        setLoadError(
          error instanceof Error && error.message
            ? error.message
            : 'The settings profile could not be reopened.'
        );
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [
    bootstrapError,
    bootstrapStatus,
    loadStatus,
    refreshProfile,
    resolvedProfile,
  ]);

  const handleRefresh = async () => {
    setLoadStatus('loading');
    setLoadError(null);

    try {
      await refreshBootstrap();
      await refreshProfile();
      setLoadStatus('ready');
    } catch (error) {
      setLoadStatus('error');
      setLoadError(
        error instanceof Error && error.message
          ? error.message
          : 'The settings profile could not be refreshed.'
      );
    }
  };

  const handleToggle = async (
    key: keyof ProfileSettingsState,
    value: boolean
  ) => {
    setSavingKey(key);
    setSaveError(null);

    try {
      await updateSettings({ [key]: value });
    } catch (error) {
      setSaveError(
        error instanceof Error && error.message
          ? error.message
          : 'The new setting could not be saved.'
      );
    } finally {
      setSavingKey(null);
    }
  };

  const settings = resolvedProfile?.settings ?? null;
  const isLoading = loadStatus === 'idle' || loadStatus === 'loading';
  const isSaving = savingKey !== null;

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
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              Profile preferences now persist for real.
            </Text>
            <Text style={styles.body}>
              Audio and content preferences now save directly into the SQLite
              profile layer instead of routing to a placeholder screen.
            </Text>
          </View>

          {isLoading ? (
            <LoadingPanel label="Reopening profile preferences..." />
          ) : loadStatus === 'error' ? (
            <InfoPanel
              title="Settings Error"
              body={
                loadError ?? 'The settings profile could not be reconstructed.'
              }
              primaryLabel="Try Again"
              onPrimaryPress={handleRefresh}
              secondaryLabel="Return to Title"
              onSecondaryPress={() => {
                router.push('/' as Href);
              }}
            />
          ) : !settings ? (
            <InfoPanel
              title="Profile Missing"
              body="The profile did not finish loading, so settings are not available yet."
              primaryLabel="Reload Settings"
              onPrimaryPress={handleRefresh}
              secondaryLabel="Return to Title"
              onSecondaryPress={() => {
                router.push('/' as Href);
              }}
            />
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Audio</Text>
                <Text style={styles.panelBody}>
                  These flags are saved immediately and will be available to the
                  runtime shell on the next pass that wires audio systems fully
                  into the app.
                </Text>
                <View style={styles.settingList}>
                  <SettingRow
                    label="Sound Effects"
                    description="Leave hit confirms, button feedback, and combat noise enabled."
                    value={settings.sfxEnabled}
                    disabled={isSaving}
                    onValueChange={(value) => {
                      void handleToggle('sfxEnabled', value);
                    }}
                  />
                  <SettingRow
                    label="Music"
                    description="Keep ambient dungeon and menu music enabled."
                    value={settings.musicEnabled}
                    disabled={isSaving}
                    onValueChange={(value) => {
                      void handleToggle('musicEnabled', value);
                    }}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Content</Text>
                <Text style={styles.panelBody}>
                  The profanity filter flag is now stored in the profile so
                  future writing and dialogue systems can respect it.
                </Text>
                <View style={styles.settingList}>
                  <SettingRow
                    label="Profanity Filter"
                    description="Swap sharper language for a cleaner office-approved tone when content systems opt in."
                    value={settings.profanityFilterEnabled}
                    disabled={isSaving}
                    onValueChange={(value) => {
                      void handleToggle('profanityFilterEnabled', value);
                    }}
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Current Profile Flags</Text>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="SFX"
                    value={settings.sfxEnabled ? 'Enabled' : 'Muted'}
                  />
                  <DetailLine
                    label="Music"
                    value={settings.musicEnabled ? 'Enabled' : 'Muted'}
                  />
                  <DetailLine
                    label="Profanity Filter"
                    value={
                      settings.profanityFilterEnabled ? 'Enabled' : 'Disabled'
                    }
                  />
                  <DetailLine
                    label="Save Mode"
                    value={
                      isSaving
                        ? `Saving ${humanizeSettingKey(savingKey)}...`
                        : 'Saved to profile'
                    }
                  />
                </View>
                {saveError ? (
                  <Text style={styles.errorBody}>{saveError}</Text>
                ) : (
                  <Text style={styles.helperText}>
                    Preferences are written back to the primary profile as soon
                    as each toggle changes.
                  </Text>
                )}
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Actions</Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Refresh Settings"
                    onPress={() => {
                      void handleRefresh();
                    }}
                    disabled={isSaving}
                  />
                  <GameButton
                    label="Return to Title"
                    onPress={() => {
                      router.push('/' as Href);
                    }}
                    variant="secondary"
                    disabled={isSaving}
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

function LoadingPanel({
  label,
}: {
  label: string;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.loadingState}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.panelBody}>{label}</Text>
      </View>
    </View>
  );
}

function InfoPanel({
  title,
  body,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: {
  title: string;
  body: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.panelBody}>{body}</Text>
      <View style={styles.actionGroup}>
        <GameButton label={primaryLabel} onPress={onPrimaryPress} />
        {secondaryLabel && onSecondaryPress ? (
          <GameButton
            label={secondaryLabel}
            onPress={onSecondaryPress}
            variant="secondary"
          />
        ) : null}
      </View>
    </View>
  );
}

function SettingRow({
  label,
  description,
  value,
  disabled,
  onValueChange,
}: SettingRowProps) {
  return (
    <View style={styles.settingCard}>
      <View style={styles.settingCopy}>
        <Text style={styles.settingTitle}>{label}</Text>
        <Text style={styles.settingBody}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        thumbColor={value ? colors.background : colors.textSubtle}
        trackColor={{
          false: colors.borderStrong,
          true: colors.accent,
        }}
      />
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

function humanizeSettingKey(value: keyof ProfileSettingsState | null) {
  if (value === 'sfxEnabled') {
    return 'SFX';
  }

  if (value === 'musicEnabled') {
    return 'Music';
  }

  if (value === 'profanityFilterEnabled') {
    return 'Filter';
  }

  return 'settings';
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
  settingList: {
    gap: spacing.sm + 2,
  },
  settingCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  settingCopy: {
    flex: 1,
    gap: spacing.xs + 2,
  },
  settingTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  settingBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs + 2,
  },
  detailLine: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  detailLabel: {
    color: colors.textSubtle,
    fontWeight: '700',
  },
  helperText: {
    color: colors.textSubtle,
    fontSize: 12,
    lineHeight: 18,
  },
  errorBody: {
    color: colors.errorMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  actionGroup: {
    gap: spacing.sm + 2,
  },
});
