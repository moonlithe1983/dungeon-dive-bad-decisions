import { getCompanionDefinition } from '@/src/content/companions';
import type { EventCompanionMoment } from '@/src/types/event';

type EventBanterFlavor = {
  subject: string;
  threat: string;
  strategy: string;
};

type CompanionBanterRole = 'active' | 'reserve';
type BondNarrativeTier = 'low' | 'trusted' | 'devoted';

const defaultFlavor: EventBanterFlavor = {
  subject: 'this office disaster',
  threat: 'it gets formalized into something worse',
  strategy: 'move before anyone names it a process',
};

const eventBanterFlavorById: Record<string, EventBanterFlavor> = {
  'unsafe-team-building': {
    subject: 'this team-building ambush',
    threat: 'mandatory fun mutates into policy',
    strategy: 'keep moving before anyone assigns partners',
  },
  'mandatory-feedback-loop': {
    subject: 'this feedback loop',
    threat: 'the argument keeps feeding itself',
    strategy: 'never answer the second question honestly',
  },
  'suspicious-elevator-pitch': {
    subject: 'this elevator pitch',
    threat: 'a shortcut arrives with teeth',
    strategy: 'let them talk until the catch shows itself',
  },
  'fire-drill-evangelism': {
    subject: 'this fire-drill sermon',
    threat: 'panic gets turned into a metric',
    strategy: 'stay near the exits and never volunteer',
  },
  'shadow-it-market': {
    subject: 'this shadow market',
    threat: 'every bargain leaves a trace',
    strategy: 'buy fast and keep your name off the ledger',
  },
  'expense-report-exorcism': {
    subject: 'this reimbursement haunting',
    threat: 'finance paperwork bites back',
    strategy: 'do not sign anything that smells like brimstone',
  },
  'all-hands-mutiny': {
    subject: 'this all-hands mutiny',
    threat: 'the room decides it has a new agenda',
    strategy: 'keep your head down until the projector breaks',
  },
  'breakroom-whistleblower': {
    subject: 'this breakroom whistleblower mess',
    threat: 'the evidence gets rewritten before we leave',
    strategy: 'take the proof and the snacks before HR discovers both are missing',
  },
  'trust-fall-incident-report': {
    subject: 'this trust-fall liability crater',
    threat: 'the waiver stack becomes official history',
    strategy: 'move fast and never stand where the facilitator points',
  },
  'golden-parachute-auction': {
    subject: 'this golden parachute auction',
    threat: 'executive access control notices us by name',
    strategy: 'skim the luxury panic budget and never make eye contact with the brass',
  },
};

function getBondNarrativeTier(bondLevel: number): BondNarrativeTier {
  if (bondLevel >= 5) {
    return 'devoted';
  }

  if (bondLevel >= 3) {
    return 'trusted';
  }

  return 'low';
}

function getHeadline(role: CompanionBanterRole, bondLevel: number) {
  const trustLabel =
    bondLevel >= 5 ? 'Bond 5' : bondLevel >= 3 ? 'Bond 3+' : `Bond ${bondLevel}`;

  return `${role === 'active' ? 'Lead Read' : 'Reserve Read'} - ${trustLabel}`;
}

function getFormerExecutiveAssistantLine(
  role: CompanionBanterRole,
  tier: BondNarrativeTier,
  flavor: EventBanterFlavor
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `Stay close. I can hear the moment ${flavor.threat}, and I am not letting it land on you first.`;
    }

    if (tier === 'trusted') {
      return `I know this kind of room. Stay with me and I can read where ${flavor.threat}.`;
    }

    return `${flavor.subject} has executive fingerprints all over it. ${flavor.strategy}.`;
  }

  if (tier === 'devoted') {
    return `If ${flavor.subject} curdles into policy, swap me in. I will tear the agenda apart for you.`;
  }

  if (tier === 'trusted') {
    return `Tag me the second ${flavor.threat}. I know how these people weaponize calendars.`;
  }

  return `If this turns into a meeting, pull me in. I know the type.`;
}

function getFacilitiesGoblinLine(
  role: CompanionBanterRole,
  tier: BondNarrativeTier,
  flavor: EventBanterFlavor
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `Stick with me. I know where ${flavor.subject} connects to the walls, and that means I know how it fails.`;
    }

    if (tier === 'trusted') {
      return `I can route us through this. Just keep people away from the load-bearing nonsense.`;
    }

    return `${flavor.subject} is a maintenance hazard. ${flavor.strategy}.`;
  }

  if (tier === 'devoted') {
    return `If this collapses, swap me in. I already know which panels to kick and which vents still love us.`;
  }

  if (tier === 'trusted') {
    return `Tag me if the structure gets weird. I brought tools and bad ideas.`;
  }

  return `I can cover the ugly part if you need a fast rotation.`;
}

function getSecuritySkeletonLine(
  role: CompanionBanterRole,
  tier: BondNarrativeTier,
  flavor: EventBanterFlavor
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `Stay behind my shoulder. If ${flavor.threat}, I will be between it and you.`;
    }

    if (tier === 'trusted') {
      return `Understood. I will treat ${flavor.subject} as a live security incident.`;
    }

    return `${flavor.subject} violates at least three policies. ${flavor.strategy}.`;
  }

  if (tier === 'devoted') {
    return `Swap me in if this escalates. I have already prioritized your extraction over the room.`;
  }

  if (tier === 'trusted') {
    return `Tag me if crowd control becomes necessary. I am already annoyed on your behalf.`;
  }

  return `If you need a cleaner line, I can take over.`;
}

function getPossessedCopierLine(
  role: CompanionBanterRole,
  tier: BondNarrativeTier,
  flavor: EventBanterFlavor
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `The copier spits out a warm page: "PRIMARY USER WARNING: ${flavor.subject.toUpperCase()} IS A BAD COPY. PROTECTING YOU."`;
    }

    if (tier === 'trusted') {
      return `The copier chatters and prints: "${flavor.subject.toUpperCase()}. SUGGESTED RESPONSE: CHAOS."`;
    }

    return `A sheet slides out reading: "CAUTION: ${flavor.subject.toUpperCase()}."`;
  }

  if (tier === 'devoted') {
    return `The reserve tray rattles: "SWAP ME IN. I CAN MAKE THIS WORSE FOR THEM."`;
  }

  if (tier === 'trusted') {
    return `The copier hums from the backline like it is ready to duplicate the problem.`;
  }

  return `The copier makes an interested noise. That is not reassuring.`;
}

function getDisillusionedTempLine(
  role: CompanionBanterRole,
  tier: BondNarrativeTier,
  flavor: EventBanterFlavor
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `I hate ${flavor.subject}, but I hate the idea of it chewing through you more. So yes, I am locked in.`;
    }

    if (tier === 'trusted') {
      return `Fine. We do ${flavor.subject} your way, and if ${flavor.threat}, I am helping you torch it.`;
    }

    return `${flavor.subject} is exactly why I should have quit. ${flavor.strategy}.`;
  }

  if (tier === 'devoted') {
    return `If this gets uglier, swap me in. Apparently I am staying for your disasters now.`;
  }

  if (tier === 'trusted') {
    return `Tag me if you need somebody sarcastic enough to survive this room.`;
  }

  return `I can take the next shift if you want out of this mess.`;
}

function getFallbackLine(
  role: CompanionBanterRole,
  tier: BondNarrativeTier,
  flavor: EventBanterFlavor
) {
  if (role === 'active') {
    if (tier === 'devoted') {
      return `I am with you. If ${flavor.threat}, we break it together.`;
    }

    if (tier === 'trusted') {
      return `We can handle ${flavor.subject}. ${flavor.strategy}.`;
    }

    return `${flavor.subject} feels dangerous. ${flavor.strategy}.`;
  }

  if (tier === 'devoted') {
    return `Swap me in if you need help. I am not letting this room take you alone.`;
  }

  if (tier === 'trusted') {
    return `Tag me if the line breaks. I can help stabilize it.`;
  }

  return `I can cover the backline if this turns uglier.`;
}

function getCompanionBanterLine(input: {
  companionId: string;
  role: CompanionBanterRole;
  bondLevel: number;
  eventId: string;
}) {
  const flavor = eventBanterFlavorById[input.eventId] ?? defaultFlavor;
  const tier = getBondNarrativeTier(input.bondLevel);

  if (input.companionId === 'former-executive-assistant') {
    return getFormerExecutiveAssistantLine(input.role, tier, flavor);
  }

  if (input.companionId === 'facilities-goblin') {
    return getFacilitiesGoblinLine(input.role, tier, flavor);
  }

  if (input.companionId === 'security-skeleton') {
    return getSecuritySkeletonLine(input.role, tier, flavor);
  }

  if (input.companionId === 'possessed-copier') {
    return getPossessedCopierLine(input.role, tier, flavor);
  }

  if (input.companionId === 'disillusioned-temp') {
    return getDisillusionedTempLine(input.role, tier, flavor);
  }

  return getFallbackLine(input.role, tier, flavor);
}

export function createEventCompanionMoments(input: {
  eventId: string;
  activeCompanionId: string;
  reserveCompanionId: string;
  companionBondLevels: Record<string, number>;
}): EventCompanionMoment[] {
  const entries: {
    companionId: string;
    role: CompanionBanterRole;
  }[] = [
    {
      companionId: input.activeCompanionId,
      role: 'active',
    },
    {
      companionId: input.reserveCompanionId,
      role: 'reserve',
    },
  ];

  return entries.map(({ companionId, role }) => {
    const companionName =
      getCompanionDefinition(companionId)?.name ?? companionId;
    const bondLevel = Math.max(
      1,
      Math.floor(input.companionBondLevels[companionId] ?? 1)
    );

    return {
      companionId,
      companionName,
      role,
      bondLevel,
      headline: getHeadline(role, bondLevel),
      line: getCompanionBanterLine({
        companionId,
        role,
        bondLevel,
        eventId: input.eventId,
      }),
    };
  });
}
