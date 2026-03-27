import { getCompanionDefinition } from '@/src/content/companions';

type RewardCompanionOptionBonus = {
  optionId: string;
  label: string;
  metaCurrencyDelta?: number;
  runHealingDelta?: number;
};

type RewardCompanionProfile = {
  preview: string;
  bonuses: RewardCompanionOptionBonus[];
};

export type ResolvedRewardCompanionOptionBonus = RewardCompanionOptionBonus & {
  companionId: string;
  companionName: string;
};

const rewardCompanionProfiles: Record<string, RewardCompanionProfile> = {
  'former-executive-assistant': {
    preview:
      'Finance-heavy office and executive payout packages pay out better with them in the room.',
    bonuses: [
      {
        optionId: 'expense-fraud',
        label: 'Spots the cleanest reimbursement leak before the drawer gets cold.',
        metaCurrencyDelta: 2,
      },
      {
        optionId: 'black-card-overage',
        label: 'Knows exactly which executive slush line is real and which one is theater.',
        metaCurrencyDelta: 3,
      },
      {
        optionId: 'golden-parachute-cache',
        label: 'Pulls extra value out of the exit package before the suite notices.',
        metaCurrencyDelta: 2,
      },
    ],
  },
  'facilities-goblin': {
    preview:
      'Supply carts, wellness caches, and recovery-heavy haul packages heal more when the goblin gets first look.',
    bonuses: [
      {
        optionId: 'triage-cart',
        label: 'Strips the useful supplies out of the cart before the room remembers inventory exists.',
        runHealingDelta: 4,
      },
      {
        optionId: 'wellness-cooler',
        label: 'Finds the real hydration and sugar cache under the performative wellness layer.',
        runHealingDelta: 4,
      },
      {
        optionId: 'concierge-crash-cart',
        label: 'Turns the premium crash cart into actual field medicine instead of decorative luxury.',
        runHealingDelta: 3,
      },
    ],
  },
  'security-skeleton': {
    preview:
      'Guarded payouts and controlled skims come out cleaner when security handles the perimeter.',
    bonuses: [
      {
        optionId: 'per-diem-skimming',
        label: 'Keeps the retreat reimbursement grab disciplined enough to skim deeper.',
        metaCurrencyDelta: 2,
      },
      {
        optionId: 'black-card-overage',
        label: 'Stands watch while you raid the executive ledger.',
        metaCurrencyDelta: 2,
      },
      {
        optionId: 'golden-parachute-cache',
        label: 'Makes the executive cache theft look official enough to keep the room calm.',
        runHealingDelta: 1,
      },
    ],
  },
  'possessed-copier': {
    preview:
      'Contraband-focused haul packages duplicate value in ways nobody should allow.',
    bonuses: [
      {
        optionId: 'contraband-locker',
        label: 'Copies the locker manifest until the contents look more profitable than they should.',
        metaCurrencyDelta: 2,
      },
      {
        optionId: 'swag-bag-heist',
        label: 'Turns the retreat tote into a strangely denser contraband grab.',
        metaCurrencyDelta: 2,
        runHealingDelta: 1,
      },
      {
        optionId: 'golden-parachute-cache',
        label: 'Duplicates the best parts of the executive cache before reality notices.',
        metaCurrencyDelta: 2,
      },
    ],
  },
  'disillusioned-temp': {
    preview:
      'Mixed survival hauls and offsite skim packages come out better when the temp handles the ugly details.',
    bonuses: [
      {
        optionId: 'expense-fraud',
        label: 'Finds one more useful line item and one more reason to keep the envelope.',
        metaCurrencyDelta: 1,
        runHealingDelta: 1,
      },
      {
        optionId: 'per-diem-skimming',
        label: 'Knows how to survive a bad offsite and steal from it at the same time.',
        metaCurrencyDelta: 2,
        runHealingDelta: 2,
      },
      {
        optionId: 'concierge-crash-cart',
        label: 'Pulls the practical medicine out of the luxury pile and keeps the rest moving.',
        metaCurrencyDelta: 1,
        runHealingDelta: 2,
      },
    ],
  },
};

export function getCompanionRewardEdgePreview(companionId: string) {
  return (
    rewardCompanionProfiles[companionId]?.preview ??
    'No documented reward-room edge yet.'
  );
}

export function getRewardCompanionOptionBonuses(
  companionIds: string[],
  optionId: string
): ResolvedRewardCompanionOptionBonus[] {
  return companionIds.flatMap((companionId) => {
    const profile = rewardCompanionProfiles[companionId];
    const bonus = profile?.bonuses.find((candidate) => candidate.optionId === optionId);

    if (!bonus) {
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
