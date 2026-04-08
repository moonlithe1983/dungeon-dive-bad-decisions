import type { Href } from 'expo-router';

import { getClassDefinition } from '@/src/content/classes';
import { getCompanionDefinition } from '@/src/content/companions';
import { buildMetaUpgradeCatalog } from '@/src/engine/meta/meta-upgrade-engine';
import { buildRequisitionCatalog } from '@/src/engine/meta/requisition-engine';
import { getRunResumeTarget } from '@/src/engine/run/progress-run';
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
      title: 'Finish your first dive',
      body: 'Complete, lose, or abandon one run to seed the archive, expose permanent rewards, and prove the meta loop is live.',
      ctaLabel: 'Start New Dive',
      href: '/' as Href,
    };
  }

  const requisitionCatalog = buildRequisitionCatalog(profile);
  const nextClassOffer = requisitionCatalog.classes
    .filter((offer) => !offer.owned)
    .sort((left, right) => left.cost - right.cost)[0];
  const nextCompanionOffer = requisitionCatalog.companions
    .filter((offer) => !offer.owned)
    .sort((left, right) => left.cost - right.cost)[0];
  const nextUpgradeOffer = buildMetaUpgradeCatalog(profile)
    .filter((offer) => !offer.exhausted)
    .sort(
      (left, right) =>
        (left.nextCost ?? Number.MAX_SAFE_INTEGER) -
        (right.nextCost ?? Number.MAX_SAFE_INTEGER)
    )[0];

  if (nextClassOffer) {
    const className = getClassDefinition(nextClassOffer.id)?.name ?? nextClassOffer.title;

    return {
      eyebrow: 'ROSTER GOAL',
      title: `Unlock ${className}`,
      body: nextClassOffer.affordable
        ? `${className} is ready to requisition right now. Unlocking it adds a new run archetype immediately.`
        : `Save ${nextClassOffer.shortage} more chit${nextClassOffer.shortage === 1 ? '' : 's'} to unlock ${className} and widen run variety.`,
      ctaLabel: 'Open Breakroom Hub',
      href: '/hub' as Href,
    };
  }

  if (nextCompanionOffer) {
    const companionName =
      getCompanionDefinition(nextCompanionOffer.id)?.name ?? nextCompanionOffer.title;

    return {
      eyebrow: 'CREW GOAL',
      title: `Recruit ${companionName}`,
      body: nextCompanionOffer.affordable
        ? `${companionName} can be hired now. A new companion changes both early-run support and long-term bond progression.`
        : `Save ${nextCompanionOffer.shortage} more chit${nextCompanionOffer.shortage === 1 ? '' : 's'} to add ${companionName} to the live roster.`,
      ctaLabel: 'Open Breakroom Hub',
      href: '/hub' as Href,
    };
  }

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

  if (profile.stats.totalWins === 0) {
    return {
      eyebrow: 'MILESTONE',
      title: 'Secure your first clean win',
      body: 'You have already seeded the archive. The next sticky goal is a full surviving win that proves the climb can end on your terms.',
      ctaLabel: 'Start New Dive',
      href: '/' as Href,
    };
  }

  return {
    eyebrow: 'LONG GAME',
    title: 'Deepen the archive',
    body: 'The core loops are live. Push for cleaner runs, richer bond scenes, and stronger archive coverage by reviewing progression and climbing again.',
    ctaLabel: 'Open Progression',
    href: '/progression' as Href,
  };
}
