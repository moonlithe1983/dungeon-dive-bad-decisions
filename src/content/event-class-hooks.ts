import { getClassDefinition } from '@/src/content/classes';
import { COMPANY_NAME, getClassNarrative } from '@/src/content/company-lore';

type EventClassFlavor = {
  subject: string;
  exploit: string;
  risk: string;
};

type EventClassChoiceBonus = {
  choiceId: string;
  label: string;
  metaCurrencyDelta?: number;
  runHealingDelta?: number;
  runDamageDelta?: number;
  outcomeSuffix: string;
};

const defaultFlavor: EventClassFlavor = {
  subject: 'this office disaster',
  exploit: 'turn the mess into a cleaner advantage',
  risk: 'the room calcifies into a worse policy',
};

const eventClassFlavorById: Record<string, EventClassFlavor> = {
  'unsafe-team-building': {
    subject: 'this team-building ambush',
    exploit: 'turn the trust exercise into leverage',
    risk: 'mandatory fun hardens into process',
  },
  'mandatory-feedback-loop': {
    subject: 'this feedback spiral',
    exploit: 'pull a useful angle out of the noise',
    risk: 'the argument becomes a permanent ritual',
  },
  'suspicious-elevator-pitch': {
    subject: 'this elevator ambush',
    exploit: 'take the upside without swallowing the whole trap',
    risk: 'the fine print bites on the way out',
  },
  'fire-drill-evangelism': {
    subject: 'this evacuation sermon',
    exploit: 'reroute the panic into something survivable',
    risk: 'the stampede turns into a metric',
  },
  'shadow-it-market': {
    subject: 'this shadow market',
    exploit: 'extract value before the ledger notices you',
    risk: 'the bargain leaves a very trackable curse',
  },
  'expense-report-exorcism': {
    subject: 'this reimbursement haunting',
    exploit: 'pin the blame to the paperwork instead of the team',
    risk: 'finance turns the ritual into precedent',
  },
  'all-hands-mutiny': {
    subject: 'this all-hands collapse',
    exploit: 'find the opening while the room is still yelling',
    risk: 'the crowd chooses a worse leader and keeps going',
  },
  'breakroom-whistleblower': {
    subject: 'this breakroom whistleblower mess',
    exploit: 'turn the evidence and snacks into leverage before HR arrives',
    risk: 'the cover-up rewrites itself around you',
  },
  'trust-fall-incident-report': {
    subject: 'this trust-fall liability crater',
    exploit: 'move the blame into a safer lane and take the payout',
    risk: 'the waiver stack becomes doctrine',
  },
  'golden-parachute-auction': {
    subject: 'this severance auction',
    exploit: 'skim the elite panic budget before the room re-locks itself',
    risk: 'executive access control notices you personally',
  },
};

const eventClassChoiceBonuses: Record<string, Record<string, EventClassChoiceBonus>> = {
  'unsafe-team-building': {
    'it-support': {
      choiceId: 'document-liability',
      label: 'IT triage converts the retreat into usable incident paperwork.',
      metaCurrencyDelta: 2,
      runHealingDelta: 2,
      outcomeSuffix:
        'You also file the whole exercise as a preventable systems failure and profit accordingly.',
    },
    'customer-service-rep': {
      choiceId: 'loot-welcome-bag',
      label: 'Frontline instincts squeeze extra recovery out of the morale junk.',
      runHealingDelta: 2,
      outcomeSuffix:
        'You salvage the only supplies in the room that feel remotely humane.',
    },
    'sales-rep': {
      choiceId: 'voluntell-reserve',
      label: 'You spin the handoff into a cleaner leverage play.',
      metaCurrencyDelta: 3,
      outcomeSuffix:
        'Somehow the reset also comes with a measurable upside for you.',
    },
    intern: {
      choiceId: 'loot-welcome-bag',
      label: 'You accidentally find one more useful thing in the swag pile.',
      metaCurrencyDelta: 1,
      runHealingDelta: 1,
      outcomeSuffix:
        'Nobody knows how you did that, including you.',
    },
    paralegal: {
      choiceId: 'document-liability',
      label: 'Your notes come out precise, admissible, and extremely expensive.',
      metaCurrencyDelta: 4,
      outcomeSuffix:
        'The legal exposure is so obvious that it pays immediately.',
    },
  },
  'mandatory-feedback-loop': {
    'it-support': {
      choiceId: 'accept-the-notes',
      label: 'You isolate the real bug report under the emotional debris.',
      runHealingDelta: 2,
      outcomeSuffix:
        'Once the noise drops away, one fix actually helps.',
    },
    'customer-service-rep': {
      choiceId: 'accept-the-notes',
      label: 'You absorb the tone without taking the full hit.',
      runHealingDelta: 3,
      outcomeSuffix:
        'You have survived worse callers than this hallway.',
    },
    'sales-rep': {
      choiceId: 'weaponize-feedback',
      label: 'You upsell the argument into extra margin.',
      metaCurrencyDelta: 3,
      outcomeSuffix:
        'By the end, the room is somehow paying to keep talking.',
    },
    intern: {
      choiceId: 'cc-the-reserve',
      label: 'The thread spirals just enough to open a weird advantage.',
      metaCurrencyDelta: 2,
      outcomeSuffix:
        'The chaos should not have helped, but it absolutely did.',
    },
    paralegal: {
      choiceId: 'weaponize-feedback',
      label: 'You catch the contradiction and invoice it.',
      metaCurrencyDelta: 2,
      runDamageDelta: -1,
      outcomeSuffix:
        'The record turns in your favor before the stress bill fully lands.',
    },
  },
  'suspicious-elevator-pitch': {
    'it-support': {
      choiceId: 'sign-the-addendum',
      label: 'You strip out the worst technical clause before signing.',
      runDamageDelta: -2,
      outcomeSuffix:
        'At least the hardware no longer threatens to immediately combust.',
    },
    'customer-service-rep': {
      choiceId: 'let-companion-stall',
      label: 'You turn the stall into actual breathing room.',
      runHealingDelta: 2,
      outcomeSuffix:
        'The borrowed time is just enough to feel human again.',
    },
    'sales-rep': {
      choiceId: 'demand-upfront-bribe',
      label: 'You can smell commission under the cologne.',
      metaCurrencyDelta: 4,
      outcomeSuffix:
        'The stranger mistakes your greed for professionalism and pays accordingly.',
    },
    intern: {
      choiceId: 'sign-the-addendum',
      label: 'The terrible pitch accidentally teaches you a worse trick.',
      metaCurrencyDelta: 2,
      outcomeSuffix:
        'You leave with both contraband and an alarming new idea.',
    },
    paralegal: {
      choiceId: 'sign-the-addendum',
      label: 'You redline the contract before it bites back.',
      metaCurrencyDelta: 2,
      runDamageDelta: -2,
      outcomeSuffix:
        'The fine print still hurts, just far less than it planned to.',
    },
  },
  'fire-drill-evangelism': {
    'it-support': {
      choiceId: 'fake-the-all-clear',
      label: 'You know exactly which system to spoof and which one to ignore.',
      metaCurrencyDelta: 2,
      runDamageDelta: -2,
      outcomeSuffix:
        'The override works because you only break the correct parts.',
    },
    'customer-service-rep': {
      choiceId: 'appoint-a-fire-marshal',
      label: 'You keep everyone just calm enough for the handoff to work.',
      runHealingDelta: 2,
      outcomeSuffix:
        'The crowd remains unbearable, but no longer quite as lethal.',
    },
    'sales-rep': {
      choiceId: 'fake-the-all-clear',
      label: 'You monetize the panic on the way to the exits.',
      metaCurrencyDelta: 3,
      outcomeSuffix:
        'There is a brief, terrible moment where the chaos feels like a funnel.',
    },
    intern: {
      choiceId: 'loot-the-muster-crate',
      label: 'You somehow walk away with extra salvage and a pulse.',
      metaCurrencyDelta: 1,
      runHealingDelta: 1,
      outcomeSuffix:
        'The crate had one more useful thing wedged under the tape.',
    },
    paralegal: {
      choiceId: 'appoint-a-fire-marshal',
      label: 'You make the temporary appointment sound binding.',
      metaCurrencyDelta: 2,
      outcomeSuffix:
        'The authority vacuum closes in your favor immediately.',
    },
  },
  'shadow-it-market': {
    'it-support': {
      choiceId: 'buy-the-prototype',
      label: 'You identify the one component most likely to explode.',
      runDamageDelta: -1,
      outcomeSuffix:
        'The device remains cursed, just less catastrophically so.',
    },
    'customer-service-rep': {
      choiceId: 'let-the-reserve-haggle',
      label: 'You use the reset to actually stabilize.',
      runHealingDelta: 2,
      outcomeSuffix:
        'For once, the breathing room is real and not just corporate wording.',
    },
    'sales-rep': {
      choiceId: 'broker-a-resale-cut',
      label: 'You hear margin in every whispered offer.',
      metaCurrencyDelta: 4,
      outcomeSuffix:
        'The black-market vendors leave convinced you improved the deal for them.',
    },
    intern: {
      choiceId: 'buy-the-prototype',
      label: 'You improvise an upside out of the sketchy tech.',
      metaCurrencyDelta: 2,
      outcomeSuffix:
        'The prototype still feels illegal, but now also lucky.',
    },
    paralegal: {
      choiceId: 'broker-a-resale-cut',
      label: 'You tighten the terms until the gray market starts sweating.',
      metaCurrencyDelta: 2,
      runHealingDelta: 1,
      outcomeSuffix:
        'The contract language is cleaner than the bazaar deserves.',
    },
  },
  'expense-report-exorcism': {
    'it-support': {
      choiceId: 'audit-the-possession',
      label: 'You treat the haunting like broken tooling and it responds.',
      runHealingDelta: 2,
      outcomeSuffix:
        'It turns out even demons hate a well-run troubleshooting pass.',
    },
    'customer-service-rep': {
      choiceId: 'delegate-the-summons',
      label: 'You keep the ritual from emotionally flattening the team.',
      runHealingDelta: 2,
      outcomeSuffix:
        'The handoff lands softer because you have done worse transfers than this.',
    },
    'sales-rep': {
      choiceId: 'feed-it-receipts',
      label: 'You spot the resale angle in the cursed output.',
      metaCurrencyDelta: 3,
      outcomeSuffix:
        'If the artifact is going to exist, it may as well have margin.',
    },
    intern: {
      choiceId: 'feed-it-receipts',
      label: 'You learn the wrong lesson and benefit anyway.',
      metaCurrencyDelta: 1,
      runHealingDelta: 1,
      outcomeSuffix:
        'The room is horrified at how well that worked for you.',
    },
    paralegal: {
      choiceId: 'audit-the-possession',
      label: 'You pin the blame to the paperwork with surgical precision.',
      metaCurrencyDelta: 4,
      outcomeSuffix:
        'The reimbursement clears because nobody wants to contest your version of events.',
    },
  },
  'all-hands-mutiny': {
    'it-support': {
      choiceId: 'loot-the-swag-table',
      label: 'You salvage the only useful supplies before the room notices.',
      runHealingDelta: 2,
      outcomeSuffix:
        'Buried under the branded nonsense is something genuinely stabilizing.',
    },
    'customer-service-rep': {
      choiceId: 'seize-the-mic',
      label: 'You hold the room together just long enough to get paid.',
      metaCurrencyDelta: 2,
      runDamageDelta: -1,
      outcomeSuffix:
        'You know exactly how to sound calm while everything burns.',
    },
    'sales-rep': {
      choiceId: 'seize-the-mic',
      label: 'You turn the rebellion into a closing opportunity.',
      metaCurrencyDelta: 4,
      outcomeSuffix:
        'For one shining minute, the mutiny looks like a pipeline.',
    },
    intern: {
      choiceId: 'push-the-reserve-onstage',
      label: 'The chaos somehow leaves you with extra leverage.',
      metaCurrencyDelta: 2,
      outcomeSuffix:
        'Nobody can explain why that gambit worked, least of all you.',
    },
    paralegal: {
      choiceId: 'seize-the-mic',
      label: 'You spot the opening statement and bury the rebuttal.',
      metaCurrencyDelta: 3,
      runDamageDelta: -1,
      outcomeSuffix:
        'The room thinks you are improvising. You know better.',
    },
  },
  'breakroom-whistleblower': {
    'it-support': {
      choiceId: 'raid-the-fridge-file',
      label: 'You trace the evidence chain before the appliances corrupt it.',
      metaCurrencyDelta: 2,
      runHealingDelta: 1,
      outcomeSuffix:
        'The refrigerator stops being a mystery and becomes a clean incident response job.',
    },
    'customer-service-rep': {
      choiceId: 'take-the-severance-lunch',
      label: 'You salvage the calmest possible recovery out of the breakroom wreckage.',
      runHealingDelta: 2,
      outcomeSuffix:
        'The premium lunch somehow lands like actual care for once.',
    },
    'sales-rep': {
      choiceId: 'raid-the-fridge-file',
      label: 'You can smell settlement money under the yogurt rot.',
      metaCurrencyDelta: 4,
      outcomeSuffix:
        'The leverage package gets monetized before anyone can call it ethics.',
    },
    intern: {
      choiceId: 'take-the-severance-lunch',
      label: 'You accidentally find one more useful stash behind the apology snacks.',
      metaCurrencyDelta: 1,
      runHealingDelta: 1,
      outcomeSuffix:
        'Nobody can explain why the cursed lunch likes you.',
    },
    paralegal: {
      choiceId: 'raid-the-fridge-file',
      label: 'You chain the evidence to liability so tightly it starts paying out on contact.',
      metaCurrencyDelta: 4,
      outcomeSuffix:
        'The documentation is so clean that the hush money becomes procedural.',
    },
  },
  'trust-fall-incident-report': {
    'it-support': {
      choiceId: 'loot-the-waiver-box',
      label: 'You strip the trap out of the gear before it hurts quite as much.',
      runDamageDelta: -1,
      outcomeSuffix:
        'The retreat hardware still hates you, just less successfully.',
    },
    'customer-service-rep': {
      choiceId: 'appoint-a-fall-guy',
      label: 'You sell the handoff so gently that the room softens around it.',
      runHealingDelta: 2,
      outcomeSuffix:
        'For a brief moment, reassignment feels almost humane.',
    },
    'sales-rep': {
      choiceId: 'rewrite-the-liability',
      label: 'You convert pure retreat guilt into immediate payout language.',
      metaCurrencyDelta: 3,
      outcomeSuffix:
        'The legal exposure reads like upside if you pitch it fast enough.',
    },
    intern: {
      choiceId: 'loot-the-waiver-box',
      label: 'You come away with more salvage than anyone expected from that bad idea.',
      metaCurrencyDelta: 2,
      outcomeSuffix:
        'The splinters were worth it, which is not a reassuring lesson.',
    },
    paralegal: {
      choiceId: 'rewrite-the-liability',
      label: 'You draft the report so precisely that the payout becomes unavoidable.',
      metaCurrencyDelta: 4,
      outcomeSuffix:
        'Nobody in legal wants to see your annotated version of events again.',
    },
  },
  'golden-parachute-auction': {
    'it-support': {
      choiceId: 'steal-the-emergency-perks',
      label: 'You know which executive support kit actually works and which one is branding theater.',
      runHealingDelta: 1,
      outcomeSuffix:
        'The package ends up cleaner, safer, and much more useful to an actual survivor.',
    },
    'customer-service-rep': {
      choiceId: 'nominate-the-reserve-bidder',
      label: 'You make the handoff feel intentional enough to keep the room from mauling you.',
      runHealingDelta: 2,
      outcomeSuffix:
        'The rotation lands with a little grace, which this floor absolutely did not deserve.',
    },
    'sales-rep': {
      choiceId: 'skim-the-payout-table',
      label: 'You recognize a luxury exit package the way sharks recognize blood.',
      metaCurrencyDelta: 4,
      outcomeSuffix:
        'The skim gets uglier, richer, and somehow more professional-looking.',
    },
    intern: {
      choiceId: 'steal-the-emergency-perks',
      label: 'You should not understand executive panic kits, but apparently you do now.',
      metaCurrencyDelta: 2,
      outcomeSuffix:
        'The premium stash teaches you the wrong lesson and pays for it too.',
    },
    paralegal: {
      choiceId: 'skim-the-payout-table',
      label: 'You spot the clause nobody meant to leave exposed and bill it immediately.',
      metaCurrencyDelta: 3,
      runDamageDelta: -1,
      outcomeSuffix:
        'The executive paperwork still bites, just not hard enough to win.',
    },
  },
};

function getEventClassFlavor(eventId: string) {
  return eventClassFlavorById[eventId] ?? defaultFlavor;
}

export function createEventClassMoment(eventId: string, classId: string) {
  const className = getClassDefinition(classId)?.name ?? classId;
  const flavor = getEventClassFlavor(eventId);
  const narrative = getClassNarrative(classId);

  if (classId === 'it-support') {
    return {
      classId,
      className,
      headline: 'Systems Read',
      line: `${flavor.subject} is broken process in costume. If I can ${flavor.exploit}, keep the fix inside approved change language, and move before ${flavor.risk}, ${COMPANY_NAME} might stay online long enough for me to keep my badge.`,
    };
  }

  if (classId === 'customer-service-rep') {
    return {
      classId,
      className,
      headline: 'Frontline Read',
      line: `I can keep the room stable long enough to ${flavor.exploit}, but only if ${flavor.risk} does not land all at once and leadership still believes the save sounds brand-safe.`,
    };
  }

  if (classId === 'sales-rep') {
    return {
      classId,
      className,
      headline: 'Closer Read',
      line: `There is leverage buried inside ${flavor.subject}. Push at the right moment, make it smell executive-approved, and you can ${flavor.exploit} before ${flavor.risk} kills the quarter and your commission with it.`,
    };
  }

  if (classId === 'intern') {
    return {
      classId,
      className,
      headline: 'Improvised Read',
      line: `I do not fully understand ${flavor.subject}, which honestly means I might ${flavor.exploit} before ${flavor.risk} and accidentally save the company in a way leadership can still pretend was supervised.`,
    };
  }

  if (classId === 'paralegal') {
    return {
      classId,
      className,
      headline: 'Case Read',
      line: `The room already left openings. I can ${flavor.exploit}, keep the record admissible, and pin the damage there before ${flavor.risk} rewrites the facts for the people who caused it.`,
    };
  }

  return {
    classId,
    className,
    headline: 'Class Read',
    line: `${flavor.subject} has an angle. ${narrative.approvalConstraint} Find it before ${flavor.risk}.`,
  };
}

export function getEventClassChoiceBonus(eventId: string, classId: string, choiceId: string) {
  const bonus = eventClassChoiceBonuses[eventId]?.[classId] ?? null;

  if (!bonus || bonus.choiceId !== choiceId) {
    return null;
  }

  return bonus;
}
