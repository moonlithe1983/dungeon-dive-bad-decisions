import {
  isCombatActionId,
  type CombatActionId,
} from '@/src/types/combat';

export type DominantHand = 'right' | 'left';
export type CombatControllerHint = 'A' | 'X' | 'Y' | 'B';

export const DEFAULT_COMBAT_ACTION_ORDER: CombatActionId[] = [
  'patch',
  'escalate',
  'stabilize',
  'dodge',
];

const controllerHintsByIndex: CombatControllerHint[] = ['A', 'X', 'Y', 'B'];

export function normalizeCombatActionOrder(
  value: CombatActionId[] | string[] | undefined | null
): CombatActionId[] {
  const uniqueIds: CombatActionId[] = Array.isArray(value)
    ? Array.from(new Set(value.filter(isCombatActionId))) as CombatActionId[]
    : [];

  return [
    ...uniqueIds,
    ...DEFAULT_COMBAT_ACTION_ORDER.filter((actionId) => !uniqueIds.includes(actionId)),
  ];
}

export function moveCombatAction(
  order: CombatActionId[],
  actionId: CombatActionId,
  delta: -1 | 1
) {
  const normalizedOrder = normalizeCombatActionOrder(order);
  const currentIndex = normalizedOrder.indexOf(actionId);

  if (currentIndex < 0) {
    return normalizedOrder;
  }

  const nextIndex = currentIndex + delta;

  if (nextIndex < 0 || nextIndex >= normalizedOrder.length) {
    return normalizedOrder;
  }

  const nextOrder = [...normalizedOrder];
  const [movedAction] = nextOrder.splice(currentIndex, 1);
  nextOrder.splice(nextIndex, 0, movedAction);
  return nextOrder;
}

export function getCombatControllerHintForIndex(index: number) {
  return controllerHintsByIndex[index] ?? null;
}

export function getCombatControllerHint(
  actionId: CombatActionId,
  actionOrder: CombatActionId[]
) {
  const normalizedOrder = normalizeCombatActionOrder(actionOrder);
  const actionIndex = normalizedOrder.indexOf(actionId);

  if (actionIndex < 0) {
    return null;
  }

  return getCombatControllerHintForIndex(actionIndex);
}

export function getCombatActionDisplayLabel(actionId: CombatActionId) {
  switch (actionId) {
    case 'patch':
      return 'Patch';
    case 'escalate':
      return 'Escalate';
    case 'stabilize':
      return 'Stabilize';
    case 'dodge':
      return 'Dodge';
    default:
      return actionId;
  }
}
