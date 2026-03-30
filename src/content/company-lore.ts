export const COMPANY_NAME = 'Crown Meridian Holdings';
export const TOWER_NAME = 'Meridian Spire';
export const DISASTER_NAME = 'Project Everrise';

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

export function getClassNarrative(classId: string) {
  return classNarratives[classId] ?? defaultNarrative;
}

export function getCompanyDisasterSummary() {
  return `${COMPANY_NAME} leadership forced ${DISASTER_NAME} through ${TOWER_NAME}, welding every department into one vertical catastrophe and then demanding it fail in an approved manner.`;
}

export function createClassEncounterBrief(classId: string, nodeLabel: string) {
  const narrative = getClassNarrative(classId);

  return `${narrative.floorBrief} ${nodeLabel} is the next executive mess between you and keeping your job.`;
}

export function createClassCombatIntroLine(classId: string, enemyName: string) {
  const narrative = getClassNarrative(classId);

  return `${narrative.combatBrief} ${enemyName} is what this floor sends when leadership would rather kill the fix than sign it.`;
}
