import type { ItemDefinition } from '@/src/types/content';

export const itemDefinitions: ItemDefinition[] = [
  { id: 'reply-all-amulet', name: 'Reply-All Amulet', rarity: 'common', effectSummary: 'Patch hits harder, especially if you keep spamming it.' },
  { id: 'bottomless-breakroom-coffee', name: 'Bottomless Breakroom Coffee', rarity: 'common', effectSummary: 'Start fights healthier, but Escalate hurts you more.' },
  { id: 'suspicious-kpi-dashboard', name: 'Suspicious KPI Dashboard', rarity: 'rare', effectSummary: 'Escalate cashes in harder while enemies are still healthy.' },
  { id: 'motivational-katana', name: 'Motivational Katana', rarity: 'uncommon', effectSummary: 'Your opening attack gets a fake-confidence burst.' },
  { id: 'corporate-card-of-dubious-origin', name: 'Corporate Card of Dubious Origin', rarity: 'rare', effectSummary: 'Adds max HP and opening pressure, with riskier escalation.' },
  { id: 'printer-toner-grenade', name: 'Printer Toner Grenade', rarity: 'common', effectSummary: 'Patch clogs the retaliation window and cuts the counterhit.' },
  { id: 'pto-voucher', name: 'PTO Voucher', rarity: 'uncommon', effectSummary: 'Reward healing is stronger, and Stabilize spikes at low HP.' },
  { id: 'stress-ball-of-impact', name: 'Stress Ball of Impact', rarity: 'common', effectSummary: 'Stabilize still heals, but now it also hits back.' },
  { id: 'synergy-stone', name: 'Synergy Stone', rarity: 'rare', effectSummary: 'Adds durability and gives committed Escalates more bite.' },
  { id: 'calendar-invite-from-hell', name: 'Calendar Invite from Hell', rarity: 'uncommon', effectSummary: 'Escalate twists timing and softens the enemy counterturn.' },
];

export function getItemDefinition(itemId: string) {
  return itemDefinitions.find((item) => item.id === itemId) ?? null;
}
