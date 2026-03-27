import type { ClassDefinition } from '@/src/types/content';

export const classDefinitions: ClassDefinition[] = [
  {
    id: 'it-support',
    name: 'IT Support',
    combatIdentity: 'Control / cleanse / disruption',
    description: 'Stabilizes disasters, strips status clutter, and ruins enemy plans.',
    unlockedByDefault: true,
  },
  {
    id: 'customer-service-rep',
    name: 'Customer Service Rep',
    combatIdentity: 'Sustain / mitigation / retaliation',
    description: 'Survives impossible demands and turns pressure back on the enemy.',
    unlockCost: 32,
  },
  {
    id: 'sales-rep',
    name: 'Sales Rep',
    combatIdentity: 'Burst / momentum / risk-reward',
    description: 'Stacks pressure fast and cashes in on ugly high-variance turns.',
    unlockCost: 38,
  },
  {
    id: 'intern',
    name: 'Intern',
    combatIdentity: 'Chaos / scaling / survival comedy',
    description: 'Starts fragile, grows weirdly strong, and keeps failing upward.',
    unlockCost: 26,
  },
  {
    id: 'paralegal',
    name: 'Paralegal',
    combatIdentity: 'Precision / contract traps / punish windows',
    description: 'Punishes intent lines and wins through exact timing.',
    unlockCost: 48,
  },
];

export const defaultUnlockedClassIds = classDefinitions
  .filter((item) => item.unlockedByDefault)
  .map((item) => item.id);

export function getClassDefinition(classId: string) {
  return classDefinitions.find((item) => item.id === classId) ?? null;
}

export function getClassUnlockCost(classId: string) {
  return Math.max(0, Math.floor(getClassDefinition(classId)?.unlockCost ?? 0));
}
