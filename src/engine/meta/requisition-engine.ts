import {
  classDefinitions,
  getClassDefinition,
  getClassUnlockCost,
} from '@/src/content/classes';
import {
  companionDefinitions,
  getCompanionDefinition,
  getCompanionUnlockCost,
} from '@/src/content/companions';
import type { ProfileState } from '@/src/types/profile';

export type RequisitionKind = 'class' | 'companion';

export type RequisitionOffer = {
  kind: RequisitionKind;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cost: number;
  owned: boolean;
  affordable: boolean;
  shortage: number;
};

export type RequisitionCatalog = {
  classes: RequisitionOffer[];
  companions: RequisitionOffer[];
};

function buildOffer(input: {
  kind: RequisitionKind;
  id: string;
  title: string;
  subtitle: string;
  description: string;
  cost: number;
  owned: boolean;
  metaCurrency: number;
}): RequisitionOffer {
  const cost = Math.max(0, Math.floor(input.cost));
  const shortage = Math.max(0, cost - input.metaCurrency);

  return {
    kind: input.kind,
    id: input.id,
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    cost,
    owned: input.owned,
    affordable: input.owned || shortage === 0,
    shortage,
  };
}

export function buildRequisitionCatalog(profile: ProfileState): RequisitionCatalog {
  return {
    classes: classDefinitions.map((classDefinition) =>
      buildOffer({
        kind: 'class',
        id: classDefinition.id,
        title: classDefinition.name,
        subtitle: classDefinition.combatIdentity,
        description: classDefinition.description,
        cost: getClassUnlockCost(classDefinition.id),
        owned: profile.unlockedClassIds.includes(classDefinition.id),
        metaCurrency: profile.metaCurrency,
      })
    ),
    companions: companionDefinitions.map((companionDefinition) =>
      buildOffer({
        kind: 'companion',
        id: companionDefinition.id,
        title: companionDefinition.name,
        subtitle: companionDefinition.specialty,
        description: companionDefinition.description,
        cost: getCompanionUnlockCost(companionDefinition.id),
        owned: profile.unlockedCompanionIds.includes(companionDefinition.id),
        metaCurrency: profile.metaCurrency,
      })
    ),
  };
}

function purchaseUnlock(profile: ProfileState, offer: RequisitionOffer) {
  if (offer.owned) {
    throw new Error(`${offer.title} is already unlocked.`);
  }

  if (!offer.affordable) {
    throw new Error(
      `Need ${offer.shortage} more chit${offer.shortage === 1 ? '' : 's'} to unlock ${offer.title}.`
    );
  }

  return Math.max(0, profile.metaCurrency - offer.cost);
}

export function purchaseClassUnlock(profile: ProfileState, classId: string): ProfileState {
  const classDefinition = getClassDefinition(classId);

  if (!classDefinition) {
    throw new Error('That class requisition could not be found.');
  }

  const cost = getClassUnlockCost(classId);
  const metaCurrency = purchaseUnlock(profile, {
    kind: 'class',
    id: classId,
    title: classDefinition.name,
    subtitle: classDefinition.combatIdentity,
    description: classDefinition.description,
    cost,
    owned: profile.unlockedClassIds.includes(classId),
    affordable: profile.metaCurrency >= cost,
    shortage: Math.max(0, cost - profile.metaCurrency),
  });

  return {
    ...profile,
    metaCurrency,
    unlockedClassIds: Array.from(new Set([...profile.unlockedClassIds, classId])),
  };
}

export function purchaseCompanionUnlock(
  profile: ProfileState,
  companionId: string
): ProfileState {
  const companionDefinition = getCompanionDefinition(companionId);

  if (!companionDefinition) {
    throw new Error('That companion requisition could not be found.');
  }

  const cost = getCompanionUnlockCost(companionId);
  const metaCurrency = purchaseUnlock(profile, {
    kind: 'companion',
    id: companionId,
    title: companionDefinition.name,
    subtitle: companionDefinition.specialty,
    description: companionDefinition.description,
    cost,
    owned: profile.unlockedCompanionIds.includes(companionId),
    affordable: profile.metaCurrency >= cost,
    shortage: Math.max(0, cost - profile.metaCurrency),
  });

  return {
    ...profile,
    metaCurrency,
    unlockedCompanionIds: Array.from(
      new Set([...profile.unlockedCompanionIds, companionId])
    ),
    bondLevels: {
      ...profile.bondLevels,
      [companionId]: profile.bondLevels[companionId] ?? 1,
    },
  };
}
