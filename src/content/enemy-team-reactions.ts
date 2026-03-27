import { getActiveTeamSynergyCards } from '@/src/content/team-synergies';
import type { CombatStatusId } from '@/src/types/combat';
import type { RunState } from '@/src/types/run';

type EnemyTeamCountermeasureDefinition = {
  id: string;
  enemyId: string;
  synergyId: string;
  title: string;
  summary: string;
  introLine: string;
  enemyMaxHpDelta?: number;
  enemyDamageBonus?: number;
  startingHeroStatuses?: {
    id: CombatStatusId;
    turnsRemaining: number;
    logLine: string;
  }[];
};

export type ResolvedEnemyTeamCountermeasure =
  EnemyTeamCountermeasureDefinition & {
    synergyTitle: string;
  };

export type EnemyTeamCountermeasureCard = {
  id: string;
  title: string;
  summary: string;
  synergyTitle: string;
};

const enemyTeamCountermeasureDefinitions: EnemyTeamCountermeasureDefinition[] = [
  {
    id: 'policy-audit-spiral',
    enemyId: 'hr-compliance-director',
    synergyId: 'executive-triage',
    title: 'Policy Audit Spiral',
    summary:
      'HR has seen Executive Triage before: +4 enemy HP and you start Micromanaged.',
    introLine:
      'HR Compliance Director recognizes Executive Triage immediately and arrives with prefiled counterforms.',
    enemyMaxHpDelta: 4,
    startingHeroStatuses: [
      {
        id: 'micromanaged',
        turnsRemaining: 1,
        logLine:
          'HR Compliance Director opens with a policy audit spiral. You are now Micromanaged.',
      },
    ],
  },
  {
    id: 'calendar-ambush',
    enemyId: 'executive-assistant-to-the-abyssal-ceo',
    synergyId: 'paperwork-expedition',
    title: 'Calendar Ambush',
    summary:
      'The abyssal assistant breaks your recovery line: +3 enemy HP and you start On Hold.',
    introLine:
      'The Executive Assistant to the Abyssal CEO has prepared for Paperwork Expedition and front-loads the calendar.',
    enemyMaxHpDelta: 3,
    startingHeroStatuses: [
      {
        id: 'on-hold',
        turnsRemaining: 1,
        logLine:
          'The abyssal assistant jams your opening clean move. You are now On Hold.',
      },
    ],
  },
  {
    id: 'weaponized-alignment',
    enemyId: 'chief-synergy-officer',
    synergyId: 'boardroom-lockdown',
    title: 'Weaponized Alignment',
    summary:
      "Chief Synergy Officer feeds on Boardroom Lockdown: enemy retaliation gains +1 damage and you start CC'd.",
    introLine:
      'Chief Synergy Officer sees Boardroom Lockdown and invites several more stakeholders into the killbox.',
    enemyDamageBonus: 1,
    startingHeroStatuses: [
      {
        id: 'ccd',
        turnsRemaining: 1,
        logLine:
          "Chief Synergy Officer floods the room with alignment theater. You are now CC'd.",
      },
    ],
  },
  {
    id: 'vendor-lockout',
    enemyId: 'procurement-horror',
    synergyId: 'disaster-salvage',
    title: 'Vendor Lockout',
    summary:
      'Procurement Horror punishes salvage tactics: enemy retaliation gains +1 damage and you start Burnout.',
    introLine:
      'Procurement Horror detects Disaster Salvage and closes the practical exits before the fight starts.',
    enemyDamageBonus: 1,
    startingHeroStatuses: [
      {
        id: 'burnout',
        turnsRemaining: 1,
        logLine:
          'Procurement Horror forces you into a dead-end vendor loop. You pick up Burnout.',
      },
    ],
  },
  {
    id: 'approval-loop',
    enemyId: 'middle-manager-echo',
    synergyId: 'panic-copy',
    title: 'Approval Loop',
    summary:
      "Middle Manager Echo traps Panic Copy in sign-off hell: +3 enemy HP and you start CC'd.",
    introLine:
      'Middle Manager Echo spots Panic Copy and duplicates the approval chain until the room starts shaking.',
    enemyMaxHpDelta: 3,
    startingHeroStatuses: [
      {
        id: 'ccd',
        turnsRemaining: 1,
        logLine:
          "Middle Manager Echo drags everyone onto the thread. You are now CC'd.",
      },
    ],
  },
];

export function getEnemyTeamCountermeasures(
  run: RunState,
  enemyId: string
): ResolvedEnemyTeamCountermeasure[] {
  const activeSynergies = new Map(
    getActiveTeamSynergyCards(run).map((card) => [card.id, card])
  );

  return enemyTeamCountermeasureDefinitions.flatMap((definition) => {
    if (definition.enemyId !== enemyId) {
      return [];
    }

    const activeSynergy = activeSynergies.get(definition.synergyId);

    if (!activeSynergy) {
      return [];
    }

    return [
      {
        ...definition,
        synergyTitle: activeSynergy.title,
      },
    ];
  });
}

export function getEnemyTeamCountermeasureCards(
  run: RunState,
  enemyId: string
): EnemyTeamCountermeasureCard[] {
  return getEnemyTeamCountermeasures(run, enemyId).map((countermeasure) => ({
    id: countermeasure.id,
    title: countermeasure.title,
    summary: countermeasure.summary,
    synergyTitle: countermeasure.synergyTitle,
  }));
}

export function getEnemyTeamCountermeasureMaxHpBonus(
  run: RunState,
  enemyId: string
) {
  return getEnemyTeamCountermeasures(run, enemyId).reduce(
    (total, countermeasure) => total + (countermeasure.enemyMaxHpDelta ?? 0),
    0
  );
}

export function getEnemyTeamCountermeasureDamageBonus(
  run: RunState,
  enemyId: string
) {
  return getEnemyTeamCountermeasures(run, enemyId).reduce(
    (total, countermeasure) => total + (countermeasure.enemyDamageBonus ?? 0),
    0
  );
}
