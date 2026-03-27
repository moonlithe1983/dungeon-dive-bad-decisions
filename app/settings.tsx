import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GameButton } from '@/src/components/game-button';
import { useGameStore } from '@/src/state/gameStore';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';

export default function SettingsScreen() {
  const bootstrapStatus = useGameStore((state) => state.bootstrapStatus);
  const bootstrapError = useGameStore((state) => state.error);
  const initializeApp = useGameStore((state) => state.initializeApp);
  const refreshBootstrap = useGameStore((state) => state.refreshBootstrap);

  useEffect(() => {
    if (bootstrapStatus === 'idle') {
      void initializeApp();
    }
  }, [bootstrapStatus, initializeApp]);

  const isLoading = bootstrapStatus === 'idle' || bootstrapStatus === 'loading';

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
              Only launch-safe controls belong here.
            </Text>
            <Text style={styles.body}>
              The unfinished audio and content switches have been intentionally
              removed from the live UI. They still exist in the saved profile
              schema for future wiring, but the current runtime does not pretend
              they change real behavior.
            </Text>
          </View>

          {isLoading ? (
            <LoadingPanel label="Reopening release settings..." />
          ) : bootstrapStatus === 'error' ? (
            <InfoPanel
              title="Settings Error"
              body={
                bootstrapError ??
                'The settings screen could not confirm the current app state.'
              }
              primaryLabel="Try Again"
              onPrimaryPress={() => {
                void refreshBootstrap();
              }}
              secondaryLabel="Return to Title"
              onSecondaryPress={() => {
                router.push('/' as Href);
              }}
            />
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Launch-Safe Policy</Text>
                <Text style={styles.panelBody}>
                  Version 1 should not ship with fake controls. Until audio and
                  tone-filter behavior are fully wired into the live app, those
                  toggles stay hidden instead of making promises they do not yet
                  keep.
                </Text>
                <Text style={styles.helperText}>
                  Honest UI is better than decorative settings.
                </Text>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Current Release Defaults</Text>
                <View style={styles.detailCard}>
                  <DetailLine label="Platform" value="Android only" />
                  <DetailLine label="Store" value="Google Play only" />
                  <DetailLine label="Developer" value="Moonlithe" />
                  <DetailLine
                    label="Launch Regions"
                    value="English-speaking regions first"
                  />
                  <DetailLine
                    label="Working Price"
                    value="US$3.99 unless testing later supports US$4.99"
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Help And Policy</Text>
                <Text style={styles.panelBody}>
                  Support and privacy drafts now have dedicated routes so launch
                  materials can point somewhere real once the final public URL
                  and support inbox are locked.
                </Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Support"
                    onPress={() => {
                      router.push('/support' as Href);
                    }}
                  />
                  <GameButton
                    label="Privacy Policy"
                    onPress={() => {
                      router.push('/privacy' as Href);
                    }}
                    variant="secondary"
                  />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Actions</Text>
                <View style={styles.actionGroup}>
                  <GameButton
                    label="Refresh Status"
                    onPress={() => {
                      void refreshBootstrap();
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
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LoadingPanel({ label }: { label: string }) {
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

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
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
  actionGroup: {
    gap: spacing.sm + 2,
  },
});
