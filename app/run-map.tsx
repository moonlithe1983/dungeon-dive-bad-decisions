import { router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRunCompanionSupportCards } from '@/src/engine/bond/companion-perks';
import { GameButton } from '@/src/components/game-button';
import { getClassDefinition } from '@/src/content/classes';
import {
  COMPANY_NAME,
  TOWER_NAME,
  getClassNarrative,
  getCompanyDisasterSummary,
} from '@/src/content/company-lore';
import { getCompanionDefinition } from '@/src/content/companions';
import { getItemDefinition } from '@/src/content/items';
import {
  canRotateActiveCompanionAtFloorStart,
  getReserveCompanionId,
  getRunNodeRoute,
} from '@/src/engine/run/progress-run';
import { useRunStore } from '@/src/state/runStore';
import { useHydratedRun } from '@/src/state/use-hydrated-run';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import type { RunFloorState, RunNodeState } from '@/src/types/run';
import { humanizeId } from '@/src/utils/strings';

export default function RunMapScreen() {
  const { run, currentFloor, currentNode, loadState, error, recoveredFromBackup } =
    useHydratedRun();
  const abandonCurrentRun = useRunStore((state) => state.abandonCurrentRun);
  const isAbandoningRun = useRunStore((state) => state.isAbandoningRun);
  const rotateActiveCompanionAtFloorStart = useRunStore(
    (state) => state.rotateActiveCompanionAtFloorStart
  );
  const isRotatingActiveCompanion = useRunStore(
    (state) => state.isRotatingActiveCompanion
  );
  const [isAbandonConfirming, setIsAbandonConfirming] = useState(false);

  const className = useMemo(() => {
    if (!run) {
      return null;
    }

    return getClassDefinition(run.heroClassId)?.name ?? run.heroClassId;
  }, [run]);
  const classNarrative = useMemo(() => {
    if (!run) {
      return null;
    }

    return getClassNarrative(run.heroClassId);
  }, [run]);

  const activeCompanionName = useMemo(() => {
    if (!run) {
      return null;
    }

    return (
      getCompanionDefinition(run.activeCompanionId)?.name ??
      run.activeCompanionId
    );
  }, [run]);
  const reserveCompanionId = useMemo(() => {
    if (!run) {
      return null;
    }

    return getReserveCompanionId(run);
  }, [run]);
  const reserveCompanionName = useMemo(() => {
    if (!reserveCompanionId) {
      return null;
    }

    return (
      getCompanionDefinition(reserveCompanionId)?.name ?? reserveCompanionId
    );
  }, [reserveCompanionId]);
  const carriedItemNames = useMemo(() => {
    if (!run) {
      return [];
    }

    return run.inventoryItemIds.map(
      (itemId) => getItemDefinition(itemId)?.name ?? humanizeId(itemId)
    );
  }, [run]);
  const companionSupportCards = useMemo(() => {
    if (!run) {
      return [];
    }

    return getRunCompanionSupportCards(run);
  }, [run]);
  const canRotateAtFloorStart = useMemo(() => {
    if (!run) {
      return false;
    }

    return canRotateActiveCompanionAtFloorStart(run);
  }, [run]);
  const rotatedSupportCards = useMemo(() => {
    if (!run || !reserveCompanionId) {
      return [];
    }

    return getRunCompanionSupportCards({
      ...run,
      activeCompanionId: reserveCompanionId,
    });
  }, [reserveCompanionId, run]);

  const currentNodeRoute = currentNode ? getRunNodeRoute(currentNode.kind) : null;
  const pendingRewardItem = run?.pendingReward?.itemId
    ? getItemDefinition(run.pendingReward.itemId)
    : null;
  const abandonWarning = useMemo(() => {
    if (!run) {
      return 'Abandoning archives the current run, clears the autosave slots, and makes this dive non-resumable.';
    }

    if (run.pendingReward) {
      return 'Abandoning now will archive the run immediately and any pending reward on this floor will be lost.';
    }

    if (run.combatState) {
      return 'Abandoning now will archive the current run and discard the in-progress combat state.';
    }

    return 'Abandoning archives the current hero, companion, floor, and carried gear, then clears the active run slots.';
  }, [run]);

  useEffect(() => {
    if (!run) {
      setIsAbandonConfirming(false);
    }
  }, [run]);

  const handleAbandon = async () => {
    const result = await abandonCurrentRun();
    setIsAbandonConfirming(false);
    router.replace(`/end-run?runId=${encodeURIComponent(result.run.runId)}` as Href);
  };
  const handleRotateCompanion = async () => {
    await rotateActiveCompanionAtFloorStart();
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
            <Text style={styles.eyebrow}>ACTIVE RUN</Text>
            <Text style={styles.title}>Run Map</Text>
            <Text style={styles.subtitle}>
              {run
                ? `${className ?? 'Your role'} is now inside the disaster.`
                : 'The next office disaster is waiting upstairs.'}
            </Text>
            <Text style={styles.body}>
              {getCompanyDisasterSummary()}
            </Text>
            <Text style={styles.body}>
              Floor starts still support real lead-companion rotation, but the
              bigger problem is that every department in {COMPANY_NAME} now
              lives somewhere inside {TOWER_NAME}, and leadership expects the
              cleanup to look approved while you are doing it.
            </Text>
          </View>

          {loadState === 'idle' || loadState === 'loading' ? (
            <View style={styles.panel}>
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.panelBody}>
                  Reopening the latest bad decision...
                </Text>
              </View>
            </View>
          ) : loadState === 'error' ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Resume Error</Text>
              <Text style={styles.errorBody}>{error}</Text>
              <View style={styles.actionGroup}>
                <GameButton
                  label="Return to Title"
                  onPress={() => {
                    router.push('/' as Href);
                  }}
                />
              </View>
            </View>
          ) : !run ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>No Active Dive</Text>
              <Text style={styles.panelBody}>
                No saved run was available to resume. Start a new descent from
                the title screen to populate this route.
              </Text>
              <View style={styles.actionGroup}>
                <GameButton
                  label="Return to Title"
                  onPress={() => {
                    router.push('/' as Href);
                  }}
                />
                <GameButton
                  label="Class Select"
                  onPress={() => {
                    router.push('/class-select' as Href);
                  }}
                  variant="secondary"
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Dive Status</Text>
                <View style={styles.statGrid}>
                  <StatCard label="Floor" value={String(run.floorIndex)} />
                  <StatCard
                    label="Hero HP"
                    value={`${run.hero.currentHp}/${run.hero.maxHp}`}
                  />
                  <StatCard label="Class" value={className ?? 'Unknown'} />
                </View>
                <View style={styles.detailCard}>
                  <DetailLine
                    label="Companion"
                    value={activeCompanionName ?? 'Unknown'}
                  />
                  <DetailLine
                    label="Reserve"
                    value={reserveCompanionName ?? 'Unknown'}
                  />
                  <DetailLine label="Run ID" value={run.runId} />
                  <DetailLine label="Status" value={humanizeId(run.runStatus)} />
                  <DetailLine
                    label="Current Node"
                    value={currentNode?.label ?? 'Run complete'}
                  />
                  <DetailLine
                    label="Inventory"
                    value={
                      carriedItemNames.length > 0
                        ? carriedItemNames.join(', ')
                        : 'No contraband equipped yet'
                    }
                  />
                </View>
                {companionSupportCards.length > 0 ? (
                  <View style={styles.supportList}>
                    {companionSupportCards.map((card) => (
                      <View key={card.companionId} style={styles.supportCard}>
                        <Text style={styles.supportTitle}>
                          {card.companionName} ({card.role === 'active' ? 'Lead' : 'Reserve'})
                        </Text>
                        <Text style={styles.supportBody}>
                          Bond {card.bondLevel}: {card.summary}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                {recoveredFromBackup ? (
                  <Text style={styles.recoveryNotice}>
                    This run was recovered from the backup autosave.
                  </Text>
                ) : null}
              </View>

              {classNarrative ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Mission Brief</Text>
                  <Text style={styles.panelBody}>{classNarrative.openingHook}</Text>
                  <View style={styles.detailCard}>
                    <DetailLine label="Why You Climb" value={classNarrative.stake} />
                    <DetailLine
                      label="Leadership Broke"
                      value={classNarrative.leadershipFailure}
                    />
                    <DetailLine
                      label="Approval Trap"
                      value={classNarrative.approvalConstraint}
                    />
                    <DetailLine
                      label="Department Baggage"
                      value={classNarrative.rivalDepartments}
                    />
                  </View>
                </View>
              ) : null}

              {canRotateAtFloorStart ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Floor Transition</Text>
                  <Text style={styles.panelBody}>
                    Floor {run.floorIndex} opens with a deployment handoff.
                    Rotate the reserve in now if you want a different lead perk
                    package, battle banter, and event voice for this stretch.
                  </Text>
                  <View style={styles.detailCard}>
                    <DetailLine
                      label="Current Lead"
                      value={activeCompanionName ?? 'Unknown'}
                    />
                    <DetailLine
                      label="Reserve Ready"
                      value={reserveCompanionName ?? 'Unknown'}
                    />
                    <DetailLine
                      label="Next Stop"
                      value={currentNode?.label ?? 'Unknown'}
                    />
                  </View>
                  {rotatedSupportCards.length > 0 ? (
                    <View style={styles.supportList}>
                      {rotatedSupportCards.map((card) => (
                        <View key={`rotated-${card.companionId}`} style={styles.supportCard}>
                          <Text style={styles.supportTitle}>
                            If rotated: {card.companionName} ({card.role === 'active' ? 'Lead' : 'Reserve'})
                          </Text>
                          <Text style={styles.supportBody}>
                            Bond {card.bondLevel}: {card.summary}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <View style={styles.actionGroup}>
                    <GameButton
                      label={
                        isRotatingActiveCompanion
                          ? 'Rotating...'
                          : 'Swap Lead and Reserve'
                      }
                      onPress={() => {
                        void handleRotateCompanion();
                      }}
                      disabled={isRotatingActiveCompanion}
                    />
                  </View>
                </View>
              ) : null}

              {run.pendingReward ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Pending Reward</Text>
                  <Text style={styles.panelBody}>
                    {run.pendingReward.title}: {run.pendingReward.description}
                  </Text>
                  <View style={styles.detailCard}>
                    <DetailLine
                      label="Meta"
                      value={`+${run.pendingReward.metaCurrency}`}
                    />
                    <DetailLine
                      label="Recovery"
                      value={`+${run.pendingReward.runHealing} HP`}
                    />
                    <DetailLine
                      label="Item"
                      value={pendingRewardItem?.name ?? 'No item attached'}
                    />
                  </View>
                  <View style={styles.actionGroup}>
                    <GameButton
                      label="Claim Pending Reward"
                      onPress={() => {
                        router.push('/reward' as Href);
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
              ) : null}

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>
                  {currentFloor?.label ?? 'Current Floor'}
                </Text>
                <Text style={styles.panelBody}>
                  {currentFloor?.description ??
                    'The current floor layout could not be reconstructed.'}
                </Text>
                {currentNode ? (
                  <View style={styles.actionGroup}>
                    <GameButton
                      label={`Enter ${currentNode.label}`}
                      onPress={() => {
                        if (!currentNodeRoute) {
                          return;
                        }

                        router.push(currentNodeRoute as Href);
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
                ) : (
                  <View style={styles.actionGroup}>
                    <GameButton
                      label="Open End Run"
                      onPress={() => {
                        router.replace(
                          `/end-run?runId=${encodeURIComponent(run.runId)}` as Href
                        );
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
                )}
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Run Exit</Text>
                <Text style={styles.panelBody}>
                  Returning to title keeps this dive resumable. Abandoning it
                  archives the current state as a finished entry and clears the
                  active save slots.
                </Text>
                {isAbandonConfirming ? (
                  <View style={styles.warningCard}>
                    <Text style={styles.warningTitle}>Confirm Abandon</Text>
                    <Text style={styles.warningBody}>{abandonWarning}</Text>
                    <View style={styles.actionGroup}>
                      <GameButton
                        label={
                          isAbandoningRun ? 'Archiving...' : 'Confirm Abandon'
                        }
                        onPress={() => {
                          void handleAbandon();
                        }}
                        disabled={isAbandoningRun}
                      />
                      <GameButton
                        label="Keep the Run"
                        onPress={() => {
                          setIsAbandonConfirming(false);
                        }}
                        variant="secondary"
                        disabled={isAbandoningRun}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.actionGroup}>
                    <GameButton
                      label="Abandon Dive"
                      onPress={() => {
                        setIsAbandonConfirming(true);
                      }}
                      variant="secondary"
                    />
                  </View>
                )}
              </View>

              {run.map.floors.map((floor) => (
                <FloorPanel
                  key={floor.id}
                  floor={floor}
                  currentNodeId={run.currentNodeId}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FloorPanel({
  floor,
  currentNodeId,
}: {
  floor: RunFloorState;
  currentNodeId: string | null;
}) {
  return (
    <View style={styles.panel}>
      <View style={styles.floorHeader}>
        <Text style={styles.panelTitle}>Floor {floor.floorNumber}</Text>
        <Text
          style={[
            styles.floorStatus,
            floor.status === 'active'
              ? styles.floorStatusActive
              : floor.status === 'resolved'
                ? styles.floorStatusResolved
                : styles.floorStatusLocked,
          ]}
        >
          {humanizeId(floor.status)}
        </Text>
      </View>
      <Text style={styles.panelBody}>{floor.description}</Text>
      <View style={styles.nodeList}>
        {floor.nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            isCurrent={currentNodeId === node.id}
          />
        ))}
      </View>
    </View>
  );
}

function NodeCard({
  node,
  isCurrent,
}: {
  node: RunNodeState;
  isCurrent: boolean;
}) {
  const statusStyle =
    node.status === 'active'
      ? styles.nodeStatusActive
      : node.status === 'resolved'
        ? styles.nodeStatusResolved
        : styles.nodeStatusLocked;

  return (
    <View
      style={[
        styles.nodeCard,
        isCurrent && styles.nodeCardCurrent,
        node.status === 'locked' && styles.nodeCardLocked,
      ]}
    >
      <View style={styles.nodeHeader}>
        <Text style={styles.nodeStep}>Node {node.sequence}</Text>
        <Text style={[styles.nodeStatus, statusStyle]}>
          {isCurrent ? 'Current' : humanizeId(node.status)}
        </Text>
      </View>
      <Text style={styles.nodeTitle}>{node.label}</Text>
      <Text style={styles.nodeMeta}>{humanizeId(node.kind)}</Text>
      <Text style={styles.nodeBody}>{node.description}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
  errorBody: {
    color: colors.errorMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  statGrid: {
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.accent,
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
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
  supportList: {
    gap: spacing.sm,
  },
  supportCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs + 2,
  },
  supportTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  supportBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  warningCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm + 2,
  },
  warningTitle: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '800',
  },
  warningBody: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  recoveryNotice: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionGroup: {
    gap: spacing.sm + 2,
  },
  floorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  floorStatus: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  floorStatusActive: {
    color: colors.accent,
  },
  floorStatusResolved: {
    color: colors.textSecondary,
  },
  floorStatusLocked: {
    color: colors.textSubtle,
  },
  nodeList: {
    gap: spacing.sm + 2,
  },
  nodeCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: spacing.xs + 2,
  },
  nodeCardCurrent: {
    borderColor: colors.accent,
  },
  nodeCardLocked: {
    opacity: 0.72,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nodeStep: {
    color: colors.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  nodeStatus: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  nodeStatusActive: {
    color: colors.accent,
  },
  nodeStatusResolved: {
    color: colors.textSecondary,
  },
  nodeStatusLocked: {
    color: colors.textSubtle,
  },
  nodeTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  nodeMeta: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  nodeBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
});
