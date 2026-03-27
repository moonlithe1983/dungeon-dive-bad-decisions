export type CombatPhase = 'setup' | 'player-turn' | 'victory' | 'defeat';

export type CombatActionId = 'patch' | 'escalate' | 'stabilize';

export type CombatStatusId =
  | 'burnout'
  | 'escalated'
  | 'on-hold'
  | 'micromanaged'
  | 'ccd';

export type CombatStatusState = {
  id: CombatStatusId;
  turnsRemaining: number;
};

export type CombatEnemyState = {
  enemyId: string;
  name: string;
  tier: 'normal' | 'miniboss' | 'boss';
  currentHp: number;
  maxHp: number;
  intent: string;
};

export type CombatState = {
  combatId: string;
  nodeId: string;
  phase: CombatPhase;
  turnNumber: number;
  heroHp: number;
  heroMaxHp: number;
  enemy: CombatEnemyState;
  heroStatuses: CombatStatusState[];
  enemyStatuses: CombatStatusState[];
  rollCursor: number;
  log: string[];
  lastActionId: CombatActionId | null;
};
