import { getRewardCompanionOptionBonuses } from '@/src/content/reward-companion-hooks';
import { getTeamRewardSynergyBonuses } from '@/src/content/team-synergies';
import { getItemDefinition, itemDefinitions } from '@/src/content/items';
import type {
  PendingRewardOptionState,
  PendingRewardState,
  RewardSourceKind,
  RunNodeState,
  RunState,
} from '@/src/types/run';
import { createId } from '@/src/utils/ids';
import { createTimestamp } from '@/src/utils/time';

type RewardRoomBiomeId =
  | 'open-plan-pits'
  | 'team-building-catacombs'
  | 'executive-suite';

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function pickRewardItemId(run: RunState, node: RunNodeState, slot = 'reward-item') {
  const index = hashString(`${run.seed}:${node.id}:${slot}`) % itemDefinitions.length;
  return itemDefinitions[index]?.id ?? null;
}

function getMetaCurrencyAward(sourceKind: RewardSourceKind, node: RunNodeState) {
  if (sourceKind === 'reward-node') {
    return node.kind === 'reward' ? 7 : 5;
  }

  return node.kind === 'boss' ? 18 : 10;
}

function getRunHealingAward(sourceKind: RewardSourceKind, node: RunNodeState) {
  if (sourceKind === 'reward-node') {
    return node.kind === 'reward' ? 8 : 5;
  }

  return node.kind === 'boss' ? 0 : 5;
}

function getRewardRoomBiomeId(node: RunNodeState): RewardRoomBiomeId {
  if (node.floorNumber <= 4) {
    return 'open-plan-pits';
  }

  if (node.floorNumber <= 7) {
    return 'team-building-catacombs';
  }

  return 'executive-suite';
}

function createRewardRoomOptions(
  run: RunState,
  node: RunNodeState
): PendingRewardOptionState[] {
  const contrabandItemId = pickRewardItemId(run, node);
  const contrabandItem = contrabandItemId
    ? getItemDefinition(contrabandItemId)
    : null;
  const rarityBonus =
    contrabandItem?.rarity === 'rare'
      ? 2
      : contrabandItem?.rarity === 'uncommon'
        ? 1
        : 0;
  const biomeId = getRewardRoomBiomeId(node);

  const baseOptions =
    biomeId === 'team-building-catacombs'
      ? [
      {
        optionId: 'per-diem-skimming',
        label: 'Per Diem Skimming',
        description:
          'Pocket the retreat reimbursement float and leave the trust exercises to rot without you.',
        metaCurrency: 14,
        runHealing: 4,
        itemId: null,
      },
      {
        optionId: 'wellness-cooler',
        label: 'Wellness Cooler',
        description:
          'Strip the offsite recovery station for hydration, sugar, and enough supplies to make the next floor tolerable.',
        metaCurrency: 5,
        runHealing: 13,
        itemId: null,
      },
      {
        optionId: 'swag-bag-heist',
        label: 'Swag Bag Heist',
        description: contrabandItem
          ? `Rip open the premium retreat tote for ${contrabandItem.name} and a smaller mixed payout.`
          : 'Rip open the premium retreat tote for a smaller mixed payout and whatever useful junk survived.',
        metaCurrency: 7 + rarityBonus,
        runHealing: 7 + rarityBonus,
        itemId: contrabandItemId,
      },
    ]
      : biomeId === 'executive-suite'
        ? [
      {
        optionId: 'black-card-overage',
        label: 'Black Card Overage',
        description:
          'Take the executive slush money, leave the receipts screaming, and walk out before security rechecks the ledger.',
        metaCurrency: 16,
        runHealing: 3,
        itemId: null,
      },
      {
        optionId: 'concierge-crash-cart',
        label: 'Concierge Crash Cart',
        description:
          'Raid the luxury recovery kit for premium medicine, calm-down chemistry, and the will to keep climbing.',
        metaCurrency: 6,
        runHealing: 11,
        itemId: null,
      },
      {
        optionId: 'golden-parachute-cache',
        label: 'Golden Parachute Cache',
        description: contrabandItem
          ? `Steal the executive exit package for ${contrabandItem.name} and a sharper mixed payout.`
          : 'Steal the executive exit package for a sharper mixed payout and whatever elite contraband it still contains.',
        metaCurrency: 9 + rarityBonus,
        runHealing: 5 + rarityBonus,
        itemId: contrabandItemId,
      },
    ]
        : [
    {
      optionId: 'expense-fraud',
      label: 'Expense Fraud Envelope',
      description:
        'Pocket the clean chits and leave before anyone asks why the drawer is lighter.',
      metaCurrency: 12,
      runHealing: 3,
      itemId: null,
    },
    {
      optionId: 'triage-cart',
      label: 'Triage Cart',
      description:
        'Burn the restock supplies on immediate recovery and push the next fight back a little.',
      metaCurrency: 4,
      runHealing: 12,
      itemId: null,
    },
    {
      optionId: 'contraband-locker',
      label: 'Contraband Locker',
      description: contrabandItem
        ? `Crack the marked locker for ${contrabandItem.name} and a smaller mixed payout.`
        : 'Crack the marked locker for a smaller mixed payout and whatever useful junk survived.',
      metaCurrency: 6 + rarityBonus,
      runHealing: 6 + rarityBonus,
      itemId: contrabandItemId,
    },
  ];

  return baseOptions.map((option) => {
    const companionBonuses = getRewardCompanionOptionBonuses(
      run.chosenCompanionIds,
      option.optionId
    );
    const synergyBonuses = getTeamRewardSynergyBonuses(run, option.optionId);

    if (companionBonuses.length === 0 && synergyBonuses.length === 0) {
      return {
        ...option,
        companionBonusLabel: null,
        synergyBonusLabel: null,
      };
    }

    return {
      ...option,
      metaCurrency: [...companionBonuses, ...synergyBonuses].reduce(
        (total, bonus) => total + (bonus.metaCurrencyDelta ?? 0),
        option.metaCurrency
      ),
      runHealing: [...companionBonuses, ...synergyBonuses].reduce(
        (total, bonus) => total + (bonus.runHealingDelta ?? 0),
        option.runHealing
      ),
      companionBonusLabel:
        companionBonuses.length > 0
          ? companionBonuses
              .map((bonus) => `${bonus.companionName}: ${bonus.label}`)
              .join(' | ')
          : null,
      synergyBonusLabel:
        synergyBonuses.length > 0
          ? synergyBonuses
              .map((bonus) => `${bonus.synergyTitle}: ${bonus.label}`)
              .join(' | ')
          : null,
    };
  });
}

function pickDefaultRewardOptionId(
  run: RunState,
  options: PendingRewardOptionState[]
) {
  const missingHp = Math.max(0, run.hero.maxHp - run.hero.currentHp);
  const contrabandOption = options.find((option) => Boolean(option.itemId));

  if (missingHp >= 10) {
    const healingOption = [...options].sort(
      (left, right) => right.runHealing - left.runHealing
    )[0];

    return healingOption?.optionId ?? options[0]?.optionId ?? null;
  }

  if (contrabandOption?.itemId && !run.inventoryItemIds.includes(contrabandOption.itemId)) {
    return contrabandOption.optionId;
  }

  const richestOption = [...options].sort(
    (left, right) => right.metaCurrency - left.metaCurrency
  )[0];

  return richestOption?.optionId ?? options[0]?.optionId ?? null;
}

export function syncPendingRewardSelection(
  reward: PendingRewardState,
  optionId?: string | null
): PendingRewardState {
  if (!reward.options || reward.options.length === 0) {
    return {
      ...reward,
      selectedOptionId: null,
      options: null,
    };
  }

  const selectedOption =
    reward.options.find((option) => option.optionId === optionId) ??
    reward.options.find((option) => option.optionId === reward.selectedOptionId) ??
    reward.options[0];

  return {
    ...reward,
    selectedOptionId: selectedOption.optionId,
    metaCurrency: selectedOption.metaCurrency,
    runHealing: selectedOption.runHealing,
    itemId: selectedOption.itemId,
  };
}

export function createPendingReward(
  run: RunState,
  node: RunNodeState,
  sourceKind: RewardSourceKind
): PendingRewardState {
  const itemId = pickRewardItemId(run, node);
  const rewardRoomBiomeId =
    sourceKind === 'reward-node' ? getRewardRoomBiomeId(node) : null;
  const title =
    sourceKind === 'battle-victory'
      ? 'Recovered Contraband'
      : rewardRoomBiomeId === 'team-building-catacombs'
        ? 'Offsite Loot'
        : rewardRoomBiomeId === 'executive-suite'
          ? 'Executive Leakage'
          : 'Recovered Supplies';
  const description =
    sourceKind === 'battle-victory'
      ? 'The fight shook loose something valuable from the wreckage.'
      : rewardRoomBiomeId === 'team-building-catacombs'
        ? 'The retreat infrastructure is still stocked for morale theater, emergency care, and beautifully deniable theft.'
        : rewardRoomBiomeId === 'executive-suite'
          ? 'The upper floors hoard panic resources, luxury medicine, and cash meant for quieter disasters.'
          : 'The room still contains enough intact supplies that you can decide what kind of theft this is.';

  if (sourceKind === 'reward-node') {
    const options = createRewardRoomOptions(run, node);
    const defaultOptionId = pickDefaultRewardOptionId(run, options);

    return syncPendingRewardSelection(
      {
        rewardId: createId('reward'),
        sourceNodeId: node.id,
        sourceKind,
        title,
        description,
        selectedOptionId: defaultOptionId,
        options,
        metaCurrency: 0,
        runHealing: 0,
        itemId: null,
        createdAt: createTimestamp(),
      },
      defaultOptionId
    );
  }

  return {
    rewardId: createId('reward'),
    sourceNodeId: node.id,
    sourceKind,
    title,
    description,
    selectedOptionId: null,
    options: null,
    metaCurrency: getMetaCurrencyAward(sourceKind, node),
    runHealing: getRunHealingAward(sourceKind, node),
    itemId,
    createdAt: createTimestamp(),
  };
}
