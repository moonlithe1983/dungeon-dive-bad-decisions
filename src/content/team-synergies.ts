import { getClassDefinition } from '@/src/content/classes';
import { getCompanionDefinition } from '@/src/content/companions';
import type { CombatActionId } from '@/src/types/combat';
import type { RunState } from '@/src/types/run';

type TeamCompositionInput = {
  heroClassId: string;
  activeCompanionId: string | null;
  chosenCompanionIds: string[];
};

type TeamSynergyCombatBonus = {
  actionId: CombatActionId;
  label: string;
  damageBonus?: number;
  healingBonus?: number;
  recoilBonus?: number;
  retaliationReduction?: number;
  stabilizeDamage?: number;
  directHeal?: number;
  note: string;
};

type TeamSynergyEventBonus = {
  eventId: string;
  choiceId: string;
  label: string;
  metaCurrencyDelta?: number;
  runHealingDelta?: number;
  runDamageDelta?: number;
  outcomeSuffix: string;
};

type TeamSynergyRewardBonus = {
  optionId: string;
  label: string;
  metaCurrencyDelta?: number;
  runHealingDelta?: number;
};

type TeamSynergyDefinition = {
  id: string;
  title: string;
  summary: string;
  requiredClassId?: string;
  requiredActiveCompanionId?: string;
  requiredCompanionIds?: [string, string];
  combatBonuses?: TeamSynergyCombatBonus[];
  eventBonuses?: TeamSynergyEventBonus[];
  rewardBonuses?: TeamSynergyRewardBonus[];
};

export type TeamSynergyCard = {
  id: string;
  title: string;
  summary: string;
  triggerLabel: string;
};

export type ResolvedTeamCombatBonus = TeamSynergyCombatBonus & {
  synergyId: string;
  synergyTitle: string;
};

export type ResolvedTeamEventBonus = TeamSynergyEventBonus & {
  synergyId: string;
  synergyTitle: string;
};

export type ResolvedTeamRewardBonus = TeamSynergyRewardBonus & {
  synergyId: string;
  synergyTitle: string;
};

const teamSynergyDefinitions: TeamSynergyDefinition[] = [
  {
    id: 'executive-triage',
    title: 'Executive Triage',
    summary:
      'Patch deals +1 damage and takes 1 less retaliation. CC the Reserve pays +1 scrap. Expense Fraud pays +2 scrap.',
    requiredClassId: 'it-support',
    requiredActiveCompanionId: 'former-executive-assistant',
    combatBonuses: [
      {
        actionId: 'patch',
        label:
          'Executive Triage sharpens the fix and strips one layer of immediate fallout.',
        damageBonus: 1,
        retaliationReduction: 1,
        note: 'Executive Triage adds 1 damage and reduces retaliation by 1.',
      },
    ],
    eventBonuses: [
      {
        eventId: 'mandatory-feedback-loop',
        choiceId: 'cc-the-reserve',
        label:
          'Executive Triage spots the exact reply chain that still has budget attached.',
        metaCurrencyDelta: 1,
        outcomeSuffix:
          'The assistant flags the one surviving thread that still leads to money instead of noise.',
      },
    ],
    rewardBonuses: [
      {
        optionId: 'expense-fraud',
        label:
          'Executive Triage knows which reimbursement line will actually clear.',
        metaCurrencyDelta: 2,
      },
    ],
  },
  {
    id: 'paperwork-expedition',
    title: 'Paperwork Expedition',
    summary:
      'Stabilize restores +2 HP. Loot the Welcome Bag restores +2 HP. Triage Cart restores +2 HP.',
    requiredCompanionIds: ['former-executive-assistant', 'facilities-goblin'],
    combatBonuses: [
      {
        actionId: 'stabilize',
        label:
          'Paperwork Expedition turns the emergency fix into a cleaner field patch.',
        healingBonus: 2,
        note: 'Paperwork Expedition adds 2 healing.',
      },
    ],
    eventBonuses: [
      {
        eventId: 'unsafe-team-building',
        choiceId: 'loot-welcome-bag',
        label:
          'Paperwork Expedition strips the useful supplies out before morale can ruin them.',
        runHealingDelta: 2,
        outcomeSuffix:
          'Between the goblin hands and the assistant priorities, the swag finally turns into usable recovery.',
      },
    ],
    rewardBonuses: [
      {
        optionId: 'triage-cart',
        label:
          'Paperwork Expedition turns the cart into a cleaner recovery haul.',
        runHealingDelta: 2,
      },
    ],
  },
  {
    id: 'boardroom-lockdown',
    title: 'Boardroom Lockdown',
    summary:
      'Escalate deals +2 damage and takes 1 less retaliation. Nominate the Reserve Bidder pays +2 scrap. Black Card Overage pays +2 scrap.',
    requiredCompanionIds: ['former-executive-assistant', 'security-skeleton'],
    combatBonuses: [
      {
        actionId: 'escalate',
        label:
          'Boardroom Lockdown turns the escalation into a coordinated squeeze.',
        damageBonus: 2,
        retaliationReduction: 1,
        note: 'Boardroom Lockdown adds 2 damage and reduces retaliation by 1.',
      },
    ],
    eventBonuses: [
      {
        eventId: 'golden-parachute-auction',
        choiceId: 'nominate-the-reserve-bidder',
        label:
          'Boardroom Lockdown makes the handoff look official enough to skim harder.',
        metaCurrencyDelta: 2,
        outcomeSuffix:
          'The reserve bidder suddenly sounds legitimate, and the room leaves more value on the table.',
      },
    ],
    rewardBonuses: [
      {
        optionId: 'black-card-overage',
        label:
          'Boardroom Lockdown raids the executive slush line without breaking formation.',
        metaCurrencyDelta: 2,
      },
    ],
  },
  {
    id: 'panic-copy',
    title: 'Panic Copy',
    summary:
      'Patch deals +2 damage. Feed It Receipts gains +1 scrap and +1 HP. Contraband Locker pays +2 scrap.',
    requiredClassId: 'intern',
    requiredActiveCompanionId: 'possessed-copier',
    combatBonuses: [
      {
        actionId: 'patch',
        label:
          'Panic Copy duplicates the mistake until it starts hurting the enemy instead.',
        damageBonus: 2,
        note: 'Panic Copy adds 2 damage.',
      },
    ],
    eventBonuses: [
      {
        eventId: 'expense-report-exorcism',
        choiceId: 'feed-it-receipts',
        label:
          'Panic Copy turns the haunting into one more profitable filing disaster.',
        metaCurrencyDelta: 1,
        runHealingDelta: 1,
        outcomeSuffix:
          'The copier and the intern somehow submit enough nonsense to make the ritual pay twice.',
      },
    ],
    rewardBonuses: [
      {
        optionId: 'contraband-locker',
        label:
          'Panic Copy turns the locker breach into a denser contraband payout.',
        metaCurrencyDelta: 2,
      },
    ],
  },
  {
    id: 'disaster-salvage',
    title: 'Disaster Salvage',
    summary:
      'Stabilize restores +1 HP. Let the Reserve Haggle gains +1 scrap and +1 HP. Concierge Crash Cart restores +2 HP.',
    requiredCompanionIds: ['facilities-goblin', 'disillusioned-temp'],
    combatBonuses: [
      {
        actionId: 'stabilize',
        label:
          'Disaster Salvage finds one more practical fix in the wreckage.',
        healingBonus: 1,
        note: 'Disaster Salvage adds 1 healing.',
      },
    ],
    eventBonuses: [
      {
        eventId: 'shadow-it-market',
        choiceId: 'let-the-reserve-haggle',
        label:
          'Disaster Salvage turns the ugly deal into a slightly better survival story.',
        metaCurrencyDelta: 1,
        runHealingDelta: 1,
        outcomeSuffix:
          'They walk away with one extra useful part and just enough dignity to count as recovery.',
      },
    ],
    rewardBonuses: [
      {
        optionId: 'concierge-crash-cart',
        label:
          'Disaster Salvage strips the luxury kit down to the parts that actually keep you standing.',
        runHealingDelta: 2,
      },
    ],
  },
];

function hasRequiredCompanionPair(
  input: TeamCompositionInput,
  requiredCompanionIds?: [string, string]
) {
  if (!requiredCompanionIds) {
    return true;
  }

  return requiredCompanionIds.every((companionId) =>
    input.chosenCompanionIds.includes(companionId)
  );
}

function matchesTeamSynergy(
  definition: TeamSynergyDefinition,
  input: TeamCompositionInput
) {
  if (
    definition.requiredClassId &&
    definition.requiredClassId !== input.heroClassId
  ) {
    return false;
  }

  if (
    definition.requiredActiveCompanionId &&
    definition.requiredActiveCompanionId !== input.activeCompanionId
  ) {
    return false;
  }

  return hasRequiredCompanionPair(input, definition.requiredCompanionIds);
}

function resolveTeamCompositionInput(
  input: Partial<TeamCompositionInput> & Pick<TeamCompositionInput, 'chosenCompanionIds'>
) {
  return {
    heroClassId: input.heroClassId ?? 'it-support',
    activeCompanionId: input.activeCompanionId ?? input.chosenCompanionIds[0] ?? null,
    chosenCompanionIds: input.chosenCompanionIds,
  };
}

function getTeamSynergyTriggerLabel(definition: TeamSynergyDefinition) {
  const triggerParts: string[] = [];

  if (definition.requiredClassId) {
    triggerParts.push(
      getClassDefinition(definition.requiredClassId)?.name ??
        definition.requiredClassId
    );
  }

  if (definition.requiredCompanionIds) {
    triggerParts.push(
      definition.requiredCompanionIds
        .map(
          (companionId) =>
            getCompanionDefinition(companionId)?.name ?? companionId
        )
        .join(' + ')
    );
  } else if (definition.requiredActiveCompanionId) {
    triggerParts.push(
      getCompanionDefinition(definition.requiredActiveCompanionId)?.name ??
        definition.requiredActiveCompanionId
    );
  }

  return triggerParts.join(' + ');
}

function getActiveTeamSynergyDefinitions(input: TeamCompositionInput) {
  return teamSynergyDefinitions.filter((definition) =>
    matchesTeamSynergy(definition, input)
  );
}

export function getActiveTeamSynergyCardsForParty(
  input: Partial<TeamCompositionInput> & Pick<TeamCompositionInput, 'chosenCompanionIds'>
): TeamSynergyCard[] {
  return getActiveTeamSynergyDefinitions(resolveTeamCompositionInput(input)).map(
    (definition) => ({
      id: definition.id,
      title: definition.title,
      summary: definition.summary,
      triggerLabel: getTeamSynergyTriggerLabel(definition),
    })
  );
}

export function getActiveTeamSynergyCards(run: RunState): TeamSynergyCard[] {
  return getActiveTeamSynergyCardsForParty({
    heroClassId: run.heroClassId,
    activeCompanionId: run.activeCompanionId,
    chosenCompanionIds: run.chosenCompanionIds,
  });
}

export function getTeamCombatSynergyBonuses(
  run: RunState,
  actionId: CombatActionId
): ResolvedTeamCombatBonus[] {
  return getActiveTeamSynergyDefinitions({
    heroClassId: run.heroClassId,
    activeCompanionId: run.activeCompanionId,
    chosenCompanionIds: run.chosenCompanionIds,
  }).flatMap((definition) =>
    (definition.combatBonuses ?? [])
      .filter((bonus) => bonus.actionId === actionId)
      .map((bonus) => ({
        ...bonus,
        synergyId: definition.id,
        synergyTitle: definition.title,
      }))
  );
}

export function getTeamEventSynergyBonuses(
  run: RunState,
  eventId: string,
  choiceId: string
): ResolvedTeamEventBonus[] {
  return getActiveTeamSynergyDefinitions({
    heroClassId: run.heroClassId,
    activeCompanionId: run.activeCompanionId,
    chosenCompanionIds: run.chosenCompanionIds,
  }).flatMap((definition) =>
    (definition.eventBonuses ?? [])
      .filter((bonus) => bonus.eventId === eventId && bonus.choiceId === choiceId)
      .map((bonus) => ({
        ...bonus,
        synergyId: definition.id,
        synergyTitle: definition.title,
      }))
  );
}

export function getTeamRewardSynergyBonuses(
  run: RunState,
  optionId: string
): ResolvedTeamRewardBonus[] {
  return getActiveTeamSynergyDefinitions({
    heroClassId: run.heroClassId,
    activeCompanionId: run.activeCompanionId,
    chosenCompanionIds: run.chosenCompanionIds,
  }).flatMap((definition) =>
    (definition.rewardBonuses ?? [])
      .filter((bonus) => bonus.optionId === optionId)
      .map((bonus) => ({
        ...bonus,
        synergyId: definition.id,
        synergyTitle: definition.title,
      }))
  );
}
