import type { CombatActionId } from '@/src/types/combat';

export type ClassActionPreview = {
  id: CombatActionId;
  label: string;
  summary: string;
};

type ClassActionKit = {
  classId: string;
  actions: ClassActionPreview[];
};

const classActionKits: Record<string, ClassActionKit> = {
  'it-support': {
    classId: 'it-support',
    actions: [
      {
        id: 'patch',
        label: 'Patch Notes',
        summary: 'Clean damage that places the enemy On Hold.',
      },
      {
        id: 'escalate',
        label: 'Escalate Ticket',
        summary: 'Reliable burst that hits harder into already disrupted enemies.',
      },
      {
        id: 'stabilize',
        label: 'Stabilize Systems',
        summary: 'Recovers HP, clears one hero status, and improves under status pressure.',
      },
      {
        id: 'dodge',
        label: 'Reroute Traffic',
        summary: 'Trades most of your offense for timing, setup damage, and heavy retaliation reduction.',
      },
    ],
  },
  'customer-service-rep': {
    classId: 'customer-service-rep',
    actions: [
      {
        id: 'patch',
        label: 'Scripted Reassurance',
        summary: "Deals steady damage, recovers HP, and applies CC'd.",
      },
      {
        id: 'escalate',
        label: 'Escalation Script',
        summary: "Trades tempo for safer pressure, especially against CC'd targets.",
      },
      {
        id: 'stabilize',
        label: 'Call Recovery',
        summary: "Big sustain that improves further against CC'd targets.",
      },
      {
        id: 'dodge',
        label: 'De-escalate Caller',
        summary: "Sidesteps the next hit and gets even safer against CC'd targets.",
      },
    ],
  },
  'sales-rep': {
    classId: 'sales-rep',
    actions: [
      {
        id: 'patch',
        label: 'Warm Lead',
        summary: 'Cashes out extra damage on already Escalated targets.',
      },
      {
        id: 'escalate',
        label: 'Hard Close',
        summary: 'Applies Escalated and spikes hard against hot targets.',
      },
      {
        id: 'stabilize',
        label: 'Reset The Pitch',
        summary: 'Buys breathing room and still chips Escalated targets.',
      },
      {
        id: 'dodge',
        label: 'Side-Step Objection',
        summary: 'A tempo dodge that punishes already Escalated targets instead of eating the full counter.',
      },
    ],
  },
  intern: {
    classId: 'intern',
    actions: [
      {
        id: 'patch',
        label: 'Ask For Help',
        summary: 'Deals modest damage and recovers a little accidental HP.',
      },
      {
        id: 'escalate',
        label: 'Touch Everything',
        summary: 'Wild pressure that scales deeper into the fight and hurts more on the way out.',
      },
      {
        id: 'stabilize',
        label: 'Steal Breakroom Coffee',
        summary: 'Stabilizes harder when things get dire and pushes Burnout onto the enemy.',
      },
      {
        id: 'dodge',
        label: 'Trip Over Success',
        summary: 'A frantic near-miss that clips the enemy anyway and buys a little accidental recovery.',
      },
    ],
  },
  paralegal: {
    classId: 'paralegal',
    actions: [
      {
        id: 'patch',
        label: 'Redline Clause',
        summary: 'Punishes Micromanaged or On Hold enemies for precision damage.',
      },
      {
        id: 'escalate',
        label: 'Discovery Demand',
        summary: 'Hits harder and safer when the target is already compromised.',
      },
      {
        id: 'stabilize',
        label: 'File Injunction',
        summary: 'Recovers HP while locking the enemy On Hold.',
      },
      {
        id: 'dodge',
        label: 'Procedural Sidestep',
        summary: 'Cuts retaliation sharply and hits harder when the target is already compromised.',
      },
    ],
  },
};

const fallbackActionKit: ClassActionKit = {
  classId: 'it-support',
  actions: classActionKits['it-support'].actions,
};

export function getClassActionKit(classId: string) {
  return classActionKits[classId] ?? fallbackActionKit;
}

export function getClassActionPreview(classId: string, actionId: CombatActionId) {
  return (
    getClassActionKit(classId).actions.find((action) => action.id === actionId) ??
    fallbackActionKit.actions.find((action) => action.id === actionId) ??
    null
  );
}
