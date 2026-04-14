import type { Href } from 'expo-router';

import { bondSceneDefinitions } from '@/src/content/bond-scenes';
import {
  classDefinitions,
  getClassDefinition,
} from '@/src/content/classes';
import { getCompanionDefinition } from '@/src/content/companions';
import { buildMetaUpgradeCatalog } from '@/src/engine/meta/meta-upgrade-engine';
import { buildRequisitionCatalog } from '@/src/engine/meta/requisition-engine';
import { getRunResumeTarget } from '@/src/engine/run/progress-run';
import {
  endingStateDefinitions,
  getClassTruthRouteSummary,
  getNextQuarterlyTier,
} from '@/src/engine/retention/retention-engine';
import type { ProfileState } from '@/src/types/profile';
import type { RunState } from '@/src/types/run';

export type NextGoalSummary = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  href: Href;
};

export function getNextGoalSummary(input: {
  profile: ProfileState | null;
  activeRun?: RunState | null;
}): NextGoalSummary {
  const { profile, activeRun = null } = input;

  if (activeRun) {
    const target = getRunResumeTarget(activeRun);

    return {
      eyebrow: 'LIVE RUN',
      title: `Resume ${target.summaryLabel}`,
      body: `Your strongest short-term goal is still the active dive on floor ${activeRun.floorIndex}. Keep the ticket moving before the tower gets another vote.`,
      ctaLabel: `Resume ${target.buttonLabel}`,
      href: target.route as Href,
    };
  }

  if (!profile || profile.stats.totalRuns === 0) {
    return {
      eyebrow: 'FIRST SESSION',
      title: 'Survive your first 10-floor case file',
      body: 'Complete, lose, or abandon one full dive to seed the archive, expose permanent rewards, and prove the first case file is only the start of the long game.',
      ctaLabel: 'Start New Dive',
      href: '/' as Href,
    };
  }

  if (profile.retention.probation.status === 'active') {
    const runsRemaining = Math.max(
      0,
      profile.retention.probation.deadlineRunCount - profile.stats.totalRuns
    );

    return {
      eyebrow: 'PROBATION CONTRACT',
      title: `Clear the review in ${runsRemaining} run${runsRemaining === 1 ? '' : 's'}`,
      body: `Optional pressure is live. Win before the contract window closes to earn ${profile.retention.probation.rewardCurrency} bonus chits and avoid the temporary quarterly score hit.`,
      ctaLabel: 'Start New Dive',
      href: '/' as Href,
    };
  }

  if (profile.stats.totalWins === 0) {
    return {
      eyebrow: 'MILESTONE',
      title: 'Secure your first full clear',
      body: 'You have already seeded the archive. The next sticky goal is a surviving 10-floor clear that proves this tower can be finished on your terms, not just endured once.',
      ctaLabel: 'Start New Dive',
      href: '/' as Href,
    };
  }

  const missingEndingStates = endingStateDefinitions.filter(
    (ending) => !profile.retention.truth.discoveredEndingIds.includes(ending.id)
  );

  if (missingEndingStates.length > 0) {
    return {
      eyebrow: 'TRUTH LADDER',
      title: `Log ${missingEndingStates[0]?.label ?? 'the next ending state'}`,
      body: `You have logged ${profile.retention.truth.discoveredEndingIds.length}/${endingStateDefinitions.length} ending states so far. One clear is only one testimony. Fill the archive with every version of the truth before you lock in class-specific total wins.`,
      ctaLabel: 'Open Progression',
      href: '/progression' as Href,
    };
  }

  const nextFullExposureClass = classDefinitions.find(
    (classDefinition) =>
      !profile.retention.truth.fullExposureClassIds.includes(classDefinition.id)
  );

  if (nextFullExposureClass) {
    const truthRoute = getClassTruthRouteSummary(nextFullExposureClass.id);

    return {
      eyebrow: 'CLASS CASE FILE',
      title: `Earn Full Exposure with ${nextFullExposureClass.name}`,
      body: `${nextFullExposureClass.name} is your next best lens for ${truthRoute.label.toLowerCase()}. The next run should reveal a different side of Meridian, not just replay the same clear with a new sprite.`,
      ctaLabel: 'Review Classes',
      href: '/class-select' as Href,
    };
  }

  const requisitionCatalog = buildRequisitionCatalog(profile);
  const nextClassOffer = requisitionCatalog.classes
    .filter((offer) => !offer.owned)
    .sort((left, right) => left.cost - right.cost)[0];
  const nextCompanionOffer = requisitionCatalog.companions
    .filter((offer) => !offer.owned)
    .sort((left, right) => left.cost - right.cost)[0];

  if (nextClassOffer) {
    const className = getClassDefinition(nextClassOffer.id)?.name ?? nextClassOffer.title;

    return {
      eyebrow: 'ROSTER LADDER',
      title: `Unlock ${className}`,
      body: nextClassOffer.affordable
        ? `${className} is ready to requisition right now. The roster ladder is working when a win changes the next run immediately instead of leaving you with the same solved setup.`
        : `Save ${nextClassOffer.shortage} more chit${nextClassOffer.shortage === 1 ? '' : 's'} to unlock ${className} and keep the next case file from feeling like the same draft again.`,
      ctaLabel: 'Open Breakroom Hub',
      href: '/hub' as Href,
    };
  }

  if (nextCompanionOffer) {
    const companionName =
      getCompanionDefinition(nextCompanionOffer.id)?.name ?? nextCompanionOffer.title;

    return {
      eyebrow: 'ROSTER LADDER',
      title: `Recruit ${companionName}`,
      body: nextCompanionOffer.affordable
        ? `${companionName} can be hired now. Keep using wins to turn the live roster over instead of replaying the same safe pair forever.`
        : `Save ${nextCompanionOffer.shortage} more chit${nextCompanionOffer.shortage === 1 ? '' : 's'} to add ${companionName} to the live roster.`,
      ctaLabel: 'Open Breakroom Hub',
      href: '/hub' as Href,
    };
  }

  if (
    profile.retention.relationship.unlockedBondSceneIds.length < bondSceneDefinitions.length ||
    profile.retention.relationship.synergyPairIds.length < 3
  ) {
    return {
      eyebrow: 'RELATIONSHIP LADDER',
      title: 'Push bonds and crew chemistry',
      body: `You have logged ${profile.retention.relationship.unlockedBondSceneIds.length}/${bondSceneDefinitions.length} bond scenes and ${profile.retention.relationship.synergyPairIds.length} archived pairings. Rotate companions until the tower feels different with each crew instead of reading like the same run in a new folder.`,
      ctaLabel: 'Open Bonds',
      href: '/bonds' as Href,
    };
  }

  const nextQuarterTier = getNextQuarterlyTier(profile);

  if (nextQuarterTier) {
    return {
      eyebrow: 'QUARTERLY LADDER',
      title: `Reach ${nextQuarterTier.label}`,
      body: `Current quarter score is ${profile.retention.quarterly.score}. Push to ${nextQuarterTier.threshold} before inactivity decay eats the lead back down.`,
      ctaLabel: 'Open Progression',
      href: '/progression' as Href,
    };
  }

  const nextUpgradeOffer = buildMetaUpgradeCatalog(profile)
    .filter((offer) => !offer.exhausted)
    .sort(
      (left, right) =>
        (left.nextCost ?? Number.MAX_SAFE_INTEGER) -
        (right.nextCost ?? Number.MAX_SAFE_INTEGER)
    )[0];

  if (nextUpgradeOffer && nextUpgradeOffer.nextCost != null) {
    return {
      eyebrow: 'OPERATIONS GOAL',
      title: `Improve ${nextUpgradeOffer.title}`,
      body: nextUpgradeOffer.affordable
        ? `${nextUpgradeOffer.title} is ready to upgrade now and will strengthen every future climb.`
        : `Save ${nextUpgradeOffer.shortage} more chit${nextUpgradeOffer.shortage === 1 ? '' : 's'} to buy the next permanent operations upgrade.`,
      ctaLabel: 'Review Progression',
      href: '/progression' as Href,
    };
  }

  return {
    eyebrow: 'POST-WIN LADDERS',
    title: 'Pick your next case file',
    body: 'Truth ladder: earn Full Exposure with every class. Relationship ladder: finish the bond scene deck and archive more crew pairings. Quarterly ladder: keep your score alive before the quarter cools off. The next run should reveal something new, not just confirm you can repeat the old one.',
    ctaLabel: 'Open Progression',
    href: '/progression' as Href,
  };
}
