export const COMPANY_NAME = 'Crown Meridian Holdings';
export const TOWER_NAME = 'Meridian Spire';
export const DISASTER_NAME = 'Project Everrise';

type TicketStage = {
  id: 'intake' | 'compliance' | 'synergy' | 'executive';
  label: string;
  owner: string;
  pressure: string;
  lossTitle: string;
  lossLine: string;
  winLine: string;
  abandonLine: string;
};

export type TicketBrief = {
  ticketId: string;
  subject: string;
  filedBy: string;
  escalationTrack: string;
  currentOwner: string;
  summary: string;
};

type ClassNarrative = {
  roleLabel: string;
  openingHook: string;
  leadershipFailure: string;
  stake: string;
  approvalConstraint: string;
  rivalDepartments: string;
  floorBrief: string;
  combatBrief: string;
};

const defaultNarrative: ClassNarrative = {
  roleLabel: 'Emergency Operator',
  openingHook:
    'You are the poor soul still left in the building when the executive plan finally grows teeth.',
  leadershipFailure:
    `${COMPANY_NAME} leadership fused every department into ${DISASTER_NAME} and called the result innovation.`,
  stake:
    `If ${TOWER_NAME} stays corrupted, leadership will need a scapegoat and your badge is the cheapest one in reach.`,
  approvalConstraint:
    'Every fix has to look sanctioned on paper or the system treats you like the next problem to eliminate.',
  rivalDepartments:
    'Every floor still carries the fingerprints of another department pretending it was helping.',
  floorBrief:
    `You are climbing ${TOWER_NAME} because the company broke itself and still expects a tasteful rescue.`,
  combatBrief:
    'Win fast, document faster, and never give leadership an excuse to say the damage was your initiative.',
};

const classTicketSubjects: Record<string, string> = {
  'it-support': 'SEV-1 Everrise cross-department outage',
  'customer-service-rep': 'Customer-facing escalation cascade',
  'sales-rep': 'Revenue promise breach and pipeline fallout',
  intern: 'Unauthorized prototype contamination event',
  paralegal: 'Privilege, liability, and records exposure spiral',
};

const ticketStages: TicketStage[] = [
  {
    id: 'intake',
    label: 'Basement intake triage',
    owner: 'Facilities, service desk, and local management',
    pressure:
      'The case still looks small enough for middle management to misroute, which is why it keeps surviving.',
    lossTitle: 'Ticket Lost In Intake',
    lossLine:
      'The issue died before it escaped the floor where leadership still thought denial counted as containment.',
    winLine:
      'The intake mess finally stopped bouncing between teams and started breaking the people who caused it.',
    abandonLine:
      "You parked the ticket before it escaped intake and became someone else's incident report.",
  },
  {
    id: 'compliance',
    label: 'Formal compliance escalation',
    owner: 'HR, policy, and employee-risk containment',
    pressure:
      'Badge access, retention risk, and policy exposure have forced the problem into formal review.',
    lossTitle: 'Ticket Buried In Compliance',
    lossLine:
      'The issue reached formal review, where process became more lethal than the original failure.',
    winLine:
      'Compliance could no longer hide the blast radius behind policy language, so the case escalated upward anyway.',
    abandonLine:
      'You stepped away while compliance still believed another memo might solve the body count.',
  },
  {
    id: 'synergy',
    label: 'Cross-functional morale escalation',
    owner: 'Retreat leadership, culture theater, and alignment enforcement',
    pressure:
      'The problem now threatens morale, optics, and every fake promise leadership made at the offsite.',
    lossTitle: 'Ticket Crashed In Alignment',
    lossLine:
      'The issue turned into an org-wide spectacle and the spectacle won.',
    winLine:
      'The retreat layer failed to spin the disaster into culture, so the case climbed into executive territory.',
    abandonLine:
      'You left before alignment theater could finish converting the incident into company myth.',
  },
  {
    id: 'executive',
    label: 'Executive containment breach',
    owner: 'Upper management, payroll exposure, and access control',
    pressure:
      'The issue now threatens executive scheduling, payroll legitimacy, and the people who thought they could outrank consequences.',
    lossTitle: 'Ticket Escalated Past Rescue',
    lossLine:
      'The issue reached the top floor, where power stopped pretending it wanted the truth to survive.',
    winLine:
      'The full escalation chain finally broke and left the executives holding their own disaster in both hands.',
    abandonLine:
      'You withdrew while the executive layer was still deciding whose career should die first.',
  },
];

const classNarratives: Record<string, ClassNarrative> = {
  'it-support': {
    roleLabel: 'Incident Custodian',
    openingHook:
      `You are the IT fixer Crown Meridian only remembers after another vice president clicks yes on a cursed rollout.`,
    leadershipFailure:
      `${DISASTER_NAME} merged ticketing, payroll access, legal approvals, sales demos, and facilities controls into one executive command stack because leadership wanted a "single pane of glass" before quarter close.`,
    stake:
      `If you cannot clear ${TOWER_NAME}, the outage becomes your fault, the postmortem becomes your firing, and the company outsources the survivors.`,
    approvalConstraint:
      'Every repair has to read like an approved change request or executive safeguards roll it back and flag you as the intruder.',
    rivalDepartments:
      'You are cleaning up after Sales shortcuts, paralegal lockouts, intern experiments, and customer-service promises nobody should have made.',
    floorBrief:
      `You know this tower as a stack of broken systems wearing department names. Your job is to keep the company alive without letting leadership notice how close it came to dying.`,
    combatBrief:
      'Treat each fight like hostile remediation: isolate the fault, survive the blame, and leave an audit trail leadership cannot weaponize against you.',
  },
  'customer-service-rep': {
    roleLabel: 'Frontline Containment Specialist',
    openingHook:
      `You are the customer-service rep who spent years absorbing fury while executives promised impossible outcomes on your behalf.`,
    leadershipFailure:
      `${DISASTER_NAME} turned every escalation script into literal architecture, so now the tower runs on impossible promises, complaint loops, and rooms that refuse to de-escalate.`,
    stake:
      `If you fail, clients revolt, leadership blames your tone, and your livelihood disappears under the phrase "service realignment."`,
    approvalConstraint:
      'Every lifesaving choice still has to sound aligned, empathetic, and brand-safe or upper management rejects the fix on style alone.',
    rivalDepartments:
      'You have already fought half these disasters in email form, especially the ones Sales closed, IT warned about, and Legal worded into a trap.',
    floorBrief:
      `You are climbing because nobody else in the company knows how to keep a catastrophe talking long enough to survive it.`,
    combatBrief:
      'Keep the room from breaking all at once, turn pressure back where it belongs, and make leadership think the save was always part of the script.',
  },
  'sales-rep': {
    roleLabel: 'Quota Predator',
    openingHook:
      `You are the sales rep who can smell leverage through smoke, lies, and whatever HR calls a restructuring this week.`,
    leadershipFailure:
      `${DISASTER_NAME} promised investors infinite pipeline by wiring prospecting, compensation, compliance, and access control into one executive growth engine.`,
    stake:
      `If the tower stands, the quarter dies, commissions vanish, and leadership buries you under the same fantasy numbers they ordered you to sell.`,
    approvalConstraint:
      'Every brutal fix still has to look like revenue-positive executive alignment or the board kills it before it lands.',
    rivalDepartments:
      'You know exactly which floors were poisoned by Legal slowdown, IT refusal, customer-service fallout, and intern optimism.',
    floorBrief:
      `You are climbing because this company taught you to close impossible deals, and surviving your own leadership is the last one on the board.`,
    combatBrief:
      'Push momentum, take ugly openings, and make each win look expensive enough that leadership mistakes it for strategy.',
  },
  intern: {
    roleLabel: 'Disposable Miracle',
    openingHook:
      `You are the intern they handed a badge, a half-charged laptop, and just enough responsibility to become legally interesting.`,
    leadershipFailure:
      `${DISASTER_NAME} used unpaid labor, forbidden prototypes, and "stretch opportunities" to glue the tower together, then left when it started growling.`,
    stake:
      `If you fail, leadership calls it a learning experience, the tower eats your future, and nobody even remembers who approved your access.`,
    approvalConstraint:
      'Every outrageous save still has to look like obedient initiative or someone upstairs decides you were never authorized to succeed.',
    rivalDepartments:
      'You have been bossed around by every department in the company, which is why the whole building now feels like one long revenge tour.',
    floorBrief:
      `You are climbing because nobody important stayed behind, and somehow the least protected person in the company is also the only one still moving upward.`,
    combatBrief:
      'Fail upward with style, steal every lesson the tower offers, and survive long enough that leadership has to pretend they believed in you.',
  },
  paralegal: {
    roleLabel: 'Clause Executioner',
    openingHook:
      `You are the paralegal who actually read the merger packet, which means you knew this tower would become a crime scene months ago.`,
    leadershipFailure:
      `${DISASTER_NAME} stapled policy enforcement, severance controls, executive privilege, and disciplinary tooling into one self-protecting legal labyrinth.`,
    stake:
      `If you do not clear ${TOWER_NAME}, leadership keeps their immunity, you take the liability, and the company rewrites the record without you in it.`,
    approvalConstraint:
      'Every takedown has to be procedurally beautiful or the same people who caused the disaster declare your fix inadmissible.',
    rivalDepartments:
      'You can see the fingerprints of HR, Finance, Sales, and executive scheduling all over these rooms, and every one of them thought paperwork would save them.',
    floorBrief:
      `You are climbing because the tower is a living brief full of bad clauses, and you are the only person left who knows where to stick the knife.`,
    combatBrief:
      'Control the wording, control the timing, and make every victory so properly documented that leadership cannot undo it without incriminating itself.',
  },
};

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getTicketStage(floorIndex: number) {
  if (floorIndex >= 10) {
    return ticketStages[3];
  }

  if (floorIndex >= 7) {
    return ticketStages[2];
  }

  if (floorIndex >= 4) {
    return ticketStages[1];
  }

  return ticketStages[0];
}

function createTicketId(classId: string, runId?: string | null) {
  const tokenSource = runId && runId.length > 0 ? runId : `${classId}-prep`;
  const numeric = (hashString(tokenSource) % 90000) + 10000;

  return `CMD-${numeric}`;
}

function getTicketSubject(classId: string) {
  return classTicketSubjects[classId] ?? 'Cross-department Everrise incident';
}

export function getClassNarrative(classId: string) {
  return classNarratives[classId] ?? defaultNarrative;
}

export function createTicketBrief(input: {
  classId: string;
  floorIndex: number;
  runId?: string | null;
  currentNodeLabel?: string | null;
}) : TicketBrief {
  const narrative = getClassNarrative(input.classId);
  const stage = getTicketStage(input.floorIndex);
  const currentOwner = input.currentNodeLabel
    ? `${stage.owner}. Current stop: ${input.currentNodeLabel}.`
    : stage.owner;

  return {
    ticketId: createTicketId(input.classId, input.runId),
    subject: getTicketSubject(input.classId),
    filedBy: narrative.roleLabel,
    escalationTrack: stage.label,
    currentOwner,
    summary: `${stage.pressure} ${narrative.stake}`,
  };
}

export function createTicketOutcomeCopy(input: {
  result: 'win' | 'loss' | 'abandon';
  classId: string;
  floorIndex: number;
  currentNodeLabel?: string | null;
  enemyName?: string | null;
  pendingRewardLost?: boolean;
}) {
  const ticket = createTicketBrief({
    classId: input.classId,
    floorIndex: input.floorIndex,
  });
  const stage = getTicketStage(input.floorIndex);
  const location = input.currentNodeLabel ? ` at ${input.currentNodeLabel}` : '';

  if (input.result === 'win') {
    return {
      title: 'Ticket Closed',
      detail: `${ticket.ticketId} - ${ticket.subject} closed${location} on floor ${input.floorIndex}. ${stage.winLine}`,
    };
  }

  if (input.result === 'loss') {
    const enemyClause = input.enemyName ? ` ${input.enemyName} turned the escalation into a killbox.` : '';

    return {
      title: stage.lossTitle,
      detail: `${ticket.ticketId} - ${ticket.subject} failed${location} on floor ${input.floorIndex}.${enemyClause} ${stage.lossLine}`,
    };
  }

  return {
    title: 'Ticket Parked In Queue',
    detail: `${ticket.ticketId} - ${ticket.subject} was abandoned${location} on floor ${input.floorIndex}. ${stage.abandonLine}${
      input.pendingRewardLost ? ' A pending payout was left behind.' : ''
    }`,
  };
}

export function createTicketFailureLead(input: {
  classId: string;
  floorIndex: number;
  currentNodeLabel: string;
  enemyName: string;
}) {
  const ticket = createTicketBrief({
    classId: input.classId,
    floorIndex: input.floorIndex,
    currentNodeLabel: input.currentNodeLabel,
  });
  const stage = getTicketStage(input.floorIndex);

  return `${ticket.ticketId} - ${ticket.subject} died in ${stage.label.toLowerCase()} at ${input.currentNodeLabel} when ${input.enemyName} won the escalation exchange.`;
}

export function getCompanyDisasterSummary() {
  return `${COMPANY_NAME} leadership forced ${DISASTER_NAME} through ${TOWER_NAME}, welding every department into one vertical catastrophe and then demanding it fail in an approved manner.`;
}

export function createClassEncounterBrief(classId: string, nodeLabel: string) {
  if (classId === 'it-support') {
    return `${nodeLabel} looks recoverable only if you break the right thing first. Keep the fix ugly, fast, and logged before leadership calls the outage your fault.`;
  }

  if (classId === 'customer-service-rep') {
    return `${nodeLabel} already sounds like a room that wants panic more than answers. Slow the damage, keep the tone steady, and do not let the crisis hear you bleed.`;
  }

  if (classId === 'sales-rep') {
    return `${nodeLabel} is a live close with body count attached. Push the leverage before the room decides you are the expendable line item.`;
  }

  if (classId === 'intern') {
    return `${nodeLabel} is another terrible situation that somehow expects you to act supervised. Stay quick, learn the wrong lesson later, and survive the experiment now.`;
  }

  if (classId === 'paralegal') {
    return `${nodeLabel} is full of weak records and stronger lies. Put the right pressure on the right clause before the floor rewrites the facts around your corpse.`;
  }

  const narrative = getClassNarrative(classId);
  return `${narrative.floorBrief} ${nodeLabel} is the next executive mess between you and keeping your job.`;
}

export function createClassCombatIntroLine(classId: string, enemyName: string) {
  if (classId === 'it-support') {
    return `${enemyName} is not a monster. It is a failed escalation wearing permissions. Fix it fast and pray the logs stay admissible.`;
  }

  if (classId === 'customer-service-rep') {
    return `${enemyName} wants a confession, not a conversation. Keep the room stable just long enough to make it regret speaking first.`;
  }

  if (classId === 'sales-rep') {
    return `${enemyName} walks in like executive confidence made flesh. Fine. Sell it the idea that losing was always the premium option.`;
  }

  if (classId === 'intern') {
    return `${enemyName} looks promoted beyond its training, which at least makes the fight feel familiar. Stay alive and call it experiential learning later.`;
  }

  if (classId === 'paralegal') {
    return `${enemyName} is protected by policy, optics, and at least one lie. Good. That means it can still be broken on the record.`;
  }

  const narrative = getClassNarrative(classId);
  return `${narrative.combatBrief} ${enemyName} is what this floor sends when leadership would rather kill the fix than sign it.`;
}

export function createClassRouteBrief(classId: string, nodeLabel: string) {
  if (classId === 'it-support') {
    return `${nodeLabel} is the next ticket stop. Pick the path that looks recoverable, not clean. Nothing in this tower is clean anymore.`;
  }

  if (classId === 'customer-service-rep') {
    return `${nodeLabel} is the next room asking for calm it does not deserve. Take the path where panic sounds slowest and pain arrives in sequence.`;
  }

  if (classId === 'sales-rep') {
    return `${nodeLabel} is the next chance to turn fear into leverage. Take the route with the best upside before the quarter turns homicidal again.`;
  }

  if (classId === 'intern') {
    return `${nodeLabel} looks survivable in a legally flexible way. Pick fast, stay lucky, and do not let the adults notice this is still your problem.`;
  }

  if (classId === 'paralegal') {
    return `${nodeLabel} is where the record looks weakest and the liability fattest. Take the route that leaves evidence and the fewest clean excuses.`;
  }

  return `${nodeLabel} is the next stop. Pick the route that keeps the ticket moving and the tower from choosing for you.`;
}

export function createClassRewardBrief(
  classId: string,
  sourceKind: 'battle-victory' | 'reward-node'
) {
  const sourceLead =
    sourceKind === 'battle-victory'
      ? 'This payout came off a cleared escalation gate.'
      : 'This side-room haul still belongs to the same ugly case file.';

  if (classId === 'it-support') {
    return `${sourceLead} Take the package that solves the next problem instead of creating a prettier outage.`;
  }

  if (classId === 'customer-service-rep') {
    return `${sourceLead} Take the option that keeps the team upright long enough to sound composed again.`;
  }

  if (classId === 'sales-rep') {
    return `${sourceLead} Take the package with real leverage, not the one leadership would call tasteful.`;
  }

  if (classId === 'intern') {
    return `${sourceLead} Take the option most likely to keep you alive and accidentally overqualified.`;
  }

  if (classId === 'paralegal') {
    return `${sourceLead} Take the sharp package, the defensible one, or ideally the one that is somehow both.`;
  }

  return `${sourceLead} Take what best keeps the escalation moving upward.`;
}

export function createClassRecapDirective(
  classId: string,
  result: 'win' | 'loss' | 'abandon'
) {
  if (classId === 'it-support') {
    if (result === 'win') {
      return 'Issue contained. Root cause remains executive. Keep the fix and distrust the environment.';
    }
    if (result === 'abandon') {
      return 'Good retreat if it preserved a cleaner fix window. Re-enter with less optimism and better tooling.';
    }
    return 'That run died in remediation. Next time cut the future outage off before it grows a face.';
  }

  if (classId === 'customer-service-rep') {
    if (result === 'win') {
      return 'Still standing, still polite, still much worse for the tower than it expected.';
    }
    if (result === 'abandon') {
      return 'Retreat only counts if it saves enough breath to control the next room on entry.';
    }
    return 'We held the line until the line turned feral. Next time choose the path where panic lands one piece at a time.';
  }

  if (classId === 'sales-rep') {
    if (result === 'win') {
      return 'Closed. Ugly close, but the tower still has to book it as a close.';
    }
    if (result === 'abandon') {
      return 'Walking away is acceptable only if the next run opens with better leverage.';
    }
    return 'That was a forecast miss with blood in it. Next time stop treating pressure like free upside.';
  }

  if (classId === 'intern') {
    if (result === 'win') {
      return 'Still alive. Still underqualified. Still somehow the best employee left in the building.';
    }
    if (result === 'abandon') {
      return 'A retreat is still useful if you learned which terrible idea almost worked.';
    }
    return 'You failed upward until there was no up left. Next time keep the useful mistake and dump the fatal one.';
  }

  if (classId === 'paralegal') {
    if (result === 'win') {
      return 'Record preserved. Damage named. Immunity weakened.';
    }
    if (result === 'abandon') {
      return 'Retreat only matters if the next filing comes back sharper and harder to bury.';
    }
    return 'They buried this run under process and called it clean. Next time leave a worse record for them to hide.';
  }

  return result === 'win'
    ? 'The run worked. Keep the part of the build that actually held.'
    : result === 'abandon'
      ? 'Retreat only helps if it sharpens the next attempt.'
      : 'Take the lesson that failed cleanest and bring it back angrier.';
}
