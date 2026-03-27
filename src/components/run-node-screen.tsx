import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getRunNodeRoute,
} from '@/src/engine/run/progress-run';
import { GameButton } from '@/src/components/game-button';
import { useHydratedRun } from '@/src/state/use-hydrated-run';
import { useRunStore } from '@/src/state/runStore';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import type { RunNodeKind } from '@/src/types/run';

type RunNodeScreenProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  expectedKinds: RunNodeKind[];
  resolveLabel: string;
};

export function RunNodeScreen({
  eyebrow,
  title,
  subtitle,
  description,
  expectedKinds,
  resolveLabel,
}: RunNodeScreenProps) {
  const { run, currentNode, loadState, error } = useHydratedRun();
  const resolveCurrentNode = useRunStore((state) => state.resolveCurrentNode);
  const isResolvingNode = useRunStore((state) => state.isResolvingNode);

  const handleResolve = async () => {
    const resolution = await resolveCurrentNode();

    if (resolution.completedRun) {
      router.replace(
        `/end-run?runId=${encodeURIComponent(resolution.run.runId)}` as Href
      );
      return;
    }

    router.replace('/run-map' as Href);
  };

  const wrongSceneRoute =
    currentNode && !expectedKinds.includes(currentNode.kind)
      ? getRunNodeRoute(currentNode.kind)
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
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <Text style={styles.body}>{description}</Text>
          </View>

          {loadState === 'idle' || loadState === 'loading' ? (
            <View style={styles.panel}>
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.panelBody}>
                  Reconstructing the current incident...
                </Text>
              </View>
            </View>
          ) : loadState === 'error' ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Encounter Error</Text>
              <Text style={styles.errorBody}>{error}</Text>
              <View style={styles.actions}>
                <GameButton
                  label="Return to Map"
                  onPress={() => {
                    router.replace('/run-map' as Href);
                  }}
                />
              </View>
            </View>
          ) : !run || !currentNode ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>No Encounter Loaded</Text>
              <Text style={styles.panelBody}>
                There is no active node to resolve here. Reopen the run map and
                pick up the current path from there.
              </Text>
              <View style={styles.actions}>
                <GameButton
                  label="Return to Map"
                  onPress={() => {
                    router.replace('/run-map' as Href);
                  }}
                />
              </View>
            </View>
          ) : wrongSceneRoute ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Wrong Route</Text>
              <Text style={styles.panelBody}>
                The active node is a {currentNode.kind} node, so this screen is
                the wrong handoff for the current run state.
              </Text>
              <View style={styles.actions}>
                <GameButton
                  label="Open Correct Node"
                  onPress={() => {
                    router.replace(wrongSceneRoute as Href);
                  }}
                />
                <GameButton
                  label="Return to Map"
                  onPress={() => {
                    router.replace('/run-map' as Href);
                  }}
                  variant="secondary"
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{currentNode.label}</Text>
                <Text style={styles.panelBody}>{currentNode.description}</Text>
                <View style={styles.detailCard}>
                  <DetailLine label="Floor" value={String(run.floorIndex)} />
                  <DetailLine label="Node" value={`${currentNode.sequence}`} />
                  <DetailLine label="Type" value={currentNode.kind} />
                  <DetailLine label="Status" value={currentNode.status} />
                </View>
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Resolution Stub</Text>
                <Text style={styles.panelBody}>
                  This screen now acts as a real step in the run loop. Resolving
                  it will save progress, unlock the next node, and return to the
                  map or finish the run if this was the last encounter.
                </Text>
                <View style={styles.actions}>
                  <GameButton
                    label={isResolvingNode ? 'Resolving...' : resolveLabel}
                    onPress={handleResolve}
                    disabled={isResolvingNode}
                  />
                  <GameButton
                    label="Back to Map"
                    onPress={() => {
                      router.replace('/run-map' as Href);
                    }}
                    variant="secondary"
                    disabled={isResolvingNode}
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
  errorBody: {
    color: colors.errorMuted,
    fontSize: 14,
    lineHeight: 20,
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
  actions: {
    gap: spacing.sm + 2,
  },
});
