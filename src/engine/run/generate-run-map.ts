import { getEventDefinitionsForBiome } from '@/src/content/events';
import type { RunBiomeId } from '@/src/types/content';
import type {
  RunFloorState,
  RunMapState,
  RunNodeKind,
  RunNodeState,
} from '@/src/types/run';

type FloorThemeId =
  | 'intake'
  | 'cubicle'
  | 'breakroom'
  | 'compliance'
  | 'offsite'
  | 'trust-fall'
  | 'retreat'
  | 'reception'
  | 'boardroom'
  | 'c-suite';

type NodeBlueprint = {
  kind: RunNodeKind;
  fixedCopy?: NodeCopy;
};

type FloorBlueprint = {
  themeId: FloorThemeId;
  label: string;
  description: string;
  nodes: NodeBlueprint[];
};

type SeededRandom = () => number;

type NodeCopy = {
  label: string;
  description: string;
};

const floorBlueprints: FloorBlueprint[] = [
  {
    themeId: 'intake',
    label: 'Open-Plan Pits - Basement Intake',
    description:
      'The lobby floor is where broken process enters the abyss and comes back weaponized.',
    nodes: [{ kind: 'battle' }, { kind: 'event' }],
  },
  {
    themeId: 'cubicle',
    label: 'Open-Plan Pits - Cubicle Trenches',
    description:
      'Rows of abandoned desks form a maze of stalled projects, bite-radius politics, and weaponized posture checks.',
    nodes: [{ kind: 'battle' }, { kind: 'reward' }],
  },
  {
    themeId: 'breakroom',
    label: 'Open-Plan Pits - Breakroom Sinkhole',
    description:
      'Morale collapsed here first. The coffee is sentient, the snack inventory is cursed, and the floor still remembers.',
    nodes: [
      { kind: 'event' },
      {
        kind: 'battle',
        fixedCopy: {
          label: 'Middle Manager Echo',
          description:
            'A looping supervisor apparition keeps reiterating directives until the room itself starts obeying.',
        },
      },
    ],
  },
  {
    themeId: 'compliance',
    label: 'Open-Plan Pits - Compliance Annex',
    description:
      'The final wing of the pits stores policy, shame, and the executive will to enforce both at once.',
    nodes: [
      { kind: 'reward' },
      {
        kind: 'boss',
        fixedCopy: {
          label: 'HR Compliance Director',
          description:
            'The first checkpoint boss arrives with policy authority, legal confidence, and catastrophic priorities.',
        },
      },
    ],
  },
  {
    themeId: 'offsite',
    label: 'Team-Building Catacombs - Offsite Welcome Grotto',
    description:
      'An old retreat foyer was converted into morale architecture and then left to ferment in the dark.',
    nodes: [{ kind: 'battle' }, { kind: 'reward' }],
  },
  {
    themeId: 'trust-fall',
    label: 'Team-Building Catacombs - Trust-Fall Ossuary',
    description:
      'Bone-white seminar circles and collapsed trust exercises line the path to leadership enlightenment.',
    nodes: [
      { kind: 'event' },
      {
        kind: 'battle',
        fixedCopy: {
          label: 'Mandatory Fun Coordinator',
          description:
            'The retreat host has become a grinning execution engine powered entirely by enforced morale.',
        },
      },
    ],
  },
  {
    themeId: 'retreat',
    label: 'Team-Building Catacombs - Retreat Inferno',
    description:
      'The company offsite burned long ago, but the keynote energy still screams through the rafters.',
    nodes: [
      { kind: 'reward' },
      {
        kind: 'boss',
        fixedCopy: {
          label: 'Chief Synergy Officer',
          description:
            'The second checkpoint boss weaponizes alignment language, forced positivity, and catastrophic momentum.',
        },
      },
    ],
  },
  {
    themeId: 'reception',
    label: 'Executive Suite of the Damned - Reception of Teeth',
    description:
      'This velvet-lined lobby only looks welcoming from far away. Up close, every courtesy has fangs.',
    nodes: [{ kind: 'battle' }, { kind: 'event' }],
  },
  {
    themeId: 'boardroom',
    label: 'Executive Suite of the Damned - Boardroom Maw',
    description:
      'The conference wing devours budgets, confidence, and anyone foolish enough to present without backup.',
    nodes: [
      { kind: 'reward' },
      {
        kind: 'battle',
        fixedCopy: {
          label: 'Payroll Abomination',
          description:
            'Deferred compensation, broken deductions, and old resentment have finally coalesced into payroll flesh.',
        },
      },
    ],
  },
  {
    themeId: 'c-suite',
    label: 'Executive Suite of the Damned - Abyssal C-Suite',
    description:
      'The top floor is all polished brass, occult access, and the last warm breath before absolute executive ruin.',
    nodes: [
      { kind: 'reward' },
      {
        kind: 'boss',
        fixedCopy: {
          label: 'Executive Assistant to the Abyssal CEO',
          description:
            'The final boss runs the entire upper hell through timing, access control, and immaculate violence.',
        },
      },
    ],
  },
];

const battleCopyByTheme: Record<FloorThemeId, NodeCopy[]> = {
  intake: [
    {
      label: 'Hostile Help Desk',
      description:
        'A routine escalation has become territorial and armed with policy memos.',
    },
    {
      label: 'Reception Desk Riot',
      description:
        'Check-in has failed so catastrophically that the guest services counter now bites back.',
    },
    {
      label: 'Clipboard Interdiction',
      description:
        'A choke point of forms and signatures is being defended like a military border.',
    },
    {
      label: 'Printer Uprising',
      description:
        'The office machines have unionized around a shared hatred of maintenance requests.',
    },
  ],
  cubicle: [
    {
      label: 'Compliance Ambush',
      description:
        'Clipboards appear from nowhere. Nobody leaves without signatures and bruises.',
    },
    {
      label: 'Desk Farm Collapse',
      description:
        'The cubicle maze is shedding walls, exposing hostile coworkers and worse ergonomics.',
    },
    {
      label: 'Meeting Overflow',
      description:
        'A dead-end standup has metastasized into an aggressive crowd-control problem.',
    },
    {
      label: 'Budget Enforcement',
      description:
        'Someone weaponized austerity and now the entire room is hostile to optimism.',
    },
  ],
  breakroom: [
    {
      label: 'Snack Machine Dispute',
      description:
        'The vending stack is demanding tribute in exact change and unprocessed fear.',
    },
    {
      label: 'Coffee Pot Revolt',
      description:
        'The breakroom caffeine source has achieved consciousness and hates dependency.',
    },
    {
      label: 'Microwave Incident',
      description:
        'A cursed lunch exploded hours ago, and the fallout is still fighting for territory.',
    },
    {
      label: 'Morale Enforcement',
      description:
        'Someone brought mandatory positivity into a room already at structural failure.',
    },
  ],
  compliance: [
    {
      label: 'Audit Hallway',
      description:
        'The corridor is lined with policy traps and people who think that counts as leadership.',
    },
    {
      label: 'Sanctions Office',
      description:
        'A disciplinary desk has become a forward operating base for institutional cruelty.',
    },
    {
      label: 'Escalation Tribunal',
      description:
        'Every mistake you ever logged has sent a representative to collect in person.',
    },
  ],
  offsite: [
    {
      label: 'Camp Lanyard Ambush',
      description:
        'The welcome committee still smiles while trying to beat you to death with branded optimism.',
    },
    {
      label: 'Kayak Liability Pit',
      description:
        'The team-building lake drained away years ago, leaving only waiver forms and predatory mud.',
    },
    {
      label: 'Icebreaker Knife Circle',
      description:
        'Introductions have become ritual combat, and nobody gets to be vulnerable safely anymore.',
    },
  ],
  'trust-fall': [
    {
      label: 'Trust Exercise Collapse',
      description:
        'A seminar circle keeps opening underfoot every time someone says the word alignment.',
    },
    {
      label: 'Retreat Facilitator Mob',
      description:
        'They promise growth, then rush you with clipboards and weaponized affirmations.',
    },
    {
      label: 'Team Covenant Breach',
      description:
        'A broken trust contract is roaming the hall and enforcing itself with blunt force.',
    },
  ],
  retreat: [
    {
      label: 'Bonfire Accountability',
      description:
        'Somebody turned fireside honesty into a disciplinary process and now the flames take minutes.',
    },
    {
      label: 'Vision Board Predation',
      description:
        'The mood boards can smell weakness and they want your future in writing.',
    },
    {
      label: 'Keynote Stampede',
      description:
        'A hype session broke containment and is now charging the audience in formation.',
    },
  ],
  reception: [
    {
      label: 'Velvet Rope Ambush',
      description:
        'The front desk smiles, the ropes part, and then the hospitality starts throwing elbows.',
    },
    {
      label: 'Guest List Purge',
      description:
        'A host stand possessed by executive standards has decided your name was never on the list.',
    },
    {
      label: 'Concierge Extortion',
      description:
        'Someone with immaculate posture is charging blood prices for access and pretending it is service.',
    },
  ],
  boardroom: [
    {
      label: 'Quarterly Blood Review',
      description:
        'The presentation deck wants sacrifice, not insight, and the room agrees with it.',
    },
    {
      label: 'Strategy Slide Collapse',
      description:
        'An overbuilt deck has come alive and is flattening anyone who cannot defend a forecast.',
    },
    {
      label: 'Hostile Proxy Vote',
      description:
        'The board packets bite first and litigate later.',
    },
  ],
  'c-suite': [
    {
      label: 'Access Badge Guillotine',
      description:
        'Every locked door up here remembers your salary band and takes it personally.',
    },
    {
      label: 'Executive Calendar Snare',
      description:
        'The schedule itself is now a predator, tightening around anyone without authority.',
    },
    {
      label: 'Succession Panic Room',
      description:
        'A sealed executive bunker has opened only long enough to eliminate witnesses.',
    },
  ],
};

const rewardCopyByTheme: Record<FloorThemeId, NodeCopy[]> = {
  intake: [
    {
      label: 'Supply Closet Windfall',
      description:
        'Buried beneath toner dust is something useful, illegal, or both.',
    },
    {
      label: 'Visitor Badge Cache',
      description:
        'Security never reclaimed the emergency stash, which feels like a budgetary gift.',
    },
    {
      label: 'Reception Drawer Fraud',
      description:
        'A locked drawer has finally given up pretending it belongs to the company.',
    },
  ],
  cubicle: [
    {
      label: 'Budget Reallocation',
      description:
        'A brief accounting error leaves resources unattended long enough to matter.',
    },
    {
      label: 'Desk Sweep Contraband',
      description:
        'You found a little cash, a little medicine, and one deeply unapproved accessory.',
    },
    {
      label: 'Office Supply Diversion',
      description:
        'Somebody already started stealing from the department. You are simply finishing the workflow.',
    },
  ],
  breakroom: [
    {
      label: 'Breakroom Contraband',
      description:
        'You found morale support and possibly a cursed snack machine stash.',
    },
    {
      label: 'Emergency Snack Audit',
      description:
        'The disaster snacks were never meant to survive this long without being monetized.',
    },
    {
      label: 'Coffee Fund Seizure',
      description:
        'The communal caffeine reserves can still be liberated in the name of self-care.',
    },
  ],
  compliance: [
    {
      label: 'Evidence Locker Leak',
      description:
        'Policy violations were boxed up for later review and then forgotten by everyone except you.',
    },
    {
      label: 'Settlement Packet',
      description:
        'A hush-money envelope survived the bureaucracy intact enough to become useful.',
    },
    {
      label: 'Compliance Disposal Bin',
      description:
        'The discard pile is full of expensive fixes and deniable accounting mistakes.',
    },
  ],
  offsite: [
    {
      label: 'Welcome Tote Seizure',
      description:
        'The swag bags were supposed to build culture. You can probably turn them into leverage instead.',
    },
    {
      label: 'Per Diem Drift',
      description:
        'The offsite meal budget is floating loose in the dark and nobody appears brave enough to claim it.',
    },
    {
      label: 'Cabin Mini-Bar Audit',
      description:
        'The retreat stash includes medical liquor, emergency sugar, and one deeply cursed accessory.',
    },
  ],
  'trust-fall': [
    {
      label: 'Facilitator Supply Crate',
      description:
        'The workshop gear includes first aid, morale tokens, and enough fraud to matter.',
    },
    {
      label: 'Emergency Trust Kit',
      description:
        'The backup materials were meant to save the exercise, not survive it.',
    },
    {
      label: 'Seminar Binder Ransom',
      description:
        'A locked case of retreat paperwork contains reimbursement cash and deniable tools.',
    },
  ],
  retreat: [
    {
      label: 'Leadership Gift Basket',
      description:
        'Executive gratitude has congealed into a box of premium contraband and unreported expense value.',
    },
    {
      label: 'Speaker Honorarium Mix-Up',
      description:
        'The keynote payout can be reclassified as recovery if you move fast and avoid witnesses.',
    },
    {
      label: 'Campfire Settlement Envelope',
      description:
        'A hush packet tucked behind the stage survived the flames well enough to be useful.',
    },
  ],
  reception: [
    {
      label: 'Guest Concierge Shakedown',
      description:
        'An unattended service drawer contains comfort items, emergency cash, and somebody else’s priority access.',
    },
    {
      label: 'Premium Amenity Theft',
      description:
        'The executive hospitality package can be redistributed into a much better cause.',
    },
    {
      label: 'Valet Key Misplacement',
      description:
        'A ring of very expensive keys now belongs to whoever can look least guilty.',
    },
  ],
  boardroom: [
    {
      label: 'Expense Amortization Leak',
      description:
        'The finance deck is bleeding value straight into the carpet and nobody has noticed yet.',
    },
    {
      label: 'M&A Snack Bribe',
      description:
        'The negotiation spread includes emergency sugar, merger cash, and one illegal office miracle.',
    },
    {
      label: 'Shareholder Gift Closet',
      description:
        'A locked cabinet of premium favors has lost the thread of who was supposed to receive them.',
    },
  ],
  'c-suite': [
    {
      label: 'Golden Parachute Fragments',
      description:
        'The severance package exploded on impact, leaving behind salvageable cash and polished disaster tools.',
    },
    {
      label: 'Black Card Reconciliation',
      description:
        'Someone tried to hide the last executive spending report under a very expensive rug.',
    },
    {
      label: 'Corner Office Panic Cache',
      description:
        'The final emergency stash includes luxury medicine, deniable funds, and exquisite bad ideas.',
    },
  ],
};

function hashSeed(seed: string) {
  let hash = 2166136261;

  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function createSeededRandom(seed: string): SeededRandom {
  let state = hashSeed(seed) || 0x6d2b79f5;

  return () => {
    state += 0x6d2b79f5;
    let next = Math.imul(state ^ (state >>> 15), 1 | state);
    next ^= next + Math.imul(next ^ (next >>> 7), 61 | next);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function pickOne<T>(items: T[], random: SeededRandom) {
  const index = Math.floor(random() * items.length);
  return items[index] ?? items[0];
}

function getBiomeIdForTheme(themeId: FloorThemeId): RunBiomeId {
  if (
    themeId === 'intake' ||
    themeId === 'cubicle' ||
    themeId === 'breakroom' ||
    themeId === 'compliance'
  ) {
    return 'open-plan-pits';
  }

  if (
    themeId === 'offsite' ||
    themeId === 'trust-fall' ||
    themeId === 'retreat'
  ) {
    return 'team-building-catacombs';
  }

  return 'executive-suite';
}

function pickEventNodeCopy(
  themeId: FloorThemeId,
  random: SeededRandom,
  usedEventIds: Set<string>
) {
  const biomeEventDefinitions = getEventDefinitionsForBiome(getBiomeIdForTheme(themeId));
  const availableDefinitions =
    biomeEventDefinitions.filter(
      (eventDefinition) => !usedEventIds.has(eventDefinition.id)
    ) ?? [];
  const pool =
    availableDefinitions.length > 0
      ? availableDefinitions
      : biomeEventDefinitions;
  const pickedDefinition = pickOne(pool, random);

  usedEventIds.add(pickedDefinition.id);

  return {
    label: pickedDefinition.title,
    description: pickedDefinition.description,
  };
}

function getNodeCopy(
  floorBlueprint: FloorBlueprint,
  nodeBlueprint: NodeBlueprint,
  random: SeededRandom,
  usedEventIds: Set<string>
) {
  if (nodeBlueprint.fixedCopy) {
    return nodeBlueprint.fixedCopy;
  }

  const { kind } = nodeBlueprint;
  const { themeId } = floorBlueprint;

  if (kind === 'event') {
    return pickEventNodeCopy(themeId, random, usedEventIds);
  }

  if (kind === 'reward') {
    return pickOne(rewardCopyByTheme[themeId], random);
  }

  return pickOne(battleCopyByTheme[themeId], random);
}

function createNode(
  floorBlueprint: FloorBlueprint,
  floorNumber: number,
  sequence: number,
  nodeBlueprint: NodeBlueprint,
  random: SeededRandom,
  usedEventIds: Set<string>,
  isInitiallyActive: boolean
): RunNodeState {
  const copy = getNodeCopy(floorBlueprint, nodeBlueprint, random, usedEventIds);

  return {
    id: `floor-${floorNumber}-node-${sequence}`,
    floorNumber,
    sequence,
    kind: nodeBlueprint.kind,
    label: copy.label,
    description: copy.description,
    status: isInitiallyActive ? 'active' : 'locked',
  };
}

export function generateRunMap(seed: string): RunMapState {
  const random = createSeededRandom(seed);
  const usedEventIds = new Set<string>();

  return {
    floors: floorBlueprints.map((floorBlueprint, floorIndex) => {
      const floorNumber = floorIndex + 1;

      return {
        id: `floor-${floorNumber}`,
        floorNumber,
        label: floorBlueprint.label,
        description: floorBlueprint.description,
        status: floorNumber === 1 ? 'active' : 'locked',
        nodes: floorBlueprint.nodes.map((nodeBlueprint, nodeIndex) =>
          createNode(
            floorBlueprint,
            floorNumber,
            nodeIndex + 1,
            nodeBlueprint,
            random,
            usedEventIds,
            floorNumber === 1 && nodeIndex === 0
          )
        ),
      } satisfies RunFloorState;
    }),
  };
}
