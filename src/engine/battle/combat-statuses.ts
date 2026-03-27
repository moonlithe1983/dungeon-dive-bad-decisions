import { getStatusDefinition } from '@/src/content/statuses';
import type { CombatStatusId, CombatStatusState } from '@/src/types/combat';

export const allCombatStatusIds: CombatStatusId[] = [
  'burnout',
  'escalated',
  'on-hold',
  'micromanaged',
  'ccd',
];

function clampStatusDuration(turnsRemaining: number) {
  return Math.max(1, Math.floor(Number.isFinite(turnsRemaining) ? turnsRemaining : 1));
}

export function isCombatStatusId(value: unknown): value is CombatStatusId {
  return (
    typeof value === 'string' &&
    allCombatStatusIds.includes(value as CombatStatusId)
  );
}

export function normalizeCombatStatuses(
  statuses?: CombatStatusState[] | null
): CombatStatusState[] {
  if (!Array.isArray(statuses)) {
    return [];
  }

  return statuses.reduce<CombatStatusState[]>((normalized, status) => {
    if (!status || !isCombatStatusId(status.id)) {
      return normalized;
    }

    const turnsRemaining = clampStatusDuration(status.turnsRemaining);
    const existingIndex = normalized.findIndex((item) => item.id === status.id);

    if (existingIndex >= 0) {
      normalized[existingIndex] = {
        id: status.id,
        turnsRemaining: Math.max(
          normalized[existingIndex].turnsRemaining,
          turnsRemaining
        ),
      };
      return normalized;
    }

    normalized.push({
      id: status.id,
      turnsRemaining,
    });

    return normalized;
  }, []);
}

export function hasCombatStatus(
  statuses: CombatStatusState[],
  statusId: CombatStatusId
) {
  return statuses.some((status) => status.id === statusId);
}

export function applyCombatStatus(
  statuses: CombatStatusState[],
  statusId: CombatStatusId,
  turnsRemaining: number
) {
  const normalized = normalizeCombatStatuses(statuses);
  const nextTurns = clampStatusDuration(turnsRemaining);
  const existingIndex = normalized.findIndex((status) => status.id === statusId);

  if (existingIndex >= 0) {
    normalized[existingIndex] = {
      id: statusId,
      turnsRemaining: Math.max(
        normalized[existingIndex].turnsRemaining,
        nextTurns
      ),
    };

    return normalized;
  }

  return [
    ...normalized,
    {
      id: statusId,
      turnsRemaining: nextTurns,
    },
  ];
}

export function removeCombatStatus(
  statuses: CombatStatusState[],
  statusId: CombatStatusId
) {
  return normalizeCombatStatuses(statuses).filter((status) => status.id !== statusId);
}

export function consumeCombatStatusTurns(statuses: CombatStatusState[]) {
  return normalizeCombatStatuses(statuses)
    .map((status) => ({
      ...status,
      turnsRemaining: status.turnsRemaining - 1,
    }))
    .filter((status) => status.turnsRemaining > 0);
}

export function getCombatStatusOutgoingDamagePenalty(
  statuses: CombatStatusState[]
) {
  let penalty = 0;

  if (hasCombatStatus(statuses, 'burnout')) {
    penalty += 2;
  }

  if (hasCombatStatus(statuses, 'micromanaged')) {
    penalty += 1;
  }

  if (hasCombatStatus(statuses, 'on-hold')) {
    penalty += 3;
  }

  return penalty;
}

export function getCombatStatusOutgoingHealingPenalty(
  statuses: CombatStatusState[]
) {
  let penalty = 0;

  if (hasCombatStatus(statuses, 'burnout')) {
    penalty += 2;
  }

  if (hasCombatStatus(statuses, 'micromanaged')) {
    penalty += 1;
  }

  return penalty;
}

export function getCombatStatusIncomingDamageBonus(
  statuses: CombatStatusState[]
) {
  let bonus = 0;

  if (hasCombatStatus(statuses, 'escalated')) {
    bonus += 2;
  }

  if (hasCombatStatus(statuses, 'ccd')) {
    bonus += 1;
  }

  return bonus;
}

export function formatCombatStatusLabel(status: CombatStatusState) {
  const statusName = getStatusDefinition(status.id)?.name ?? status.id;
  return `${statusName} (${status.turnsRemaining})`;
}
