import type { StatusDefinition } from '@/src/types/content';

export const statusDefinitions: StatusDefinition[] = [
  { id: 'burnout', name: 'Burnout', polarity: 'debuff', effectSummary: 'Action quality drops as pressure accumulates.' },
  { id: 'escalated', name: 'Escalated', polarity: 'debuff', effectSummary: 'Small threats become immediate problems.' },
  { id: 'on-hold', name: 'On Hold', polarity: 'neutral', effectSummary: 'Delays resolution and blocks clean sequencing.' },
  { id: 'micromanaged', name: 'Micromanaged', polarity: 'debuff', effectSummary: 'Limits flexibility and punishes improvisation.' },
  { id: 'ccd', name: "CC'd", polarity: 'neutral', effectSummary: 'Involves too many people and spreads consequences wider.' },
];

export function getStatusDefinition(statusId: string) {
  return statusDefinitions.find((item) => item.id === statusId) ?? null;
}
