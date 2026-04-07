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

import {
  getLoopSurfaceArtSource,
  getRouteNodeArtSource,
} from '@/src/assets/loop-art-sources';
import { LoopArtPanel } from '@/src/components/loop-art-panel';
import { getRunCompanionSupportCards } from '@/src/engine/bond/companion-perks';
import { GameButton } from '@/src/components/game-button';
import { getEarlyFloorBeat, getPartyScene } from '@/src/content/authored-voice';
import { getClassDefinition } from '@/src/content/classes';
import {
  COMPANY_NAME,
  TOWER_NAME,
  createTicketBrief,
  getClassNarrative,
} from '@/src/content/company-lore';
import { getCompanionDefinition } from '@/src/content/companions';
import { getItemDefinition } from '@/src/content/items';
import {
  canRotateActiveCompanionAtFloorStart,
  getCurrentRunFloor,
  getReserveCompanionId,
  getRunNodeRoute,
  getSelectableCurrentFloorNodes,
} from '@/src/engine/run/progress-run';
import { useRunStore } from '@/src/state/runStore';
import { useHydratedRun } from '@/src/state/use-hydrated-run';
import { useUxTelemetryStore } from '@/src/state/uxTelemetryStore';
import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';
import type { RunFloorState, RunNodeState } from '@/src/types/run';
import { humanizeId } from '@/src/utils/strings';

function summarizeRoute(node: RunNodeState) {
  if (node.kind === 'battle') {
    return 'Direct fight with a clean payout if you survive.';
  }

  if (node.kind === 'boss') {
    return 'Boss gate. High risk, but this is how you punch upward.';
  }

  if (node.kind === 'reward') {
    return 'Low-combat scavenging room with a build-shaping pickup.';
  }

  return 'Story choice with upside, downside, and character fallout.';
}

function getRoleCue(node: RunNodeState) {
  if (node.kind === 'battle') {
    return 'Fight';
  }

  if (node.kind === 'boss') {
    return 'Boss';
  }

  if (node.kind === 'reward') {
    return 'Scavenge';
  }

  return 'Risk Event';
}

function describeFloorObjective(
  floor: RunFloorState | null,
  currentNode: RunNodeState | null
) {
  if (!floor) {
    return 'Pick the next room to keep the ticket moving.';
  }

  const activeNodes = floor.nodes.filter((node) => node.status === 'active');
  const hasBossNode = floor.nodes.some((node) => node.kind === 'boss');
  const activeBossNode = activeNodes.find((node) => node.kind === 'boss') ?? null;
  const activePrepNodes = activeNodes.filter((node) => node.kind !== 'boss');

  if (activeBossNode && activeNodes.length === 1) {
    return `Boss gate unlocked: clear ${activeBossNode.label} to reach the next floor.`;
  }

  if (hasBossNode && activePrepNodes.length > 0) {
    return activePrepNodes.length > 1
      ? 'Pick one prep room. Clearing it skips the other prep room and unlocks the boss gate for this floor.'
      : 'Clear one prep room. The boss gate unlocks right after; you do not need to clear every room on the floor.';
  }

  if (activeNodes.length > 1) {
    return 'Pick one active room. Clearing it advances the floor; the other room is an alternate path, not another requirement.';
  }

  if (currentNode) {
    return `Clear ${currentNode.label} to advance the ticket upward.`;
  }

  return 'Pick one active room to keep climbing.';
}

export default function RunMapScreen() {
  const { run, currentFloor, currentNode, loadState, error, recoveredFromBackup } =
    useHydratedRun();
  const abandonCurrentRun = useRunStore((state) => state.abandonCurrentRun);
  const chooseCurrentNode = useRunStore((state) => state.chooseCurrentNode);
  const isAbandoningRun = useRunStore((state) => state.isAbandoningRun);
  const rotateActiveCompanionAtFloorStart = useRunStore(
    (state) => state.rotateActiveCompanionAtFloorStart
  );
  const recordRouteSelection = useUxTelemetryStore(
    (state) => state.recordRouteSelection
  );
  const recordRouteCommit = useUxTelemetryStore((state) => state.recordRouteCommit);
  const isRotatingActiveCompanion = useRunStore(
    (state) => state.isRotatingActiveCompanion
  );
  const [isAbandonConfirming, setIsAbandonConfirming] = useState(false);
  const [showCrewNotes, setShowCrewNotes] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

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

    return getCompanionDefinition(reserveCompanionId)?.name ?? reserveCompanionId;
  }, [reserveCompanionId]);
  const carriedItems = useMemo(() => {
    if (!run) {
      return [];
    }

    return run.inventoryItemIds.map((itemId) => {
      const item = getItemDefinition(itemId);

      return {
        id: itemId,
        name: item?.name ?? humanizeId(itemId),
        effectSummary: item?.effectSummary ?? 'Effect summary missing.',
      };
    });
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
  const selectedFloor = useMemo(() => {
    if (!run) {
      return null;
    }

    return getCurrentRunFloor(run);
  }, [run]);
  const floorChoices = useMemo(() => {
    if (!run) {
      return [];
    }

    return getSelectableCurrentFloorNodes(run);
  }, [run]);
  const floorBeat = useMemo(() => {
    if (!run) {
      return null;
    }

    return getEarlyFloorBeat(run.floorIndex);
  }, [run]);
  const floorObjective = useMemo(
    () => describeFloorObjective(selectedFloor ?? currentFloor, currentNode),
    [currentFloor, currentNode, selectedFloor]
  );
  const routeScene = useMemo(() => {
    if (!run) {
      return null;
    }

    return getPartyScene('first-route-choice', run.chosenCompanionIds);
  }, [run]);
  const currentNodeRoute = currentNode ? getRunNodeRoute(currentNode.kind) : null;
  const runMapSurfaceArtSource = useMemo(
    () => getLoopSurfaceArtSource('run-map', settings),
    [settings]
  );
  const selectedRouteArtSource = useMemo(
    () =>
      getRouteNodeArtSource(
        currentNode?.kind ?? floorChoices[0]?.kind ?? 'battle',
        settings
      ),
    [currentNode?.kind, floorChoices, settings]
  );
  const pendingRewardItem = run?.pendingReward?.itemId
    ? getItemDefinition(run.pendingReward.itemId)
    : null;
  const ticketBrief = useMemo(() => {
    if (!run) {
      return null;
    }

    return createTicketBrief({
      classId: run.heroClassId,
      floorIndex: run.floorIndex,
      runId: run.runId,
      currentNodeLabel: currentNode?.label ?? null,
    });
  }, [currentNode?.label, run]);
  const abandonWarning = useMemo(() => {
    if (!run) {
      return 'Abandoning ends the current dive and clears the active save.';
    }

    if (run.pendingReward) {
      return 'Abandoning now ends the dive immediately and leaves the current reward behind.';
    }

    if (run.combatState) {
      return 'Abandoning now ends the dive immediately and throws away the current fight.';
    }

    return 'Abandoning ends this dive, records the result, and clears the active save slot.';
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

  const handleChooseRoute = async (nodeId: string) => {
    if (run) {
      recordRouteSelection({
        runId: run.runId,
        changedSelection: currentNode?.id !== nodeId,
      });
    }

    await chooseCurrentNode(nodeId);
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
            <Text style={styles.title}>Floor {run?.floorIndex ?? 1}</Text>
            <Text style={styles.subtitle}>
              {run
                ? `Pick the next bad idea before ${TOWER_NAME} picks for you.`
                : 'The next climb is waiting upstairs.'}
            </Text>
            <Text style={styles.body}>
              {run
                ? `${className ?? 'Your role'} and ${activeCompanionName ?? 'your crew'} are still inside ${COMPANY_NAME}. Choose the next stop, keep the route readable, and do not let the tower turn surprise into policy.`
                : 'Every floor inside Meridian Spire wants a different kind of sacrifice.'}
            </Text>
          </View>

          {loadState === 'idle' || loadState === 'loading' ? (
            <View style={styles.panel}>
              <View style={styles.loadingState}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.panelBody}>Reopening the latest bad decision...</Text>
              </View>
            </View>
          ) : loadState === 'error' ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>Resume Error</Text>
              <Text style={styles.errorBody}>{error}</Text>
              <GameButton
                label="Employee Portal"
                onPress={() => {
                  router.push('/' as Href);
                }}
              />
            </View>
          ) : !run ? (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>No Active Dive</Text>
              <Text style={styles.panelBody}>
                No active dive was found. Start a new descent from the employee
                portal.
              </Text>
              <View style={styles.actionGroup}>
                <GameButton
                  label="Employee Portal"
                  onPress={() => {
                    router.push('/' as Href);
                  }}
                />
                <GameButton
                  label="Role Briefing"
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
                <Text style={styles.panelTitle}>Progress</Text>
                <View style={styles.progressStrip}>
                  {run.map.floors.map((floor) => (
                    <FloorMarker
                      key={floor.id}
                      floor={floor}
                      isCurrent={floor.floorNumber === run.floorIndex}
                    />
                  ))}
                </View>
                <View style={styles.statGrid}>
                  <StatCard label="HP" value={`${run.hero.currentHp}/${run.hero.maxHp}`} />
                  <StatCard label="Lead" value={activeCompanionName ?? 'Unknown'} />
                  <StatCard label="Choices" value={`${floorChoices.length} open`} />
                </View>
                <Text style={styles.panelBody}>
                  {selectedFloor?.label ?? currentFloor?.label ?? 'Current floor'}.
                  {' '}
                  {selectedFloor?.description ?? currentFloor?.description}
                </Text>
                <Text style={styles.noticeText}>{floorObjective}</Text>
                {recoveredFromBackup ? (
                  <Text style={styles.noticeText}>
                    Recovered from your latest emergency save.
                  </Text>
                ) : null}
              </View>

              {ticketBrief ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Assigned Ticket</Text>
                  <Text style={styles.panelBody}>
                    {ticketBrief.ticketId} - {ticketBrief.subject}
                  </Text>
                  <View style={styles.detailCard}>
                    <DetailLine label="Filed by" value={ticketBrief.filedBy} />
                    <DetailLine
                      label="Escalation track"
                      value={ticketBrief.escalationTrack}
                    />
                    <DetailLine label="Current owner" value={ticketBrief.currentOwner} />
                  </View>
                  <Text style={styles.panelBody}>{ticketBrief.summary}</Text>
                </View>
              ) : null}

              {floorBeat ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>{floorBeat.title}</Text>
                  <Text style={styles.panelBody}>{floorBeat.summary}</Text>
                </View>
              ) : null}

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Decision Support</Text>
                <Text style={styles.panelBody}>{floorObjective}</Text>
                <Text style={styles.panelBody}>
                  HP is your current health for this dive. Chits are the permanent
                  currency you earn from payouts and spend between dives.
                </Text>
                <View style={styles.detailCard}>
                  <DetailLine label="Lead" value={activeCompanionName ?? 'Unknown'} />
                  <DetailLine label="Reserve" value={reserveCompanionName ?? 'Unknown'} />
                  <DetailLine
                    label="Gear"
                    value={
                      carriedItems.length > 0
                        ? carriedItems.map((item) => item.name).join(', ')
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
                        <Text style={styles.supportBody}>{card.summary}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>

              {canRotateAtFloorStart ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Floor Handoff</Text>
                  <Text style={styles.panelBody}>
                    New floor, new pressure. Swap the lead now if the reserve is a
                    better fit for the next room.
                  </Text>
                  <View style={styles.detailCard}>
                    <DetailLine label="Current lead" value={activeCompanionName ?? 'Unknown'} />
                    <DetailLine label="Reserve" value={reserveCompanionName ?? 'Unknown'} />
                  </View>
                  <View style={styles.actionGroup}>
                    <GameButton
                      label={
                        isRotatingActiveCompanion ? 'Rotating...' : 'Swap Lead and Reserve'
                      }
                      onPress={() => {
                        void handleRotateCompanion();
                      }}
                      disabled={isRotatingActiveCompanion}
                    />
                    <GameButton
                      label="Open Codex"
                      onPress={() => {
                        router.push('/codex?returnTo=%2Frun-map' as Href);
                      }}
                      variant="secondary"
                    />
                  </View>
                </View>
              ) : null}

              {!run.pendingReward ? (
                <View style={styles.panel}>
                  <Pressable
                    style={styles.toggleRow}
                    onPress={() => {
                      setShowBriefing((current) => !current);
                    }}
                    accessibilityRole="button"
                  >
                    <Text style={styles.panelTitle}>Mission Brief</Text>
                    <Text style={styles.toggleLabel}>
                      {showBriefing ? 'Hide' : 'Show'}
                    </Text>
                  </Pressable>
                  {showBriefing ? (
                    <>
                      <Text style={styles.panelBody}>
                        {classNarrative?.openingHook ??
                          'You are climbing because nobody above you intends to fix this honestly.'}
                      </Text>
                      <View style={styles.detailCard}>
                        <DetailLine
                          label="Why you climb"
                          value={
                            classNarrative?.stake ??
                            'Because the tower keeps billing survival as a workflow issue.'
                          }
                        />
                        {classNarrative ? (
                          <>
                            <DetailLine
                              label="Leadership broke"
                              value={classNarrative.leadershipFailure}
                            />
                            <DetailLine
                              label="Approval trap"
                              value={classNarrative.approvalConstraint}
                            />
                          </>
                        ) : null}
                      </View>
                    </>
                  ) : (
                    <Text style={styles.panelBody}>
                      Survive this floor, keep the crew alive, and pick the next problem on purpose.
                    </Text>
                  )}
                </View>
              ) : null}

              {run.pendingReward ? (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Reward Waiting</Text>
                  <Text style={styles.panelBody}>
                    Claim the current haul before you do anything else. This is the only forward path right now.
                  </Text>
                  <View style={styles.detailCard}>
                    <DetailLine label="Package" value={run.pendingReward.title} />
                    <DetailLine label="Chits" value={`+${run.pendingReward.metaCurrency}`} />
                    <DetailLine label="Recovery" value={`+${run.pendingReward.runHealing} HP`} />
                    <DetailLine
                      label="Item"
                      value={pendingRewardItem?.name ?? 'No item attached'}
                    />
                  </View>
                  <View style={styles.actionGroup}>
                    <GameButton
                      label="Claim Reward"
                      onPress={() => {
                        router.push('/reward' as Href);
                      }}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.panel}>
                  <Text style={styles.panelTitle}>Choose Your Next Stop</Text>
                  <Text style={styles.panelBody}>
                    Pick one room. The objective below tells you whether this floor needs a prep room, a boss gate, or just a straight advance.
                  </Text>
                  <LoopArtPanel
                    title={currentNode ? 'Selected Route' : 'Route Preview'}
                    body={
                      currentNode
                        ? `${currentNode.label}: ${summarizeRoute(currentNode)}`
                        : 'Choose a route below to preview what comes next.'
                    }
                    source={selectedRouteArtSource}
                    backgroundSource={runMapSurfaceArtSource}
                    frameVariant="portrait"
                  />
                  <View style={styles.choiceList}>
                    {floorChoices.map((node) => {
                      const isSelected = node.id === currentNode?.id;

                      return (
                        <Pressable
                          key={node.id}
                          style={[
                            styles.choiceCard,
                            isSelected ? styles.choiceCardSelected : null,
                          ]}
                          onPress={() => {
                            void handleChooseRoute(node.id);
                          }}
                          accessibilityRole="button"
                          accessibilityState={{ selected: isSelected }}
                        >
                          <View style={styles.choiceHeader}>
                            <View style={styles.choiceHeaderContent}>
                              <View style={styles.choiceIconWrap}>
                                <Image
                                  source={getRouteNodeArtSource(node.kind, settings)}
                                  style={styles.choiceIcon}
                                  resizeMode="contain"
                                />
                              </View>
                              <View style={styles.choiceTitleWrap}>
                                <Text style={styles.choiceEyebrow}>{getRoleCue(node)}</Text>
                                <Text style={styles.choiceTitle}>{node.label}</Text>
                              </View>
                            </View>
                            {isSelected ? (
                              <Text style={styles.choiceBadge}>Selected</Text>
                            ) : null}
                          </View>
                          <Text style={styles.choiceBody}>{node.description}</Text>
                          <Text style={styles.choiceHint}>{summarizeRoute(node)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  {currentNode ? (
                    <View style={styles.actionGroup}>
                      <GameButton
                        label={`Enter ${currentNode.label}`}
                        onPress={() => {
                          if (!currentNodeRoute) {
                            return;
                          }

                          recordRouteCommit({
                            runId: run.runId,
                            nodeId: currentNode.id,
                            floorIndex: run.floorIndex,
                          });
                          router.push(currentNodeRoute as Href);
                        }}
                      />
                      <GameButton
                        label="Open Codex"
                        onPress={() => {
                          router.push('/codex?returnTo=%2Frun-map' as Href);
                        }}
                        variant="secondary"
                      />
                      <GameButton
                        label="Employee Portal"
                        onPress={() => {
                          router.push('/' as Href);
                        }}
                        variant="secondary"
                      />
                    </View>
                  ) : null}
                </View>
              )}

              <View style={styles.panel}>
                <Pressable
                    style={styles.toggleRow}
                    onPress={() => {
                      setShowCrewNotes((current) => !current);
                    }}
                  accessibilityRole="button"
                >
                  <Text style={styles.panelTitle}>Crew Notes</Text>
                  <Text style={styles.toggleLabel}>
                    {showCrewNotes ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
                {showCrewNotes ? (
                  <>
                    <View style={styles.detailCard}>
                      <DetailLine label="Class" value={className ?? 'Unknown'} />
                      <DetailLine label="Lead" value={activeCompanionName ?? 'Unknown'} />
                      <DetailLine label="Reserve" value={reserveCompanionName ?? 'Unknown'} />
                      <DetailLine
                        label="Gear"
                        value={
                          carriedItems.length > 0
                            ? carriedItems.map((item) => item.name).join(', ')
                            : 'No contraband equipped yet'
                        }
                      />
                    </View>
                    {carriedItems.length > 0 ? (
                      <View style={styles.supportList}>
                        {carriedItems.map((item) => (
                          <View key={item.id} style={styles.supportCard}>
                            <Text style={styles.supportTitle}>{item.name}</Text>
                            <Text style={styles.supportBody}>{item.effectSummary}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
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
                            {card.nextUpgradeSummary ? (
                              <Text style={styles.supportUpgradeText}>
                                {card.nextUpgradeSummary}
                              </Text>
                            ) : null}
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {routeScene ? (
                      <View style={styles.detailCard}>
                        <Text style={styles.supportTitle}>{routeScene.title}</Text>
                        {routeScene.lines.map((line) => (
                          <Text key={line.speakerId} style={styles.supportBody}>
                            {line.speakerName}: {line.text}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </>
                ) : (
                  <Text style={styles.panelBody}>
                    Extra crew detail lives here once you want the fine print. The decision support panel above keeps the must-know notes closer to the route choice.
                  </Text>
                )}
              </View>

              <View style={styles.panel}>
                <Text style={styles.panelTitle}>Run Exit</Text>
                <Text style={styles.panelBody}>
                  Returning to the employee portal keeps the dive ready to
                  resume. Abandoning it ends the climb and records the fallout.
                </Text>
                {isAbandonConfirming ? (
                  <View style={styles.warningCard}>
                    <Text style={styles.warningTitle}>Confirm Abandon</Text>
                    <Text style={styles.warningBody}>{abandonWarning}</Text>
                    <View style={styles.actionGroup}>
                      <GameButton
                        label={isAbandoningRun ? 'Archiving...' : 'Confirm Abandon'}
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
                  <GameButton
                    label="Abandon Dive"
                    onPress={() => {
                      setIsAbandonConfirming(true);
                    }}
                    variant="secondary"
                  />
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FloorMarker({
  floor,
  isCurrent,
}: {
  floor: RunFloorState;
  isCurrent: boolean;
}) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);
  const markerStyle =
    floor.status === 'resolved'
      ? styles.floorMarkerResolved
      : isCurrent
        ? styles.floorMarkerCurrent
        : styles.floorMarkerLocked;

  return (
    <View style={[styles.floorMarker, markerStyle]}>
      <Text style={styles.floorMarkerText}>{floor.floorNumber}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.statCard}>
      <Text
        style={styles.statValue}
        numberOfLines={3}
        adjustsFontSizeToFit
        minimumFontScale={0.68}
      >
        {value}
      </Text>
      <Text
        style={styles.statLabel}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <Text style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
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
    errorBody: {
      color: colors.errorMuted,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    progressStrip: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs + 2,
    },
    floorMarker: {
      minWidth: 36,
      minHeight: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      paddingHorizontal: 8,
    },
    floorMarkerResolved: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
    },
    floorMarkerCurrent: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    floorMarkerLocked: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      opacity: 0.7,
    },
    floorMarkerText: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
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
      fontSize: scaleFontSize(18, settings),
      fontWeight: '900',
      lineHeight: scaleLineHeight(22, settings),
      textAlign: 'center',
      alignSelf: 'stretch',
    },
    statLabel: {
      color: colors.textMuted,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
      lineHeight: scaleLineHeight(16, settings),
      textAlign: 'center',
      alignSelf: 'stretch',
    },
    noticeText: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(18, settings),
    },
    choiceList: {
      gap: spacing.sm + 2,
    },
    choiceCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      gap: spacing.xs + 2,
      minHeight: 88,
    },
    choiceCardSelected: {
      borderColor: colors.accent,
    },
    choiceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    choiceHeaderContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    choiceIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 8,
    },
    choiceIcon: {
      width: 24,
      height: 24,
    },
    choiceTitleWrap: {
      flex: 1,
      gap: 2,
    },
    choiceEyebrow: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(11, settings),
      fontWeight: '800',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
      textTransform: 'uppercase',
    },
    choiceTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(18, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    choiceBadge: {
      color: colors.background,
      backgroundColor: colors.accent,
      fontSize: scaleFontSize(11, settings),
      fontWeight: '900',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      overflow: 'hidden',
    },
    choiceBody: {
      color: colors.textSecondary,
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    choiceHint: {
      color: colors.accent,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '700',
      lineHeight: scaleLineHeight(19, settings),
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: 48,
    },
    toggleLabel: {
      color: colors.accent,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(18, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
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
      fontSize: scaleFontSize(14, settings),
      lineHeight: scaleLineHeight(20, settings),
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
      fontSize: scaleFontSize(14, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
    },
    supportBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    supportUpgradeText: {
      color: colors.textSubtle,
      fontSize: scaleFontSize(12, settings),
      lineHeight: scaleLineHeight(18, settings),
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
      fontSize: scaleFontSize(15, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
    },
    warningBody: {
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
