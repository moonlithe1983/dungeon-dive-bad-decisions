import { create } from 'zustand';

import {
  createCombatStateForCurrentNode,
  performCombatAction as performCombatActionInEngine,
} from '@/src/engine/battle/combat-engine';
import { applyEventChoice } from '@/src/engine/event/event-engine';
import { applyPendingRewardToRun } from '@/src/engine/reward/apply-pending-reward-to-run';
import {
  createPendingReward,
  syncPendingRewardSelection,
} from '@/src/engine/reward/create-pending-reward';
import { createInitialRun } from '@/src/engine/run/create-initial-run';
import {
  canRotateActiveCompanionAtFloorStart,
  chooseCurrentRunNode,
  createAbandonedRunSnapshot,
  getCurrentRunNode,
  rotateActiveCompanionAtFloorStart as rotateActiveCompanionAtFloorStartInEngine,
  resolveCurrentRunNode,
  type ResolveCurrentNodeResult,
} from '@/src/engine/run/progress-run';
import {
  createArchivedRunDefeatSummary,
  applyResolvedNodeProgress,
  applyRunProgressDelta,
  createArchivedRunOutcomeNote,
} from '@/src/engine/run/run-summary';
import {
  clearActiveRunAsync,
  resumeActiveRunAsync,
  saveActiveRunAsync,
  saveBackupRunAsync,
} from '@/src/save/runRepo';
import { useGameStore } from '@/src/state/gameStore';
import { useProfileStore } from '@/src/state/profileStore';
import type { CombatActionId } from '@/src/types/combat';
import type {
  RewardClaimResult,
  RunState,
} from '@/src/types/run';

type RunLoadStatus = 'idle' | 'loading' | 'ready' | 'missing' | 'error';

type CombatActionResult = {
  run: RunState;
  outcome: 'ongoing' | 'victory' | 'defeat';
  nextRoute: '/battle' | '/reward' | '/run-map' | '/end-run';
};

type RewardProgressResult = RewardClaimResult & {
  addedRunItemId: string | null;
  healingApplied: number;
  maxHpDelta: number;
  run: RunState;
  nextRoute: '/run-map' | '/end-run';
};

type EventProgressResult = RewardClaimResult & {
  unlockedEventId: string;
  addedRunItemId: string | null;
  healingApplied: number;
  maxHpDelta: number;
  damageTaken: number;
  run: RunState;
  nextRoute: '/run-map' | '/end-run';
};

type AbandonRunResult = {
  run: RunState;
  nextRoute: '/end-run';
};

type RunStoreState = {
  currentRun: RunState | null;
  currentRunLoadStatus: RunLoadStatus;
  currentRunError: string | null;
  selectedClassId: string | null;
  selectedCompanionIds: string[];
  isCreatingRun: boolean;
  isResolvingNode: boolean;
  isPreparingCombat: boolean;
  isPerformingCombatAction: boolean;
  isPreparingReward: boolean;
  isSelectingRewardOption: boolean;
  isClaimingReward: boolean;
  isApplyingEventChoice: boolean;
  isRotatingActiveCompanion: boolean;
  isAbandoningRun: boolean;
  setupError: string | null;
  beginNewRunSetup: () => void;
  setSelectedClassId: (classId: string) => void;
  toggleSelectedCompanionId: (companionId: string) => void;
  hydrateFromActiveRun: (run?: RunState | null) => Promise<RunState | null>;
  createRunFromSetup: () => Promise<RunState>;
  chooseCurrentNode: (nodeId: string) => Promise<RunState>;
  resolveCurrentNode: () => Promise<ResolveCurrentNodeResult>;
  prepareCombatForCurrentNode: () => Promise<RunState>;
  performCombatAction: (actionId: CombatActionId) => Promise<CombatActionResult>;
  applyEventChoice: (choiceId: string) => Promise<EventProgressResult>;
  preparePendingRewardForCurrentNode: () => Promise<RunState>;
  selectPendingRewardOption: (optionId: string) => Promise<RunState>;
  claimPendingReward: () => Promise<RewardProgressResult>;
  rotateActiveCompanionAtFloorStart: () => Promise<RunState>;
  abandonCurrentRun: () => Promise<AbandonRunResult>;
  clearCurrentRunState: () => void;
};

const RUN_SETUP_ERROR_MESSAGE =
  'The dungeon intake paperwork failed. Please try again.';

const RUN_RESOLUTION_ERROR_MESSAGE =
  'The current node refused to finalize. Please try again.';

const RUN_COMBAT_ERROR_MESSAGE =
  'The incident report could not be updated. Please try again.';

const RUN_REWARD_ERROR_MESSAGE =
  'The reward paperwork jammed. Please try again.';

const RUN_EVENT_ERROR_MESSAGE =
  'The event paperwork collapsed in committee. Please try again.';

const RUN_ROTATION_ERROR_MESSAGE =
  'The companion handoff could not be updated. Please try again.';

const RUN_ABANDON_ERROR_MESSAGE =
  'The abandonment request was lost in processing. Please try again.';

async function refreshBootstrapState() {
  await useGameStore.getState().refreshBootstrap();
}

function getOnlyUnlockedClassId() {
  const profile =
    useProfileStore.getState().profile ?? useGameStore.getState().profile;

  if (!profile || profile.unlockedClassIds.length !== 1) {
    return null;
  }

  return profile.unlockedClassIds[0] ?? null;
}

function setCurrentRunReady(set: (next: Partial<RunStoreState>) => void, run: RunState) {
  set({
    currentRun: run,
    currentRunLoadStatus: 'ready',
    currentRunError: null,
  });
}

function applyCombatHealthProgress(previousRun: RunState, nextRun: RunState) {
  const hpDelta = nextRun.hero.currentHp - previousRun.hero.currentHp;

  if (hpDelta > 0) {
    return applyRunProgressDelta(nextRun, {
      healingReceived: hpDelta,
    });
  }

  if (hpDelta < 0) {
    return applyRunProgressDelta(nextRun, {
      damageTaken: Math.abs(hpDelta),
    });
  }

  return nextRun;
}

function applyResolvedNodeStats(
  resolution: ResolveCurrentNodeResult
): ResolveCurrentNodeResult {
  return {
    ...resolution,
    run: applyResolvedNodeProgress(resolution.run, resolution.resolvedNode.kind),
  };
}

export const useRunStore = create<RunStoreState>((set, get) => ({
  currentRun: null,
  currentRunLoadStatus: 'idle',
  currentRunError: null,
  selectedClassId: null,
  selectedCompanionIds: [],
  isCreatingRun: false,
  isResolvingNode: false,
  isPreparingCombat: false,
  isPerformingCombatAction: false,
  isPreparingReward: false,
  isSelectingRewardOption: false,
  isClaimingReward: false,
  isApplyingEventChoice: false,
  isRotatingActiveCompanion: false,
  isAbandoningRun: false,
  setupError: null,
  beginNewRunSetup: () => {
    const onlyUnlockedClassId = getOnlyUnlockedClassId();

    set({
      currentRun: null,
      currentRunLoadStatus: 'idle',
      currentRunError: null,
      selectedClassId: onlyUnlockedClassId,
      selectedCompanionIds: [],
      isCreatingRun: false,
      isResolvingNode: false,
      isPreparingCombat: false,
      isPerformingCombatAction: false,
      isPreparingReward: false,
      isSelectingRewardOption: false,
      isClaimingReward: false,
      isApplyingEventChoice: false,
      isRotatingActiveCompanion: false,
      isAbandoningRun: false,
      setupError: null,
    });
  },
  setSelectedClassId: (classId) => {
    set({
      selectedClassId: classId,
      setupError: null,
    });
  },
  toggleSelectedCompanionId: (companionId) => {
    const { selectedCompanionIds } = get();

    if (selectedCompanionIds.includes(companionId)) {
      set({
        selectedCompanionIds: selectedCompanionIds.filter(
          (item) => item !== companionId
        ),
        setupError: null,
      });
      return;
    }

    if (selectedCompanionIds.length >= 2) {
      set({
        setupError: 'Choose exactly two companions for the run.',
      });
      return;
    }

    set({
      selectedCompanionIds: [...selectedCompanionIds, companionId],
      setupError: null,
    });
  },
  hydrateFromActiveRun: async (run) => {
    set({
      currentRunLoadStatus: 'loading',
      currentRunError: null,
    });

    try {
      const nextRun = run === undefined ? await resumeActiveRunAsync() : run;

      set({
        currentRun: nextRun,
        currentRunLoadStatus: nextRun ? 'ready' : 'missing',
        currentRunError: null,
      });

      return nextRun;
    } catch (error) {
      set({
        currentRun: null,
        currentRunLoadStatus: 'error',
        currentRunError:
          error instanceof Error && error.message
            ? error.message
            : 'Unable to recover the current dive.',
      });

      return null;
    }
  },
  createRunFromSetup: async () => {
    const { selectedClassId, selectedCompanionIds } = get();
    const resolvedClassId = selectedClassId ?? getOnlyUnlockedClassId();

    if (!resolvedClassId) {
      throw new Error('Pick a class before starting a new dive.');
    }

    if (selectedCompanionIds.length !== 2) {
      throw new Error('Pick exactly two companions before starting a new dive.');
    }

    set({
      isCreatingRun: true,
      setupError: null,
    });

    try {
      const profileStore = useProfileStore.getState();
      const profile = profileStore.profile ?? (await profileStore.refreshProfile());
      const initialRun = createInitialRun({
        heroClassId: resolvedClassId,
        chosenCompanionIds: selectedCompanionIds,
        companionBondLevels: selectedCompanionIds.reduce<Record<string, number>>(
          (totals, companionId) => {
            totals[companionId] = profile.bondLevels[companionId] ?? 1;
            return totals;
          },
          {}
        ),
        metaUpgradeLevels: profile.metaUpgradeLevels,
      });
      const savedRun = await saveActiveRunAsync(initialRun);

      await saveBackupRunAsync(savedRun);
      await refreshBootstrapState();

      set({
        currentRun: savedRun,
        currentRunLoadStatus: 'ready',
        currentRunError: null,
        selectedClassId: resolvedClassId,
        isCreatingRun: false,
        setupError: null,
      });

      return savedRun;
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_SETUP_ERROR_MESSAGE;

      set({
        isCreatingRun: false,
        setupError: message,
      });

      throw new Error(message);
    }
  },
  chooseCurrentNode: async (nodeId) => {
    const { currentRun } = get();

    if (!currentRun) {
      throw new Error('No active dive is loaded.');
    }

    try {
      const savedRun = await saveActiveRunAsync(chooseCurrentRunNode(currentRun, nodeId));
      await refreshBootstrapState();
      setCurrentRunReady(set, savedRun);
      return savedRun;
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_RESOLUTION_ERROR_MESSAGE;

      set({
        currentRunError: message,
      });

      throw new Error(message);
    }
  },
  resolveCurrentNode: async () => {
    const { currentRun } = get();

    if (!currentRun) {
      throw new Error('No active dive is loaded.');
    }

    set({
      isResolvingNode: true,
      currentRunError: null,
    });

    try {
      const resolution = applyResolvedNodeStats(resolveCurrentRunNode(currentRun));

      if (resolution.completedRun) {
        await clearActiveRunAsync({
          archive: {
            result: 'win',
            run: resolution.run,
            bossesKilledDelta: resolution.resolvedNode.kind === 'boss' ? 1 : 0,
            outcome: createArchivedRunOutcomeNote({
              result: 'win',
              run: resolution.run,
              currentNodeLabel: resolution.resolvedNode.label,
            }),
          },
        });
        await refreshBootstrapState();

        setCurrentRunReady(set, resolution.run);
        set({
          isResolvingNode: false,
        });

        return resolution;
      }

      const savedRun = await saveActiveRunAsync(resolution.run);
      await refreshBootstrapState();

      const persistedResolution: ResolveCurrentNodeResult = {
        ...resolution,
        run: savedRun,
      };

      setCurrentRunReady(set, savedRun);
      set({
        isResolvingNode: false,
      });

      return persistedResolution;
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_RESOLUTION_ERROR_MESSAGE;

      set({
        isResolvingNode: false,
        currentRunError: message,
      });

      throw new Error(message);
    }
  },
  prepareCombatForCurrentNode: async () => {
    const { currentRun } = get();

    if (!currentRun) {
      throw new Error('No active dive is loaded.');
    }

    if (currentRun.pendingReward) {
      throw new Error('Claim the pending reward before entering another fight.');
    }

    const currentNode = getCurrentRunNode(currentRun);

    if (!currentNode || (currentNode.kind !== 'battle' && currentNode.kind !== 'boss')) {
      throw new Error('The active node is not a combat encounter.');
    }

    if (
      currentRun.combatState &&
      currentRun.combatState.nodeId === currentNode.id &&
      currentRun.combatState.phase === 'player-turn'
    ) {
      return currentRun;
    }

    set({
      isPreparingCombat: true,
      currentRunError: null,
    });

    try {
      const combatState = createCombatStateForCurrentNode(currentRun);
      const savedRun = await saveActiveRunAsync({
        ...currentRun,
        hero: {
          currentHp: combatState.heroHp,
          maxHp: combatState.heroMaxHp,
        },
        combatState,
      });

      await refreshBootstrapState();
      setCurrentRunReady(set, savedRun);
      set({
        isPreparingCombat: false,
      });

      return savedRun;
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_COMBAT_ERROR_MESSAGE;

      set({
        isPreparingCombat: false,
        currentRunError: message,
      });

      throw new Error(message);
    }
  },
  performCombatAction: async (actionId) => {
    const { currentRun } = get();

    if (!currentRun) {
      throw new Error('No active dive is loaded.');
    }

    const currentNode = getCurrentRunNode(currentRun);

    if (!currentNode || (currentNode.kind !== 'battle' && currentNode.kind !== 'boss')) {
      throw new Error('The active node is not a combat encounter.');
    }

    if (!currentRun.combatState || currentRun.combatState.nodeId !== currentNode.id) {
      throw new Error('Combat has not been initialized for this encounter.');
    }

    set({
      isPerformingCombatAction: true,
      currentRunError: null,
    });

    try {
      const combatResult = performCombatActionInEngine(currentRun, actionId);
      const progressedCombatRun = applyCombatHealthProgress(
        currentRun,
        combatResult.run
      );

      if (combatResult.outcome === 'ongoing') {
        const savedRun = await saveActiveRunAsync(progressedCombatRun);
        await refreshBootstrapState();

        setCurrentRunReady(set, savedRun);
        set({
          isPerformingCombatAction: false,
        });

        return {
          run: savedRun,
          outcome: 'ongoing',
          nextRoute: '/battle',
        };
      }

      if (combatResult.outcome === 'defeat') {
        const failedRun: RunState = {
          ...progressedCombatRun,
          runStatus: 'failed',
          combatState: null,
          pendingReward: null,
        };

        await clearActiveRunAsync({
          archive: {
            result: 'loss',
            run: failedRun,
            outcome: createArchivedRunOutcomeNote({
              result: 'loss',
              run: failedRun,
              currentNodeLabel: currentNode.label,
              enemyName: combatResult.combat.enemy.name,
            }),
            defeatSummary: createArchivedRunDefeatSummary({
              combat: combatResult.combat,
              currentNodeLabel: currentNode.label,
            }),
          },
        });
        await refreshBootstrapState();

        setCurrentRunReady(set, failedRun);
        set({
          isPerformingCombatAction: false,
        });

        return {
          run: failedRun,
          outcome: 'defeat',
          nextRoute: '/end-run',
        };
      }

      const resolvedCombatRun: RunState = {
        ...progressedCombatRun,
        combatState: null,
      };

      if (currentNode.kind === 'boss') {
        const resolution = applyResolvedNodeStats(resolveCurrentRunNode({
          ...resolvedCombatRun,
          pendingReward: null,
        }));

        if (resolution.completedRun) {
          await clearActiveRunAsync({
            archive: {
              result: 'win',
              run: resolution.run,
              bossesKilledDelta: 1,
              outcome: createArchivedRunOutcomeNote({
                result: 'win',
                run: resolution.run,
                currentNodeLabel: resolution.resolvedNode.label,
              }),
            },
          });
          await refreshBootstrapState();

          setCurrentRunReady(set, resolution.run);
          set({
            isPerformingCombatAction: false,
          });

          return {
            run: resolution.run,
            outcome: 'victory',
            nextRoute: '/end-run',
          };
        }

        const savedRun = await saveActiveRunAsync(resolution.run);
        await refreshBootstrapState();
        setCurrentRunReady(set, savedRun);
        set({
          isPerformingCombatAction: false,
        });

        return {
          run: savedRun,
          outcome: 'victory',
          nextRoute: '/run-map',
        };
      }

      const pendingReward = createPendingReward(
        resolvedCombatRun,
        currentNode,
        'battle-victory'
      );
      const resolution = applyResolvedNodeStats(resolveCurrentRunNode({
        ...resolvedCombatRun,
        pendingReward,
      }));

      if (resolution.completedRun) {
        await clearActiveRunAsync({
          archive: {
            result: 'win',
            run: resolution.run,
            bossesKilledDelta: resolution.resolvedNode.kind === 'boss' ? 1 : 0,
            outcome: createArchivedRunOutcomeNote({
              result: 'win',
              run: resolution.run,
              currentNodeLabel: resolution.resolvedNode.label,
            }),
          },
        });
        await refreshBootstrapState();

        setCurrentRunReady(set, resolution.run);
        set({
          isPerformingCombatAction: false,
        });

        return {
          run: resolution.run,
          outcome: 'victory',
          nextRoute: '/end-run',
        };
      }

      const savedRun = await saveActiveRunAsync(resolution.run);
      await refreshBootstrapState();

      setCurrentRunReady(set, savedRun);
      set({
        isPerformingCombatAction: false,
      });

      return {
        run: savedRun,
        outcome: 'victory',
        nextRoute: '/reward',
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_COMBAT_ERROR_MESSAGE;

      set({
        isPerformingCombatAction: false,
        currentRunError: message,
      });

      throw new Error(message);
    }
  },
  applyEventChoice: async (choiceId) => {
    const { currentRun } = get();

    if (!currentRun) {
      throw new Error('No active dive is loaded.');
    }

    const currentNode = getCurrentRunNode(currentRun);

    if (!currentNode || currentNode.kind !== 'event') {
      throw new Error('The active node is not an event encounter.');
    }

    set({
      isApplyingEventChoice: true,
      currentRunError: null,
    });

    try {
      const eventResult = applyEventChoice(currentRun, choiceId);
      const profileResult = await useProfileStore.getState().applyEventChoice({
        eventId: eventResult.eventId,
        reward: {
          rewardId: `profile-event-${eventResult.eventId}-${eventResult.choice.id}`,
          sourceNodeId: currentNode.id,
          sourceKind: 'reward-node',
          title: eventResult.choice.label,
          description: eventResult.choice.outcomeText,
          selectedOptionId: null,
          options: null,
          metaCurrency: eventResult.choice.effect.metaCurrency,
          runHealing: eventResult.choice.effect.runHealing,
          itemId: eventResult.choice.effect.itemId,
          createdAt: currentRun.updatedAt,
        },
      });
      const progressedEventRun = applyRunProgressDelta(eventResult.run, {
        metaCurrencyEarned: profileResult.metaCurrencyAwarded,
        damageTaken: eventResult.damageTaken,
        healingReceived: eventResult.healingApplied,
        collectedItemId: eventResult.addedRunItemId,
      });
      const resolution = applyResolvedNodeStats(
        resolveCurrentRunNode(progressedEventRun)
      );

      if (resolution.completedRun) {
        await clearActiveRunAsync({
          archive: {
            result: 'win',
            run: resolution.run,
            bossesKilledDelta: resolution.resolvedNode.kind === 'boss' ? 1 : 0,
            outcome: createArchivedRunOutcomeNote({
              result: 'win',
              run: resolution.run,
              currentNodeLabel: resolution.resolvedNode.label,
            }),
          },
        });
        await refreshBootstrapState();

        setCurrentRunReady(set, resolution.run);
        set({
          isApplyingEventChoice: false,
        });

        return {
          ...profileResult,
          unlockedEventId: profileResult.unlockedEventId,
          addedRunItemId: eventResult.addedRunItemId,
          healingApplied: eventResult.healingApplied,
          maxHpDelta: eventResult.maxHpDelta,
          damageTaken: eventResult.damageTaken,
          run: resolution.run,
          nextRoute: '/end-run',
        };
      }

      const savedRun = await saveActiveRunAsync(resolution.run);
      await refreshBootstrapState();

      setCurrentRunReady(set, savedRun);
      set({
        isApplyingEventChoice: false,
      });

      return {
        ...profileResult,
        unlockedEventId: profileResult.unlockedEventId,
        addedRunItemId: eventResult.addedRunItemId,
        healingApplied: eventResult.healingApplied,
        maxHpDelta: eventResult.maxHpDelta,
        damageTaken: eventResult.damageTaken,
        run: savedRun,
        nextRoute: '/run-map',
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_EVENT_ERROR_MESSAGE;

      set({
        isApplyingEventChoice: false,
        currentRunError: message,
      });

      throw new Error(message);
    }
  },
  preparePendingRewardForCurrentNode: async () => {
    const { currentRun } = get();

    if (!currentRun) {
      throw new Error('No active dive is loaded.');
    }

    if (currentRun.pendingReward) {
      return currentRun;
    }

    const currentNode = getCurrentRunNode(currentRun);

    if (!currentNode || currentNode.kind !== 'reward') {
      throw new Error('The active node is not a reward room.');
    }

    set({
      isPreparingReward: true,
      currentRunError: null,
    });

    try {
      const savedRun = await saveActiveRunAsync({
        ...currentRun,
        pendingReward: createPendingReward(currentRun, currentNode, 'reward-node'),
      });

      await refreshBootstrapState();
      setCurrentRunReady(set, savedRun);
      set({
        isPreparingReward: false,
      });

      return savedRun;
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_REWARD_ERROR_MESSAGE;

      set({
        isPreparingReward: false,
        currentRunError: message,
      });

      throw new Error(message);
    }
  },
  selectPendingRewardOption: async (optionId) => {
    const { currentRun } = get();

    if (!currentRun || !currentRun.pendingReward) {
      throw new Error('There is no pending reward to update.');
    }

    if (!currentRun.pendingReward.options?.length) {
      throw new Error('This reward does not offer multiple payout options.');
    }

    set({
      isSelectingRewardOption: true,
      currentRunError: null,
    });

    try {
      const savedRun = await saveActiveRunAsync({
        ...currentRun,
        pendingReward: syncPendingRewardSelection(currentRun.pendingReward, optionId),
      });

      await refreshBootstrapState();
      setCurrentRunReady(set, savedRun);
      set({
        isSelectingRewardOption: false,
      });

      return savedRun;
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_REWARD_ERROR_MESSAGE;

      set({
        isSelectingRewardOption: false,
        currentRunError: message,
      });

      throw new Error(message);
    }
  },
  claimPendingReward: async () => {
    const { currentRun } = get();

    if (!currentRun || !currentRun.pendingReward) {
      throw new Error('There is no pending reward to claim.');
    }

    set({
      isClaimingReward: true,
      currentRunError: null,
    });

    try {
      const reward = currentRun.pendingReward;
      const claimResult = await useProfileStore.getState().claimReward(reward);
      const runRewardResult = applyPendingRewardToRun(currentRun, reward);
      const rewardClearedRun = applyRunProgressDelta(
        {
          ...runRewardResult.run,
          pendingReward: null,
        },
        {
          rewardsClaimed: 1,
          metaCurrencyEarned: claimResult.metaCurrencyAwarded,
          healingReceived: runRewardResult.healingApplied,
          collectedItemId: runRewardResult.addedRunItemId,
        }
      );

      if (currentRun.currentNodeId === reward.sourceNodeId) {
        const resolution = applyResolvedNodeStats(
          resolveCurrentRunNode(rewardClearedRun)
        );

        if (resolution.completedRun) {
          await clearActiveRunAsync({
            archive: {
              result: 'win',
              run: resolution.run,
              bossesKilledDelta: resolution.resolvedNode.kind === 'boss' ? 1 : 0,
              outcome: createArchivedRunOutcomeNote({
                result: 'win',
                run: resolution.run,
                currentNodeLabel: resolution.resolvedNode.label,
              }),
            },
          });
          await refreshBootstrapState();

          setCurrentRunReady(set, resolution.run);
          set({
            isClaimingReward: false,
          });

          return {
            ...claimResult,
            addedRunItemId: runRewardResult.addedRunItemId,
            healingApplied: runRewardResult.healingApplied,
            maxHpDelta: runRewardResult.maxHpDelta,
            run: resolution.run,
            nextRoute: '/end-run',
          };
        }

        const savedRun = await saveActiveRunAsync(resolution.run);
        await refreshBootstrapState();

        setCurrentRunReady(set, savedRun);
        set({
          isClaimingReward: false,
        });

        return {
          ...claimResult,
          addedRunItemId: runRewardResult.addedRunItemId,
          healingApplied: runRewardResult.healingApplied,
          maxHpDelta: runRewardResult.maxHpDelta,
          run: savedRun,
          nextRoute: '/run-map',
        };
      }

      const savedRun = await saveActiveRunAsync(rewardClearedRun);
      await refreshBootstrapState();

      setCurrentRunReady(set, savedRun);
      set({
        isClaimingReward: false,
      });

      return {
        ...claimResult,
        addedRunItemId: runRewardResult.addedRunItemId,
        healingApplied: runRewardResult.healingApplied,
        maxHpDelta: runRewardResult.maxHpDelta,
        run: savedRun,
        nextRoute: '/run-map',
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_REWARD_ERROR_MESSAGE;

      set({
        isClaimingReward: false,
        currentRunError: message,
      });

      throw new Error(message);
    }
  },
  rotateActiveCompanionAtFloorStart: async () => {
    const { currentRun } = get();

    if (!currentRun) {
      throw new Error('No active dive is loaded.');
    }

    if (!canRotateActiveCompanionAtFloorStart(currentRun)) {
      throw new Error(
        'The reserve companion can only rotate in at the start of a new floor.'
      );
    }

    set({
      isRotatingActiveCompanion: true,
      currentRunError: null,
    });

    try {
      const savedRun = await saveActiveRunAsync(
        rotateActiveCompanionAtFloorStartInEngine(currentRun)
      );
      await refreshBootstrapState();

      setCurrentRunReady(set, savedRun);
      set({
        isRotatingActiveCompanion: false,
      });

      return savedRun;
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_ROTATION_ERROR_MESSAGE;

      set({
        isRotatingActiveCompanion: false,
        currentRunError: message,
      });

      throw new Error(message);
    }
  },
  abandonCurrentRun: async () => {
    const { currentRun } = get();

    if (!currentRun) {
      throw new Error('No active dive is loaded.');
    }

    set({
      isAbandoningRun: true,
      currentRunError: null,
    });

    try {
      const currentNode = getCurrentRunNode(currentRun);
      const abandonedRun = createAbandonedRunSnapshot(currentRun);

      await clearActiveRunAsync({
        archive: {
          result: 'abandon',
          run: abandonedRun,
          outcome: createArchivedRunOutcomeNote({
            result: 'abandon',
            run: abandonedRun,
            currentNodeLabel: currentNode?.label ?? null,
            pendingRewardLost: Boolean(currentRun.pendingReward),
          }),
        },
      });
      await refreshBootstrapState();

      setCurrentRunReady(set, abandonedRun);
      set({
        isAbandoningRun: false,
      });

      return {
        run: abandonedRun,
        nextRoute: '/end-run',
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : RUN_ABANDON_ERROR_MESSAGE;

      set({
        isAbandoningRun: false,
        currentRunError: message,
      });

      throw new Error(message);
    }
  },
  clearCurrentRunState: () => {
    set({
      currentRun: null,
      currentRunLoadStatus: 'idle',
      currentRunError: null,
      isResolvingNode: false,
      isPreparingCombat: false,
      isPerformingCombatAction: false,
      isPreparingReward: false,
      isSelectingRewardOption: false,
      isClaimingReward: false,
      isApplyingEventChoice: false,
      isRotatingActiveCompanion: false,
      isAbandoningRun: false,
    });
  },
}));
