import type { ClassDefinition } from '@/src/types/content';

export const classDefinitions: ClassDefinition[] = [
  {
    id: 'it-support',
    name: 'IT Support',
    combatIdentity: 'Control / cleanse / disruption',
    description:
      'Keeps executive stupidity limping forward by locking enemies down and stripping the mess off the board.',
    unlockedByDefault: true,
  },
  {
    id: 'customer-service-rep',
    name: 'Customer Service Rep',
    combatIdentity: 'Sustain / mitigation / retaliation',
    description:
      'Outlasts impossible demands, steadies the room, and sends the pressure back with interest.',
    unlockCost: 32,
  },
  {
    id: 'sales-rep',
    name: 'Sales Rep',
    combatIdentity: 'Burst / momentum / risk-reward',
    description:
      'Turns ugly openings into commission-grade violence and cashes out on risky tempo swings.',
    unlockCost: 38,
  },
  {
    id: 'intern',
    name: 'Intern',
    combatIdentity: 'Chaos / scaling / survival comedy',
    description:
      'Begins disposable, grows alarming, and somehow keeps surviving the consequences.',
    unlockCost: 26,
  },
  {
    id: 'paralegal',
    name: 'Paralegal',
    combatIdentity: 'Precision / contract traps / punish windows',
    description:
      'Cuts through bad language, traps hostile intent, and wins on exact timing plus clean records.',
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
