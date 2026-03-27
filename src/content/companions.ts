import type { CompanionDefinition } from '@/src/types/content';

export const companionDefinitions: CompanionDefinition[] = [
  {
    id: 'facilities-goblin',
    name: 'Facilities Goblin',
    specialty: 'Traps / maintenance utility',
    description: 'A grime-coated survivalist who treats every hazard like a fixable work order.',
    unlockedByDefault: true,
  },
  {
    id: 'former-executive-assistant',
    name: 'Former Executive Assistant',
    specialty: 'Cooldown manipulation / boss reading',
    description: 'Knows how power moves before it happens and weaponizes that knowledge.',
    unlockedByDefault: true,
  },
  {
    id: 'security-skeleton',
    name: 'Security Skeleton',
    specialty: 'Guard / counter support',
    description: 'Deadpan enforcement with a literal bone-deep commitment to policy.',
    unlockCost: 28,
  },
  {
    id: 'possessed-copier',
    name: 'Possessed Copier',
    specialty: 'Duplication chaos / status spread',
    description: 'An office machine that learned malice and now copies problems.',
    unlockCost: 42,
  },
  {
    id: 'disillusioned-temp',
    name: 'Disillusioned Temp',
    specialty: 'Bargain skills / coward tech',
    description: 'Would rather leave, but until then remains weirdly resourceful.',
    unlockCost: 34,
  },
];

export const defaultUnlockedCompanionIds = companionDefinitions
  .filter((item) => item.unlockedByDefault)
  .map((item) => item.id);

export function getCompanionDefinition(companionId: string) {
  return companionDefinitions.find((item) => item.id === companionId) ?? null;
}

export function getCompanionUnlockCost(companionId: string) {
  return Math.max(
    0,
    Math.floor(getCompanionDefinition(companionId)?.unlockCost ?? 0)
  );
}
