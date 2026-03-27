import { getCompanionDefinition } from '@/src/content/companions';
import {
  createEventClassMoment,
  getEventClassChoiceBonus,
} from '@/src/content/event-class-hooks';
import { getEventCompanionChoiceBonuses } from '@/src/content/event-companion-hooks';
import { getTeamEventSynergyBonuses } from '@/src/content/team-synergies';
import { createEventCompanionMoments } from '@/src/content/event-banter';
import { getEventDefinitionByTitle } from '@/src/content/events';
import { getItemDefinition, itemDefinitions } from '@/src/content/items';
import { applyPendingRewardToRun } from '@/src/engine/reward/apply-pending-reward-to-run';
import {
  getCurrentRunNode,
  getReserveCompanionId,
} from '@/src/engine/run/progress-run';
import type { EventChoice, EventScene } from '@/src/types/event';
import type { PendingRewardState, RunState } from '@/src/types/run';

type EventChoiceApplicationResult = ReturnType<typeof applyPendingRewardToRun> & {
  run: RunState;
  eventId: string;
  choice: EventChoice;
  damageTaken: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function pickEventItemId(run: RunState, choiceId: string) {
  const index =
    hashString(`${run.seed}:${run.currentNodeId ?? 'event'}:${choiceId}:event-item`) %
    itemDefinitions.length;
  return itemDefinitions[index]?.id ?? null;
}

function getEventIdForRun(run: RunState) {
  const currentNode = getCurrentRunNode(run);

  if (!currentNode || currentNode.kind !== 'event') {
    throw new Error('The active node is not an event encounter.');
  }

  return getEventDefinitionByTitle(currentNode.label)?.id ?? 'unsafe-team-building';
}

function createPreviewParts({
  metaCurrency,
  runHealing,
  runDamage,
  itemId,
  nextActiveCompanionId,
}: EventChoice['effect']) {
  const parts: string[] = [];

  if (metaCurrency > 0) {
    parts.push(`+${metaCurrency} scrap`);
  }

  if (runHealing > 0) {
    parts.push(`+${runHealing} HP`);
  }

  if (runDamage > 0) {
    parts.push(`-${runDamage} HP`);
  }

  if (itemId) {
    parts.push(getItemDefinition(itemId)?.name ?? itemId);
  }

  if (nextActiveCompanionId) {
    parts.push(
      `swap to ${
        getCompanionDefinition(nextActiveCompanionId)?.name ?? nextActiveCompanionId
      }`
    );
  }

  return parts.join(' | ');
}

function createRewardPayload(
  run: RunState,
  eventId: string,
  choice: EventChoice
): PendingRewardState {
  return {
    rewardId: `event-reward-${eventId}-${choice.id}`,
    sourceNodeId: run.currentNodeId ?? `event-${eventId}`,
    sourceKind: 'reward-node',
    title: choice.label,
    description: choice.outcomeText,
    selectedOptionId: null,
    options: null,
    metaCurrency: choice.effect.metaCurrency,
    runHealing: choice.effect.runHealing,
    itemId: choice.effect.itemId,
    createdAt: run.updatedAt,
  };
}

function applyEventClassBonusToChoice(
  run: RunState,
  eventId: string,
  choice: EventChoice
): EventChoice {
  const classBonus = getEventClassChoiceBonus(eventId, run.heroClassId, choice.id);

  if (!classBonus) {
    return {
      ...choice,
      classBonusLabel: null,
    };
  }

  const nextEffect = {
    ...choice.effect,
    metaCurrency: Math.max(
      0,
      choice.effect.metaCurrency + (classBonus.metaCurrencyDelta ?? 0)
    ),
    runHealing: Math.max(
      0,
      choice.effect.runHealing + (classBonus.runHealingDelta ?? 0)
    ),
    runDamage: Math.max(
      0,
      choice.effect.runDamage + (classBonus.runDamageDelta ?? 0)
    ),
  };

  return {
    ...choice,
    preview: createPreviewParts(nextEffect),
    outcomeText: `${choice.outcomeText} ${classBonus.outcomeSuffix}`,
    effect: nextEffect,
    classBonusLabel: classBonus.label,
  };
}

function applyEventCompanionBonusesToChoice(
  run: RunState,
  eventId: string,
  choice: EventChoice
): EventChoice {
  const companionBonuses = getEventCompanionChoiceBonuses(
    eventId,
    run.chosenCompanionIds,
    choice.id
  );

  if (companionBonuses.length === 0) {
    return {
      ...choice,
      companionBonusLabel: null,
    };
  }

  const nextEffect = companionBonuses.reduce(
    (effect, bonus) => ({
      ...effect,
      metaCurrency: Math.max(0, effect.metaCurrency + (bonus.metaCurrencyDelta ?? 0)),
      runHealing: Math.max(0, effect.runHealing + (bonus.runHealingDelta ?? 0)),
      runDamage: Math.max(0, effect.runDamage + (bonus.runDamageDelta ?? 0)),
    }),
    choice.effect
  );
  const companionBonusLabel = companionBonuses
    .map((bonus) => bonus.label)
    .join(' | ');
  const outcomeSuffix = companionBonuses.map((bonus) => bonus.outcomeSuffix).join(' ');

  return {
    ...choice,
    preview: createPreviewParts(nextEffect),
    outcomeText: `${choice.outcomeText} ${outcomeSuffix}`,
    effect: nextEffect,
    companionBonusLabel,
  };
}

function applyEventTeamSynergyBonusesToChoice(
  run: RunState,
  eventId: string,
  choice: EventChoice
): EventChoice {
  const synergyBonuses = getTeamEventSynergyBonuses(run, eventId, choice.id);

  if (synergyBonuses.length === 0) {
    return {
      ...choice,
      synergyBonusLabel: null,
    };
  }

  const nextEffect = synergyBonuses.reduce(
    (effect, bonus) => ({
      ...effect,
      metaCurrency: Math.max(0, effect.metaCurrency + (bonus.metaCurrencyDelta ?? 0)),
      runHealing: Math.max(0, effect.runHealing + (bonus.runHealingDelta ?? 0)),
      runDamage: Math.max(0, effect.runDamage + (bonus.runDamageDelta ?? 0)),
    }),
    choice.effect
  );
  const synergyBonusLabel = synergyBonuses
    .map((bonus) => `${bonus.synergyTitle}: ${bonus.label}`)
    .join(' | ');
  const outcomeSuffix = synergyBonuses
    .map((bonus) => bonus.outcomeSuffix)
    .join(' ');

  return {
    ...choice,
    preview: createPreviewParts(nextEffect),
    outcomeText: `${choice.outcomeText} ${outcomeSuffix}`,
    effect: nextEffect,
    synergyBonusLabel,
  };
}

function getReserveCompanionState(run: RunState) {
  const reserveCompanionId = getReserveCompanionId(run);

  return {
    reserveCompanionId,
    reserveCompanionName:
      getCompanionDefinition(reserveCompanionId)?.name ?? reserveCompanionId,
  };
}

function createUnsafeTeamBuildingChoices(run: RunState): EventChoice[] {
  const { reserveCompanionId, reserveCompanionName } =
    getReserveCompanionState(run);

  return [
    {
      id: 'document-liability',
      label: 'Document Liability',
      description:
        'Turn the retreat into evidence and quietly pocket the emergency snacks.',
      preview: createPreviewParts({
        metaCurrency: 6,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'You leave with notes, leverage, and enough granola to pretend this helped.',
      effect: {
        metaCurrency: 6,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'loot-welcome-bag',
      label: 'Loot The Welcome Bag',
      description:
        'Raid the morale supplies before anyone can convert them into a trust exercise.',
      preview: createPreviewParts({
        metaCurrency: 0,
        runHealing: 5,
        runDamage: 0,
        itemId: pickEventItemId(run, 'loot-welcome-bag'),
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The swag bag was mostly cursed branding, but one item is genuinely useful.',
      effect: {
        metaCurrency: 0,
        runHealing: 5,
        runDamage: 0,
        itemId: pickEventItemId(run, 'loot-welcome-bag'),
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'voluntell-reserve',
      label: `Voluntell ${reserveCompanionName}`,
      description:
        'Push the reserve companion into the exercise, then use the confusion to reset the line.',
      preview: createPreviewParts({
        metaCurrency: 4,
        runHealing: 2,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      }),
      outcomeText:
        'The exercise still goes badly, but at least the active assignment changes hands cleanly.',
      effect: {
        metaCurrency: 4,
        runHealing: 2,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      },
    },
  ];
}

function createMandatoryFeedbackLoopChoices(run: RunState): EventChoice[] {
  const { reserveCompanionId, reserveCompanionName } =
    getReserveCompanionState(run);
  const riskyDamage = clamp(4, 0, Math.max(0, run.hero.currentHp - 1));

  return [
    {
      id: 'accept-the-notes',
      label: 'Accept The Notes',
      description:
        'Absorb the criticism, salvage the useful parts, and leave with a steadier pulse.',
      preview: createPreviewParts({
        metaCurrency: 0,
        runHealing: 6,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'Most of the feedback was nonsense, but a tiny piece of it accidentally helped.',
      effect: {
        metaCurrency: 0,
        runHealing: 6,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'weaponize-feedback',
      label: 'Weaponize Feedback',
      description:
        'Turn the conversation into leverage and leave the other side more damaged than you are.',
      preview: createPreviewParts({
        metaCurrency: 9,
        runHealing: 0,
        runDamage: riskyDamage,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'You win the argument so hard it becomes a resource, though the stress bill still arrives.',
      effect: {
        metaCurrency: 9,
        runHealing: 0,
        runDamage: riskyDamage,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'cc-the-reserve',
      label: `CC ${reserveCompanionName}`,
      description:
        'Drag the reserve companion into the loop and let them inherit the agenda for a while.',
      preview: createPreviewParts({
        metaCurrency: 5,
        runHealing: 2,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      }),
      outcomeText:
        'The thread gets louder, but at least somebody else is tanking the conversation now.',
      effect: {
        metaCurrency: 5,
        runHealing: 2,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      },
    },
  ];
}

function createSuspiciousElevatorPitchChoices(run: RunState): EventChoice[] {
  const { reserveCompanionId, reserveCompanionName } =
    getReserveCompanionState(run);
  const contractDamage = clamp(3, 0, Math.max(0, run.hero.currentHp - 1));

  return [
    {
      id: 'sign-the-addendum',
      label: 'Sign The Addendum',
      description:
        'Accept the terrible terms, take the contraband, and hope the fine print waits until later.',
      preview: createPreviewParts({
        metaCurrency: 6,
        runHealing: 0,
        runDamage: contractDamage,
        itemId: pickEventItemId(run, 'sign-the-addendum'),
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The contract hurts immediately, but the attached hardware is hard to argue with.',
      effect: {
        metaCurrency: 6,
        runHealing: 0,
        runDamage: contractDamage,
        itemId: pickEventItemId(run, 'sign-the-addendum'),
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'demand-upfront-bribe',
      label: 'Demand An Upfront Bribe',
      description:
        'Refuse the speech and charge consulting rates for listening to it this long.',
      preview: createPreviewParts({
        metaCurrency: 11,
        runHealing: 0,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The stranger respects pure greed, which says troubling things about everyone involved.',
      effect: {
        metaCurrency: 11,
        runHealing: 0,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'let-companion-stall',
      label: `Let ${reserveCompanionName} Stall`,
      description:
        'Rotate the reserve companion into the conversation while you recover and steal a cleaner angle.',
      preview: createPreviewParts({
        metaCurrency: 3,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      }),
      outcomeText:
        'The pitch keeps talking, but the rotation buys breathing room and a better escape lane.',
      effect: {
        metaCurrency: 3,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      },
    },
  ];
}

function createFireDrillEvangelismChoices(run: RunState): EventChoice[] {
  const { reserveCompanionId, reserveCompanionName } =
    getReserveCompanionState(run);
  const sprintDamage = clamp(3, 0, Math.max(0, run.hero.currentHp - 1));

  return [
    {
      id: 'loot-the-muster-crate',
      label: 'Loot The Muster Crate',
      description:
        'Crack open the emergency supplies before the safety sermon reaches the attendance roll.',
      preview: createPreviewParts({
        metaCurrency: 2,
        runHealing: 5,
        runDamage: 0,
        itemId: pickEventItemId(run, 'loot-the-muster-crate'),
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'You leave with medical tape, stolen morale snacks, and one suspiciously useful tool.',
      effect: {
        metaCurrency: 2,
        runHealing: 5,
        runDamage: 0,
        itemId: pickEventItemId(run, 'loot-the-muster-crate'),
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'fake-the-all-clear',
      label: 'Fake The All-Clear',
      description:
        'Shut the sirens down early, skim the compliance budget, and hope nobody notices the smoke later.',
      preview: createPreviewParts({
        metaCurrency: 9,
        runHealing: 0,
        runDamage: sprintDamage,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The line moves faster, the exits get messier, and your pockets somehow get heavier.',
      effect: {
        metaCurrency: 9,
        runHealing: 0,
        runDamage: sprintDamage,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'appoint-a-fire-marshal',
      label: `Appoint ${reserveCompanionName}`,
      description:
        'Nominate the reserve companion as acting fire marshal and use the confusion to rotate the formation.',
      preview: createPreviewParts({
        metaCurrency: 4,
        runHealing: 3,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      }),
      outcomeText:
        'The drill stays chaotic, but somebody else is now carrying the whistle and the liability.',
      effect: {
        metaCurrency: 4,
        runHealing: 3,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      },
    },
  ];
}

function createShadowItMarketChoices(run: RunState): EventChoice[] {
  const { reserveCompanionId, reserveCompanionName } =
    getReserveCompanionState(run);
  const prototypeDamage = clamp(2, 0, Math.max(0, run.hero.currentHp - 1));

  return [
    {
      id: 'buy-the-prototype',
      label: 'Buy The Prototype',
      description:
        'Take the illegal hardware deal even though the warranty is clearly a curse.',
      preview: createPreviewParts({
        metaCurrency: 0,
        runHealing: 0,
        runDamage: prototypeDamage,
        itemId: pickEventItemId(run, 'buy-the-prototype'),
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The device hums like a trapped lawsuit, but it is undeniably powerful.',
      effect: {
        metaCurrency: 0,
        runHealing: 0,
        runDamage: prototypeDamage,
        itemId: pickEventItemId(run, 'buy-the-prototype'),
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'broker-a-resale-cut',
      label: 'Broker A Resale Cut',
      description:
        'Skip the hardware and take your payment in clean scrap and deniable introductions.',
      preview: createPreviewParts({
        metaCurrency: 10,
        runHealing: 0,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'You leave without contraband, but with enough margin to call the meeting productive.',
      effect: {
        metaCurrency: 10,
        runHealing: 0,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'let-the-reserve-haggle',
      label: `Let ${reserveCompanionName} Haggle`,
      description:
        'Put the reserve companion on price-negotiation duty while you recover and reset the lead position.',
      preview: createPreviewParts({
        metaCurrency: 5,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      }),
      outcomeText:
        'The deal gets louder and far less ethical, but the rotation buys you breathing room.',
      effect: {
        metaCurrency: 5,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      },
    },
  ];
}

function createExpenseReportExorcismChoices(run: RunState): EventChoice[] {
  const { reserveCompanionId, reserveCompanionName } =
    getReserveCompanionState(run);

  return [
    {
      id: 'audit-the-possession',
      label: 'Audit The Possession',
      description:
        'Go line by line through the haunted receipts until the spirit gets bored and leaves.',
      preview: createPreviewParts({
        metaCurrency: 7,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The demon hates process almost as much as you do, and the reimbursement suddenly clears.',
      effect: {
        metaCurrency: 7,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'feed-it-receipts',
      label: 'Feed It Receipts',
      description:
        'Shove a stack of fraudulent expenses into the ritual and keep whatever object crawls back out.',
      preview: createPreviewParts({
        metaCurrency: 2,
        runHealing: 2,
        runDamage: 0,
        itemId: pickEventItemId(run, 'feed-it-receipts'),
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The paperwork burns blue, the room smells like tax fraud, and you gain a useful artifact.',
      effect: {
        metaCurrency: 2,
        runHealing: 2,
        runDamage: 0,
        itemId: pickEventItemId(run, 'feed-it-receipts'),
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'delegate-the-summons',
      label: `Delegate To ${reserveCompanionName}`,
      description:
        'Move the reserve companion into the ritual circle and let them inherit the next stage of the problem.',
      preview: createPreviewParts({
        metaCurrency: 5,
        runHealing: 3,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      }),
      outcomeText:
        "The ritual stabilizes mostly because it becomes somebody else's responsibility.",
      effect: {
        metaCurrency: 5,
        runHealing: 3,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      },
    },
  ];
}

function createAllHandsMutinyChoices(run: RunState): EventChoice[] {
  const { reserveCompanionId, reserveCompanionName } =
    getReserveCompanionState(run);
  const micDamage = clamp(3, 0, Math.max(0, run.hero.currentHp - 1));

  return [
    {
      id: 'seize-the-mic',
      label: 'Seize The Mic',
      description:
        'Take control of the meeting, redirect the outrage, and monetize the panic before the slides reload.',
      preview: createPreviewParts({
        metaCurrency: 9,
        runHealing: 0,
        runDamage: micDamage,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'You win the room for one glorious minute and come away singed but richer.',
      effect: {
        metaCurrency: 9,
        runHealing: 0,
        runDamage: micDamage,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'loot-the-swag-table',
      label: 'Loot The Swag Table',
      description:
        'Ignore the politics, raid the abandoned gift table, and salvage something worth carrying.',
      preview: createPreviewParts({
        metaCurrency: 2,
        runHealing: 4,
        runDamage: 0,
        itemId: pickEventItemId(run, 'loot-the-swag-table'),
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The branded tote was mostly lies, but one piece of contraband actually helps.',
      effect: {
        metaCurrency: 2,
        runHealing: 4,
        runDamage: 0,
        itemId: pickEventItemId(run, 'loot-the-swag-table'),
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'push-the-reserve-onstage',
      label: `Push ${reserveCompanionName} Onstage`,
      description:
        'Rotate the reserve companion into the spotlight while you re-form the line behind the fallout.',
      preview: createPreviewParts({
        metaCurrency: 4,
        runHealing: 2,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      }),
      outcomeText:
        'The mutiny keeps yelling, but now somebody else is absorbing the front-row pressure.',
      effect: {
        metaCurrency: 4,
        runHealing: 2,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      },
    },
  ];
}

function createBreakroomWhistleblowerChoices(run: RunState): EventChoice[] {
  const { reserveCompanionId, reserveCompanionName } =
    getReserveCompanionState(run);

  return [
    {
      id: 'raid-the-fridge-file',
      label: 'Raid The Fridge File',
      description:
        'Take the hidden evidence, skim the attached hush fund, and leave the yogurt to die for the company.',
      preview: createPreviewParts({
        metaCurrency: 8,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The documents are explosive, the snacks are barely legal, and both somehow improve your situation.',
      effect: {
        metaCurrency: 8,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'take-the-severance-lunch',
      label: 'Take The Severance Lunch',
      description:
        'Loot the premium meal prep, the mini-fridge stash, and the contraband tucked behind the apology cupcakes.',
      preview: createPreviewParts({
        metaCurrency: 2,
        runHealing: 5,
        runDamage: 0,
        itemId: pickEventItemId(run, 'take-the-severance-lunch'),
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The lunch itself is suspicious, but the hidden package behind it is absolutely worth carrying.',
      effect: {
        metaCurrency: 2,
        runHealing: 5,
        runDamage: 0,
        itemId: pickEventItemId(run, 'take-the-severance-lunch'),
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'make-the-reserve-sign',
      label: `Make ${reserveCompanionName} Sign`,
      description:
        'Volunteer the reserve companion as acting witness, then use the resulting HR confusion to reset the line.',
      preview: createPreviewParts({
        metaCurrency: 4,
        runHealing: 3,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      }),
      outcomeText:
        'The paperwork still ends in threats, but the handoff buys breathing room and cleaner momentum.',
      effect: {
        metaCurrency: 4,
        runHealing: 3,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      },
    },
  ];
}

function createTrustFallIncidentReportChoices(run: RunState): EventChoice[] {
  const { reserveCompanionId, reserveCompanionName } =
    getReserveCompanionState(run);
  const waiverDamage = clamp(2, 0, Math.max(0, run.hero.currentHp - 1));

  return [
    {
      id: 'rewrite-the-liability',
      label: 'Rewrite The Liability',
      description:
        'Edit the report until the company becomes the obvious villain and the reimbursement pool quietly opens.',
      preview: createPreviewParts({
        metaCurrency: 7,
        runHealing: 5,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The legal framing gets so clean that someone pays out immediately just to make it disappear.',
      effect: {
        metaCurrency: 7,
        runHealing: 5,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'loot-the-waiver-box',
      label: 'Loot The Waiver Box',
      description:
        'Rip open the incident supplies, pocket the trauma gear, and accept a little damage from the splintered retreat hardware.',
      preview: createPreviewParts({
        metaCurrency: 3,
        runHealing: 1,
        runDamage: waiverDamage,
        itemId: pickEventItemId(run, 'loot-the-waiver-box'),
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The box absolutely fights back, but it still contains a useful prize and a deeply satisfying amount of theft.',
      effect: {
        metaCurrency: 3,
        runHealing: 1,
        runDamage: waiverDamage,
        itemId: pickEventItemId(run, 'loot-the-waiver-box'),
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'appoint-a-fall-guy',
      label: `Appoint ${reserveCompanionName}`,
      description:
        'Name the reserve companion interim retreat liaison and use the ceremonial blame to rotate the lead spot.',
      preview: createPreviewParts({
        metaCurrency: 5,
        runHealing: 3,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      }),
      outcomeText:
        'The liability cloud shifts, the formation resets, and somehow the room calls that leadership.',
      effect: {
        metaCurrency: 5,
        runHealing: 3,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      },
    },
  ];
}

function createGoldenParachuteAuctionChoices(run: RunState): EventChoice[] {
  const { reserveCompanionId, reserveCompanionName } =
    getReserveCompanionState(run);
  const bidDamage = clamp(3, 0, Math.max(0, run.hero.currentHp - 1));

  return [
    {
      id: 'skim-the-payout-table',
      label: 'Skim The Payout Table',
      description:
        'Steal cash straight from the severance board and accept the stress of doing it in executive air.',
      preview: createPreviewParts({
        metaCurrency: 12,
        runHealing: 0,
        runDamage: bidDamage,
        itemId: null,
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The payout table leaks pure money, but the pressure of touching it hits back immediately.',
      effect: {
        metaCurrency: 12,
        runHealing: 0,
        runDamage: bidDamage,
        itemId: null,
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'steal-the-emergency-perks',
      label: 'Steal The Emergency Perks',
      description:
        'Lift the premium executive care package before somebody with a better haircut notices.',
      preview: createPreviewParts({
        metaCurrency: 3,
        runHealing: 4,
        runDamage: 0,
        itemId: pickEventItemId(run, 'steal-the-emergency-perks'),
        nextActiveCompanionId: null,
      }),
      outcomeText:
        'The elite panic kit is obscene, overstocked, and annoyingly effective on you.',
      effect: {
        metaCurrency: 3,
        runHealing: 4,
        runDamage: 0,
        itemId: pickEventItemId(run, 'steal-the-emergency-perks'),
        nextActiveCompanionId: null,
      },
    },
    {
      id: 'nominate-the-reserve-bidder',
      label: `Nominate ${reserveCompanionName}`,
      description:
        'Push the reserve companion into the bidding war, skim the side value, and use the confusion to rotate positions.',
      preview: createPreviewParts({
        metaCurrency: 5,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      }),
      outcomeText:
        'The auction still feels cursed, but the handoff buys recovery and a cleaner angle through the room.',
      effect: {
        metaCurrency: 5,
        runHealing: 4,
        runDamage: 0,
        itemId: null,
        nextActiveCompanionId: reserveCompanionId,
      },
    },
  ];
}

function createChoicesForEvent(run: RunState, eventId: string) {
  if (eventId === 'mandatory-feedback-loop') {
    return createMandatoryFeedbackLoopChoices(run);
  }

  if (eventId === 'suspicious-elevator-pitch') {
    return createSuspiciousElevatorPitchChoices(run);
  }

  if (eventId === 'fire-drill-evangelism') {
    return createFireDrillEvangelismChoices(run);
  }

  if (eventId === 'shadow-it-market') {
    return createShadowItMarketChoices(run);
  }

  if (eventId === 'expense-report-exorcism') {
    return createExpenseReportExorcismChoices(run);
  }

  if (eventId === 'all-hands-mutiny') {
    return createAllHandsMutinyChoices(run);
  }

  if (eventId === 'breakroom-whistleblower') {
    return createBreakroomWhistleblowerChoices(run);
  }

  if (eventId === 'trust-fall-incident-report') {
    return createTrustFallIncidentReportChoices(run);
  }

  if (eventId === 'golden-parachute-auction') {
    return createGoldenParachuteAuctionChoices(run);
  }

  return createUnsafeTeamBuildingChoices(run);
}

export function getEventSceneForCurrentNode(run: RunState): EventScene {
  const currentNode = getCurrentRunNode(run);

  if (!currentNode || currentNode.kind !== 'event') {
    throw new Error('The active node is not an event encounter.');
  }

  const eventDefinition =
    getEventDefinitionByTitle(currentNode.label) ?? {
      id: getEventIdForRun(run),
      title: currentNode.label,
      description: currentNode.description,
    };

  return {
    eventId: eventDefinition.id,
    title: eventDefinition.title,
    description: eventDefinition.description,
    classMoment: createEventClassMoment(eventDefinition.id, run.heroClassId),
    companionMoments: createEventCompanionMoments({
      eventId: eventDefinition.id,
      activeCompanionId: run.activeCompanionId,
      reserveCompanionId: getReserveCompanionState(run).reserveCompanionId,
      companionBondLevels: run.companionBondLevels,
    }),
    choices: createChoicesForEvent(run, eventDefinition.id).map((choice) =>
      applyEventTeamSynergyBonusesToChoice(
        run,
        eventDefinition.id,
        applyEventCompanionBonusesToChoice(
          run,
          eventDefinition.id,
          applyEventClassBonusToChoice(run, eventDefinition.id, choice)
        )
      )
    ),
  };
}

export function applyEventChoice(
  run: RunState,
  choiceId: string
): EventChoiceApplicationResult {
  const scene = getEventSceneForCurrentNode(run);
  const choice = scene.choices.find((item) => item.id === choiceId);

  if (!choice) {
    throw new Error('The selected event choice does not exist for this encounter.');
  }

  const damageTaken = clamp(
    choice.effect.runDamage,
    0,
    Math.max(0, run.hero.currentHp - 1)
  );
  const damagedRun: RunState = {
    ...run,
    hero: {
      ...run.hero,
      currentHp: run.hero.currentHp - damageTaken,
    },
  };
  const rewardPayload = createRewardPayload(damagedRun, scene.eventId, {
    ...choice,
    effect: {
      ...choice.effect,
      runDamage: damageTaken,
    },
  });
  const rewardApplied = applyPendingRewardToRun(damagedRun, rewardPayload);

  return {
    ...rewardApplied,
    run: {
      ...rewardApplied.run,
      activeCompanionId:
        choice.effect.nextActiveCompanionId && damagedRun.chosenCompanionIds.includes(choice.effect.nextActiveCompanionId)
          ? choice.effect.nextActiveCompanionId
          : rewardApplied.run.activeCompanionId,
    },
    eventId: scene.eventId,
    choice: {
      ...choice,
      effect: {
        ...choice.effect,
        runDamage: damageTaken,
      },
    },
    damageTaken,
  };
}
