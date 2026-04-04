import type { CompanionDefinition } from '@/src/types/content';

export const companionDefinitions: CompanionDefinition[] = [
  {
    id: 'facilities-goblin',
    name: 'Facilities Goblin',
    specialty: 'Traps / maintenance utility',
    description:
      'Lives in the walls, reads the building like an injury report, and treats survival like practical maintenance.',
    unlockedByDefault: true,
  },
  {
    id: 'former-executive-assistant',
    name: 'Former Executive Assistant',
    specialty: 'Cooldown manipulation / boss reading',
    description:
      'Knows the private panic behind polished statements and turns that foresight into clean, vicious timing.',
    unlockedByDefault: true,
  },
  {
    id: 'security-skeleton',
    name: 'Security Skeleton',
    specialty: 'Guard / counter support',
    description:
      'A dead guard the building still recognizes, with badge clearance, dry patience, and very little respect left.',
    unlockedByDefault: true,
    unlockCost: 28,
  },
  {
    id: 'possessed-copier',
    name: 'Possessed Copier',
    specialty: 'Duplication chaos / status spread',
    description:
      'A Project Everrise copier that learned malice and now duplicates the exact problems leadership denied.',
    unlockCost: 42,
  },
  {
    id: 'disillusioned-temp',
    name: 'Disillusioned Temp',
    specialty: 'Bargain skills / coward tech',
    description:
      'Survived Crown Meridian staffing churn long enough to turn cowardice into a dependable operating discipline.',
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
