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

import { getRouteNodeArtSource } from '@/src/assets/loop-art-sources';
import { trackAnalyticsEvent } from '@/src/analytics/client';
import { playUiSfx } from '@/src/audio/ui-sfx';
import {
  getBiomeAmbientArtSource,
  getFloorActHeaderSource,
  getFloorActLabelForIndex,
  getFloorBadgeArtSource,
  getFloorHeaderArtSource,
} from '@/src/assets/supplemental-art-sources';
import { getRunCompanionSupportCards } from '@/src/engine/bond/companion-perks';
import { GameButton } from '@/src/components/game-button';
import { playUiHaptic } from '@/src/haptics/ui-haptics';
import {
  getEarlyFloorBeat,
  getRotatedPartyScene,
} from '@/src/content/authored-voice';
import { getClassDefinition } from '@/src/content/classes';
import {
  COMPANY_NAME,
  TOWER_NAME,
  createClassRouteBrief,
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
import { useResponsiveLayout } from '@/src/hooks/use-responsive-layout';
import { useRunHelpStartsCollapsed } from '@/src/hooks/use-run-help-starts-collapsed';
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
    return 'Optional scavenging room. Good if you want supplies before the required fight.';
  }

  return 'Optional risk event. Take it for upside, fallout, and prep before the required fight.';
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

function getRouteRequirementLabel(node: RunNodeState) {
  if (node.kind === 'boss') {
    return 'Boss Gate';
  }

  if (node.kind === 'battle') {
    return 'Required Fight';
  }

  return 'Optional Prep';
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

  const activeBattleNode = activePrepNodes.find((node) => node.kind === 'battle') ?? null;
  const activeSideRoomNodes = activePrepNodes.filter((node) => node.kind !== 'battle');

  if (hasBossNode && activeBattleNode) {
    return activeSideRoomNodes.length > 0
      ? 'The side room is optional prep. This floor only opens the boss gate after the required fight is cleared.'
      : `Clear ${activeBattleNode.label} to unlock the boss gate for this floor.`;
  }

  if (activeBattleNode && activeSideRoomNodes.length > 0) {
    return 'The side room is optional prep. The floor only advances after you clear the fight.';
  }

  if (activeBattleNode && activeNodes.length === 1) {
    return `Clear ${activeBattleNode.label} to advance the ticket upward.`;
  }

  if (activeNodes.length > 1) {
    return 'Pick one active room to keep climbing.';
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
  const [showTicketSummary, setShowTicketSummary] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const { colors, settings } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );

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
  const singleOpenChoice = floorChoices.length === 1 ? floorChoices[0] ?? null : null;
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
  const helpStartsCollapsed = useRunHelpStartsCollapsed(
    run?.floorIndex ?? selectedFloor?.floorNumber ?? currentFloor?.floorNumber ?? 1
  );
  const routeScene = useMemo(() => {
    if (!run) {
      return null;
    }

    return getRotatedPartyScene(
      ['first-route-choice', 'first-route-choice-alt-1', 'first-route-choice-alt-2'],
      `${run.runId}:${run.floorIndex}:route-read`,
      run.chosenCompanionIds
    );
  }, [run]);
  const runMapAmbientArtSource = useMemo(
    () => getBiomeAmbientArtSource(run?.floorIndex, settings),
    [run?.floorIndex, settings]
  );
  const floorHeaderArtSource = useMemo(
    () => getFloorHeaderArtSource(run?.floorIndex, settings),
    [run?.floorIndex, settings]
  );
  const floorActHeaderSource = useMemo(
    () => getFloorActHeaderSource(run?.floorIndex, settings),
    [run?.floorIndex, settings]
  );
  const floorActLabel = useMemo(
    () => getFloorActLabelForIndex(run?.floorIndex),
    [run?.floorIndex]
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
  const floorThemeTitle = floorBeat?.title ?? 'Floor Theme';
  const floorThemeBody =
    floorBeat?.summary ??
    selectedFloor?.description ??
    currentFloor?.description ??
    'Each floor changes the kind of pressure on the run.';

  useEffect(() => {
    if (!run) {
      setIsAbandonConfirming(false);
    }
  }, [run]);

  useEffect(() => {
    setShowBriefing(!helpStartsCollapsed);
    setShowTicketSummary(!helpStartsCollapsed);
  }, [helpStartsCollapsed, run?.runId]);

  useEffect(() => {
    if (!run || run.pendingReward || run.combatState || canRotateAtFloorStart) {
      return;
    }

    if (!singleOpenChoice || currentNode?.id === singleOpenChoice.id) {
      return;
    }

    void chooseCurrentNode(singleOpenChoice.id).catch(() => {
      // Store captures the error for the UI.
    });
  }, [
    canRotateAtFloorStart,
    chooseCurrentNode,
    currentNode?.id,
    run,
    singleOpenChoice,
  ]);

  const handleAbandon = async () => {
    const result = await abandonCurrentRun();
    setIsAbandonConfirming(false);
    router.replace(`/end-run?runId=${encodeURIComponent(result.run.runId)}` as Href);
  };

  const handleRotateCompanion = async () => {
    await rotateActiveCompanionAtFloorStart();
  };

  const handleChooseRoute = async (nodeId: string) => {
    const changedSelection = currentNode?.id !== nodeId;

    if (run) {
      recordRouteSelection({
        runId: run.runId,
        changedSelection,
      });
    }

    if (!changedSelection) {
      void playUiHaptic('error', settings);
      void playUiSfx('invalid-tap', settings);
      return;
    }

    void playUiHaptic('select', settings);
    void playUiSfx('route-select', settings);
    if (run) {
      const selectedNode = floorChoices.find((node) => node.id === nodeId);
      void trackAnalyticsEvent('route_selected', {
        runId: run.runId,
        nodeId,
        floorIndex: run.floorIndex,
        kind: selectedNode?.kind ?? null,
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
                ? `${className ?? 'Your role'} and ${activeCompanionName ?? 'your crew'} are still inside ${COMPANY_NAME}. ${createClassRouteBrief(
                    run.heroClassId,
                    currentNode?.label ?? selectedFloor?.label ?? 'the next room'
                  )}`
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
                {floorActHeaderSource || floorHeaderArtSource ? (
                  <View style={styles.floorHeaderCard}>
                    {runMapAmbientArtSource ? (
                      <Image
                        source={runMapAmbientArtSource}
                        style={styles.floorHeaderAmbientArt}
                        resizeMode="cover"
                      />
                    ) : null}
                    {floorActHeaderSource ? (
                      <Image
                        source={floorActHeaderSource}
                        style={styles.floorActHeaderArt}
                        resizeMode="contain"
                      />
                    ) : null}
                    {floorHeaderArtSource ? (
                      <Image
                        source={floorHeaderArtSource}
                        style={styles.floorHeaderArt}
                        resizeMode="contain"
                      />
                    ) : null}
                    <View style={styles.floorHeaderCopy}>
                      <Text style={styles.floorHeaderEyebrow}>
                        {floorActLabel ?? 'Current Act'}
                      </Text>
                      <Text style={styles.floorHeaderTitle}>
                        {selectedFloor?.label ?? currentFloor?.label ?? 'Current floor'}
                      </Text>
                      <Text style={styles.floorHeaderBody}>
                        {selectedFloor?.description ?? currentFloor?.description}
                      </Text>
                    </View>
                  </View>
                ) : null}
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
                <Text style={styles.noticeText}>{floorObjective}</Text>
                {recoveredFromBackup ? (
                  <Text style={styles.noticeText}>
                    Recovered from your latest emergency save.
                  </Text>
                ) : null}
              </View>

              {ticketBrief ? (
                <View style={styles.panel}>
                  <Pressable
                    style={styles.toggleRow}
                    onPress={() => {
                      setShowTicketSummary((current) => !current);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Current ticket"
                    accessibilityHint={
                      showTicketSummary
                        ? 'Double tap to collapse the ticket summary.'
                        : 'Double tap to expand the ticket summary.'
                    }
                    accessibilityState={{ expanded: showTicketSummary }}
                  >
                    <Text style={styles.panelTitle}>Current Ticket</Text>
                    <Text style={styles.toggleLabel}>
                      {showTicketSummary ? 'Hide' : 'Show'}
                    </Text>
                  </Pressable>
                  <Text style={styles.panelBody}>
                    {ticketBrief.ticketId} - {ticketBrief.subject}
                  </Text>
                  {showTicketSummary ? (
                    <>
                      <View style={styles.detailCard}>
                        <DetailLine label="Opened by" value={ticketBrief.filedBy} />
                        <DetailLine
                          label="Escalation track"
                          value={ticketBrief.escalationTrack}
                        />
                        <DetailLine label="Current desk" value={ticketBrief.currentOwner} />
                      </View>
                      <Text style={styles.panelBody}>{ticketBrief.summary}</Text>
                    </>
                  ) : null}
                </View>
              ) : null}

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
                    Pick a room. Each card tells you if it is optional prep, the required fight, or the boss gate.
                  </Text>
                  <View style={styles.choiceList}>
                    {floorChoices.map((node) => {
                      const isSelected = node.id === currentNode?.id;
                      const nodeRoute = getRunNodeRoute(node.kind);
                      const requirementLabel = getRouteRequirementLabel(node);

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
                          accessibilityLabel={`${getRoleCue(node)} route. ${node.label}. ${node.description}`}
                          accessibilityHint={
                            isSelected
                              ? 'Already selected. Use the Enter action below to continue into this room.'
                              : `Double tap to select this route. ${summarizeRoute(node)}`
                          }
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
                                <Text style={styles.choiceEyebrow}>
                                  {getRoleCue(node)} | {requirementLabel}
                                </Text>
                                <Text style={styles.choiceTitle}>{node.label}</Text>
                              </View>
                            </View>
                            {isSelected ? (
                              <Text style={styles.choiceBadge}>Selected</Text>
                            ) : null}
                          </View>
                          <Text style={styles.choiceBody}>{node.description}</Text>
                          <Text style={styles.choiceHint}>{summarizeRoute(node)}</Text>
                          {isSelected ? (
                            <View style={styles.selectionDetailCard}>
                              <View style={styles.choiceIconWrap}>
                                <Image
                                  source={getRouteNodeArtSource(node.kind, settings)}
                                  style={styles.choiceIcon}
                                  resizeMode="contain"
                                />
                              </View>
                              <Text style={styles.selectionDetailName}>Selected route</Text>
                              <Text style={styles.selectionDetailBody}>
                                {requirementLabel}: {summarizeRoute(node)}
                              </Text>
                              <Text style={styles.selectionDetailBody}>
                                If you go now, you are entering {node.label.toLowerCase()}.
                              </Text>
                              <GameButton
                                label={`Enter ${node.label}`}
                                onPress={() => {
                                  recordRouteCommit({
                                    runId: run.runId,
                                    nodeId: node.id,
                                    floorIndex: run.floorIndex,
                                  });
                                  void trackAnalyticsEvent('route_committed', {
                                    runId: run.runId,
                                    nodeId: node.id,
                                    floorIndex: run.floorIndex,
                                    kind: node.kind,
                                  });
                                  void trackAnalyticsEvent('room_entered', {
                                    runId: run.runId,
                                    nodeId: node.id,
                                    floorIndex: run.floorIndex,
                                    kind: node.kind,
                                  });
                                  router.push(nodeRoute as Href);
                                }}
                              />
                            </View>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                  {singleOpenChoice && currentNode?.id !== singleOpenChoice.id ? (
                    <View style={styles.selectionDetailCard}>
                      <Text style={styles.selectionDetailName}>Only one room is open</Text>
                      <Text style={styles.selectionDetailBody}>
                        {singleOpenChoice.label}: {summarizeRoute(singleOpenChoice)}
                      </Text>
                      <GameButton
                        label={`Enter ${singleOpenChoice.label}`}
                        onPress={() => {
                          recordRouteCommit({
                            runId: run.runId,
                            nodeId: singleOpenChoice.id,
                            floorIndex: run.floorIndex,
                          });
                          void trackAnalyticsEvent('route_committed', {
                            runId: run.runId,
                            nodeId: singleOpenChoice.id,
                            floorIndex: run.floorIndex,
                            kind: singleOpenChoice.kind,
                          });
                          void trackAnalyticsEvent('room_entered', {
                            runId: run.runId,
                            nodeId: singleOpenChoice.id,
                            floorIndex: run.floorIndex,
                            kind: singleOpenChoice.kind,
                          });
                          router.push(getRunNodeRoute(singleOpenChoice.kind) as Href);
                        }}
                      />
                    </View>
                  ) : null}
                  {currentNode ? (
                    <View style={styles.actionGroup}>
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
                <Text style={styles.panelTitle}>Floor Read</Text>
                <View style={styles.detailCard}>
                  <Text style={styles.supportTitle}>{floorThemeTitle}</Text>
                  <Text style={styles.supportBody}>{floorThemeBody}</Text>
                </View>
                <Text style={styles.panelBody}>{floorObjective}</Text>
                {!helpStartsCollapsed ? (
                  <Text style={styles.panelBody}>
                    HP is your current run health. Chits are the currency you keep after the dive.
                  </Text>
                ) : null}
              </View>

              {!run.pendingReward ? (
                <View style={styles.panel}>
                  <Pressable
                    style={styles.toggleRow}
                    onPress={() => {
                      setShowBriefing((current) => !current);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel="Mission Brief"
                    accessibilityHint={
                      showBriefing
                        ? 'Double tap to collapse the mission brief.'
                        : 'Double tap to expand the mission brief.'
                    }
                    accessibilityState={{ expanded: showBriefing }}
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

              <View style={styles.panel}>
                <Pressable
                    style={styles.toggleRow}
                    onPress={() => {
                      setShowCrewNotes((current) => !current);
                    }}
                  accessibilityRole="button"
                  accessibilityLabel="Fine print"
                  accessibilityHint={
                    showCrewNotes
                      ? 'Double tap to collapse the crew notes.'
                      : 'Double tap to expand the crew notes.'
                  }
                  accessibilityState={{ expanded: showCrewNotes }}
                >
                  <Text style={styles.panelTitle}>Loadout and Crew</Text>
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
                    Your class kit, crew support, and carried gear stay here when you need the deeper read.
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
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );
  const markerStyle =
    floor.status === 'resolved'
      ? styles.floorMarkerResolved
      : isCurrent
        ? styles.floorMarkerCurrent
        : styles.floorMarkerLocked;
  const badgeSource = useMemo(
    () => getFloorBadgeArtSource(floor.floorNumber, settings),
    [floor.floorNumber, settings]
  );

  return (
    <View style={[styles.floorMarker, markerStyle]}>
      {badgeSource ? (
        <Image
          source={badgeSource}
          style={styles.floorMarkerBadge}
          resizeMode="contain"
        />
      ) : null}
      <Text style={styles.floorMarkerText}>{floor.floorNumber}</Text>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  const { colors, settings } = useAppTheme();
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );

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
  const layout = useResponsiveLayout();
  const styles = useMemo(
    () => createStyles(settings, colors, layout),
    [colors, layout, settings]
  );

  return (
    <Text style={styles.detailLine}>
      <Text style={styles.detailLabel}>{label}: </Text>
      {value}
    </Text>
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
    floorHeaderCard: {
      borderRadius: 16,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
      gap: spacing.xs,
      paddingBottom: spacing.sm + 2,
    },
    floorHeaderAmbientArt: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.16,
      width: undefined,
      height: undefined,
    },
    floorActHeaderArt: {
      width: '100%',
      height: 58,
      marginTop: spacing.xs,
      alignSelf: 'center',
    },
    floorHeaderArt: {
      width: '100%',
      height: 74,
      alignSelf: 'center',
    },
    floorHeaderCopy: {
      gap: spacing.xs,
      paddingHorizontal: spacing.sm + 2,
    },
    floorHeaderEyebrow: {
      color: colors.accent,
      fontSize: scaleFontSize(12, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(17, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    floorHeaderTitle: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(17, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(22, settings),
    },
    floorHeaderBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
    floorMarker: {
      width: 64,
      height: 48,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      paddingHorizontal: 4,
      overflow: 'hidden',
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
      fontSize: scaleFontSize(11, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(16, settings),
      position: 'absolute',
    },
    floorMarkerBadge: {
      width: 56,
      height: 24,
      opacity: 0.94,
    },
    statGrid: {
      flexDirection: layout.stackStatCards ? 'column' : 'row',
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
      flexDirection: layout.stackInlineHeader ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: layout.stackInlineHeader ? 'stretch' : 'flex-start',
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
      flexDirection: layout.stackInlineHeader ? 'column' : 'row',
      justifyContent: 'space-between',
      alignItems: layout.stackInlineHeader ? 'flex-start' : 'center',
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
    selectionDetailCard: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: 14,
      padding: 12,
      gap: spacing.sm,
    },
    selectionDetailName: {
      color: colors.accent,
      fontSize: scaleFontSize(13, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(18, settings),
      textTransform: 'uppercase',
      letterSpacing: 0.6 + (settings.dyslexiaAssistEnabled ? 0.16 : 0),
    },
    selectionDetailBody: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
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

