import type { EnemyDefinition } from '@/src/types/content';

export const enemyDefinitions: EnemyDefinition[] = [
  { id: 'ticket-swarm', name: 'Ticket Swarm', tier: 'normal', baseHealth: 18, intent: 'Chip damage and escalating clutter.' },
  { id: 'meeting-leech', name: 'Meeting Leech', tier: 'normal', baseHealth: 20, intent: 'Drains tempo with dead-air turns.' },
  { id: 'policy-wisp', name: 'Policy Wisp', tier: 'normal', baseHealth: 16, intent: 'Applies annoying compliance statuses.' },
  { id: 'budget-ghoul', name: 'Budget Ghoul', tier: 'normal', baseHealth: 24, intent: 'Trades durability for resource denial.' },
  { id: 'compliance-mite', name: 'Compliance Mite', tier: 'normal', baseHealth: 14, intent: 'Stacks small punishments fast.' },
  { id: 'calendar-worm', name: 'Calendar Worm', tier: 'normal', baseHealth: 19, intent: 'Manipulates turn order and delays recovery.' },
  { id: 'escalation-hound', name: 'Escalation Hound', tier: 'normal', baseHealth: 22, intent: 'Punishes defensive turns.' },
  { id: 'survey-revenant', name: 'Survey Revenant', tier: 'normal', baseHealth: 17, intent: 'Turns feedback into psychic damage.' },
  { id: 'vendor-shade', name: 'Vendor Shade', tier: 'normal', baseHealth: 23, intent: 'Leans on hidden fees and nasty debuffs.' },
  { id: 'performance-review-slime', name: 'Performance Review Slime', tier: 'normal', baseHealth: 26, intent: 'Splits pressure across multiple weak hits.' },
  { id: 'middle-manager-echo', name: 'Middle Manager Echo', tier: 'miniboss', baseHealth: 48, intent: 'Repeats orders until the fight becomes unstable.' },
  { id: 'procurement-horror', name: 'Procurement Horror', tier: 'miniboss', baseHealth: 54, intent: 'Locks options and inflates every decision cost.' },
  { id: 'mandatory-fun-coordinator', name: 'Mandatory Fun Coordinator', tier: 'miniboss', baseHealth: 50, intent: 'Wraps heavy damage inside morale theater.' },
  { id: 'legacy-system-beast', name: 'Legacy System Beast', tier: 'miniboss', baseHealth: 58, intent: 'Breaks expectations with brittle old patterns.' },
  { id: 'payroll-abomination', name: 'Payroll Abomination', tier: 'miniboss', baseHealth: 55, intent: 'Punishes mistakes in ugly delayed bursts.' },
  { id: 'hr-compliance-director', name: 'HR Compliance Director', tier: 'boss', baseHealth: 85, intent: 'Enforces policy instead of solving anything.' },
  { id: 'chief-synergy-officer', name: 'Chief Synergy Officer', tier: 'boss', baseHealth: 92, intent: 'Converts fake positivity into lethal pressure.' },
  { id: 'executive-assistant-to-the-abyssal-ceo', name: 'Executive Assistant to the Abyssal CEO', tier: 'boss', baseHealth: 100, intent: 'Wins through precision, tempo, and ruthless access to power.' },
];
