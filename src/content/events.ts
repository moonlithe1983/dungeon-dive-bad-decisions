import type { EventDefinition, RunBiomeId } from '@/src/types/content';
import { getAuthoredEventOverlay } from '@/src/content/authored-voice';

export const eventDefinitions: EventDefinition[] = [
  {
    id: 'unsafe-team-building',
    title:
      getAuthoredEventOverlay('unsafe-team-building')?.title ??
      'Unsafe Team-Building',
    description:
      getAuthoredEventOverlay('unsafe-team-building')?.description ??
      'Human Resources insists morale can still be improved with one more terrible idea.',
    biomes: ['open-plan-pits'],
  },
  {
    id: 'mandatory-feedback-loop',
    title:
      getAuthoredEventOverlay('mandatory-feedback-loop')?.title ??
      'Mandatory Feedback Loop',
    description:
      getAuthoredEventOverlay('mandatory-feedback-loop')?.description ??
      'A hallway conversation threatens to become a permanent institutional curse.',
    biomes: ['open-plan-pits'],
  },
  {
    id: 'suspicious-elevator-pitch',
    title:
      getAuthoredEventOverlay('suspicious-elevator-pitch')?.title ??
      'Suspicious Elevator Pitch',
    description:
      getAuthoredEventOverlay('suspicious-elevator-pitch')?.description ??
      'A stranger offers shortcuts, synergy, and consequences in equal measure.',
    biomes: ['open-plan-pits', 'team-building-catacombs'],
  },
  {
    id: 'fire-drill-evangelism',
    title: 'Fire Drill Evangelism',
    description:
      'A safety lead sees panic as a growth channel and starts running the evacuation like a product launch.',
    biomes: ['open-plan-pits', 'team-building-catacombs'],
  },
  {
    id: 'shadow-it-market',
    title: 'Shadow IT Market',
    description:
      'A hidden bazaar under the office sells cursed hardware, unlicensed miracles, and deeply untracked favors.',
    biomes: ['open-plan-pits', 'executive-suite'],
  },
  {
    id: 'expense-report-exorcism',
    title: 'Expense Report Exorcism',
    description:
      'Finance trapped something infernal inside reimbursement paperwork and now wants help closing the loop.',
    biomes: ['open-plan-pits', 'executive-suite'],
  },
  {
    id: 'all-hands-mutiny',
    title: 'All-Hands Mutiny',
    description:
      'The company-wide update has collapsed into a soft coup conducted through bad slides and worse applause.',
    biomes: ['team-building-catacombs', 'executive-suite'],
  },
  {
    id: 'breakroom-whistleblower',
    title: 'Breakroom Whistleblower',
    description:
      'Someone hid evidence of a policy disaster in the breakroom fridge behind a very passive-aggressive note.',
    biomes: ['open-plan-pits'],
  },
  {
    id: 'trust-fall-incident-report',
    title: 'Trust Fall Incident Report',
    description:
      'The offsite legal team left a stack of waivers beside a trust-fall pit nobody wants to discuss.',
    biomes: ['team-building-catacombs'],
  },
  {
    id: 'golden-parachute-auction',
    title: 'Golden Parachute Auction',
    description:
      'Executive severance packages are being traded in whispers just outside the corner office.',
    biomes: ['executive-suite'],
  },
];

const eventDefinitionByTitle = new Map(
  eventDefinitions.map((eventDefinition) => [eventDefinition.title, eventDefinition])
);

export function getEventDefinition(eventId: string) {
  return eventDefinitions.find((eventDefinition) => eventDefinition.id === eventId) ?? null;
}

export function getEventDefinitionByTitle(title: string) {
  return eventDefinitionByTitle.get(title) ?? null;
}

export function getEventDefinitionsForBiome(biomeId: RunBiomeId) {
  return eventDefinitions.filter((eventDefinition) =>
    eventDefinition.biomes.includes(biomeId)
  );
}
