import { getCompanionDefinition } from '@/src/content/companions';

type EventCompanionChoiceBonus = {
  choiceId: string;
  label: string;
  metaCurrencyDelta?: number;
  runHealingDelta?: number;
  runDamageDelta?: number;
  outcomeSuffix: string;
};

export type ResolvedEventCompanionChoiceBonus = EventCompanionChoiceBonus & {
  companionId: string;
  companionName: string;
};

const eventCompanionChoiceBonuses: Record<
  string,
  Record<string, EventCompanionChoiceBonus>
> = {
  'unsafe-team-building': {
    'facilities-goblin': {
      choiceId: 'loot-welcome-bag',
      label: 'Facilities Goblin strips the safe supplies out of the cursed swag.',
      runHealingDelta: 2,
      outcomeSuffix:
        'The goblin knows exactly which bag pocket hides the real emergency stash.',
    },
  },
  'mandatory-feedback-loop': {
    'possessed-copier': {
      choiceId: 'cc-the-reserve',
      label: 'Possessed Copier duplicates the thread until it accidentally pays out.',
      metaCurrencyDelta: 2,
      outcomeSuffix:
        'The copied outrage becomes just profitable enough to count as strategy.',
    },
  },
  'suspicious-elevator-pitch': {
    'former-executive-assistant': {
      choiceId: 'demand-upfront-bribe',
      label: 'Former Executive Assistant recognizes the exact panic tell that means cash now.',
      metaCurrencyDelta: 2,
      outcomeSuffix:
        'They have seen this kind of desperate executive charm offensive before and price it correctly.',
    },
    'disillusioned-temp': {
      choiceId: 'let-companion-stall',
      label: 'Disillusioned Temp drags the stall into a cleaner recovery window.',
      runHealingDelta: 2,
      outcomeSuffix:
        'The delay becomes real breathing room instead of just another miserable pause.',
    },
  },
  'shadow-it-market': {
    'disillusioned-temp': {
      choiceId: 'let-the-reserve-haggle',
      label: 'Disillusioned Temp knows exactly how to survive a bad bargain without showing fear.',
      metaCurrencyDelta: 1,
      runHealingDelta: 2,
      outcomeSuffix:
        'Their deeply unenthusiastic negotiating style somehow keeps more of the deal in your favor.',
    },
  },
  'expense-report-exorcism': {
    'possessed-copier': {
      choiceId: 'feed-it-receipts',
      label: 'Possessed Copier turns the ritual into a duplication problem and wins on volume.',
      metaCurrencyDelta: 2,
      runHealingDelta: 1,
      outcomeSuffix:
        'The machine adds exactly the wrong kind of paperwork and the haunting pays out anyway.',
    },
  },
  'all-hands-mutiny': {
    'security-skeleton': {
      choiceId: 'seize-the-mic',
      label: 'Security Skeleton gives the room just enough procedural fear to keep it from tearing you apart.',
      metaCurrencyDelta: 1,
      runDamageDelta: -2,
      outcomeSuffix:
        'The mutiny still hates you, but it suddenly remembers there might be consequences.',
    },
  },
  'trust-fall-incident-report': {
    'facilities-goblin': {
      choiceId: 'loot-the-waiver-box',
      label: 'Facilities Goblin salvages the gear without eating the full hardware cost.',
      runHealingDelta: 2,
      runDamageDelta: -1,
      outcomeSuffix:
        'The goblin strips out the sharp parts, the useful tape, and most of the liability at once.',
    },
  },
  'golden-parachute-auction': {
    'former-executive-assistant': {
      choiceId: 'skim-the-payout-table',
      label: 'Former Executive Assistant knows which severance pile is real and which one is theater.',
      metaCurrencyDelta: 3,
      runDamageDelta: -1,
      outcomeSuffix:
        'They guide your hand straight to the expensive panic budget and away from the worst personal fallout.',
    },
    'security-skeleton': {
      choiceId: 'nominate-the-reserve-bidder',
      label: 'Security Skeleton makes the handoff sound official enough to calm the predators.',
      runHealingDelta: 1,
      runDamageDelta: -1,
      outcomeSuffix:
        'The badge and bone structure do a surprising amount of crowd control.',
    },
  },
};

export function getEventCompanionChoiceBonuses(
  eventId: string,
  companionIds: string[],
  choiceId: string
): ResolvedEventCompanionChoiceBonus[] {
  return companionIds.flatMap((companionId) => {
    const bonus = eventCompanionChoiceBonuses[eventId]?.[companionId] ?? null;

    if (!bonus || bonus.choiceId !== choiceId) {
      return [];
    }

    return [
      {
        ...bonus,
        companionId,
        companionName: getCompanionDefinition(companionId)?.name ?? companionId,
      },
    ];
  });
}
