import type { CombatState } from '@/src/types/combat';

type AuthoredCodexCard = {
  unlockBlurb: string;
  codexBody: string;
  expandedEntry: string;
  firstSeenLine: string;
  optionalUnlockFlavor?: string;
};

type EarlyFloorBeat = {
  title: string;
  summary: string;
};

type PartySceneLine = {
  speakerId: string;
  speakerName: string;
  text: string;
};

type PartyScene = {
  title: string;
  lines: PartySceneLine[];
};

type RewardPackagePitch = {
  name: string;
  description: string;
};

type EventChoiceCopy = {
  label: string;
  description: string;
  outcomeText: string;
};

type AuthoredEventOverlay = {
  title: string;
  description: string;
  choices: Record<string, EventChoiceCopy>;
};

const classCodexCards: Partial<Record<string, AuthoredCodexCard>> = {
  'it-support': {
    unlockBlurb:
      'Assigned to keep broken systems alive. Learns fast where to hurt them.',
    codexBody:
      'IT Support is the default starting role: the overqualified fixer shoved into impossible conditions and blamed when infrastructure behaves honestly. The class reroutes hostile systems, strips bad statuses, and turns technical fragility into leverage.',
    expandedEntry:
      'IT Support begins as the role Meridian thinks is safest to assign: useful, overburdened, and expected to stabilize crises without asking who caused them. That makes it the perfect opening class for Meridian Spire. The player starts close enough to the building logic to understand that nothing here is truly seamless; every process depends on something old, brittle, overheating, underdocumented, or one bad decision away from collapse. In combat terms, IT Support should feel like controlled interference. In lore terms, it is the first role that learns a simple truth: a system built on constant patching can be interrupted just as easily as it can be maintained.',
    firstSeenLine:
      'Assigned role: IT Support. Please resolve conditions outside your authority.',
    optionalUnlockFlavor: 'Default access. Default blame. Useful either way.',
  },
  'customer-service-rep': {
    unlockBlurb:
      'Keeps the room from breaking all at once, then sends the pressure back where it belongs.',
    codexBody:
      'Customer Service survives impossible demands, steadies the room, and turns institutional abuse into a form of tactical endurance.',
    expandedEntry:
      'This role spent years absorbing fury while executives promised impossible outcomes on its behalf. In Meridian Spire, that means de-escalating panic, surviving the tone damage, and discovering that patience can become retaliation when the building finally stops pretending to be neutral.',
    firstSeenLine:
      'Please hold for a representative with a much lower tolerance for nonsense.',
    optionalUnlockFlavor: 'Courtesy script. Brass knuckles underneath.',
  },
  'sales-rep': {
    unlockBlurb:
      'Turns ugly openings into revenue-grade violence and cashes out on risk.',
    codexBody:
      'Sales Rep reads leverage through smoke, lies, and executive deodorant, then turns momentum into damage before the room can call it reckless.',
    expandedEntry:
      'Meridian taught this role to close impossible deals and smile through the fine print. Inside the Spire, that instinct becomes predatory tempo: find the opening, push first, and make each win look expensive enough that leadership mistakes it for strategy.',
    firstSeenLine:
      'If leadership wanted a softer close, they should have offered one.',
    optionalUnlockFlavor: 'Quarter-end instincts. Monster-proof grin.',
  },
  intern: {
    unlockBlurb:
      'Disposable on paper. Alarmingly scalable in practice.',
    codexBody:
      'Intern begins as the least protected person in the company and ends up surviving on audacity, bad luck management, and the occasional illegal miracle.',
    expandedEntry:
      'Meridian handed this role a badge, a half-charged laptop, and just enough responsibility to become legally interesting. That is exactly why the class works: it learns faster than it is supposed to, survives longer than anyone budgeted for, and turns being underestimated into a combat style.',
    firstSeenLine:
      'Stretch assignment received. Casualty projections omitted.',
    optionalUnlockFlavor: 'Entry level. Exit velocity.',
  },
  paralegal: {
    unlockBlurb:
      'Reads the clause, finds the breach, and bills the room for the privilege.',
    codexBody:
      'Paralegal marks violations, punishes bad language, and turns exact timing into institutional damage.',
    expandedEntry:
      'This role actually read the merger packet, which means it knew Meridian would become a crime scene months before the walls learned how to scream. In combat, that translates into precision, traps, and consequences delivered with clean records and worse intent.',
    firstSeenLine:
      'Your exception request has been denied. Your violation has not.',
    optionalUnlockFlavor: 'Procedure only sounds boring until it starts hunting.',
  },
};

const companionCodexCards: Partial<Record<string, AuthoredCodexCard>> = {
  'facilities-goblin': {
    unlockBlurb: 'If it leaks, sparks, or screams, they know why.',
    codexBody:
      'Facilities Goblin lives in crawlspaces, speaks fluent infrastructure, and trusts broken machinery more than most people. They know which doors stick, which vents gossip, and which parts of Meridian Spire are only pretending to be load-bearing.',
    expandedEntry:
      'Nobody agrees on where Facilities Goblin came from. Some say maintenance. Some say contractor. Some say they have always belonged to the walls in the same way mold, wiring, and emergency dust belong to the walls. What matters is simpler: they understand the building as a living problem. Every hiss in a pipe, every hot cable smell, every jammed service hatch and flickering light means something to them. They scavenge, patch, sabotage, reroute, and improvise with the conviction of someone who learned a long time ago that official support never arrives before the damage does.',
    firstSeenLine:
      'Good news. This floor is unstable. That means it still has options.',
    optionalUnlockFlavor:
      'Recovered from inside the walls, where all useful secrets eventually end up.',
  },
  'former-executive-assistant': {
    unlockBlurb:
      'Knows the calendars, euphemisms, and quiet panic behind every polished lie.',
    codexBody:
      'Former Executive Assistant kept Crown Meridian upper floors running before Everrise made the company honest. She knows the private panic behind public statements and exactly how much cruelty fits inside the phrase priority alignment.',
    expandedEntry:
      'Before Meridian Spire became physically impossible, she was already living inside softer impossibilities: impossible calendars, impossible demands, and impossible requests framed as normal because they came from people with titles long enough to function as threats. She is precise because sloppiness was never survivable. She is controlled because anger had to hide to stay useful. Once Everrise stripped the company down to appetite, usefulness stopped feeling like virtue.',
    firstSeenLine:
      'If Meridian called this an opportunity, somebody important already knew it would kill people.',
    optionalUnlockFlavor: 'Formerly indispensable. Currently unmanageable.',
  },
  'security-skeleton': {
    unlockBlurb:
      'The building still honors his badge after forgetting the rest of him.',
    codexBody:
      'Security Skeleton is a former guard the building still recognizes. His badge permissions outlived his pulse, and Meridian emergency protocols continue to treat him like an asset, which is useful for the party and deeply revealing about the company.',
    expandedEntry:
      "Security Skeleton is what remains after institutional loyalty has been reduced to procedure. Elevators answer him. Locks hesitate around him. Some alarms lower their voices when he passes. Under the deadpan is a severe moral intelligence: if a system still wants to use your body after it has finished with your life, you are no longer obligated to respect that system's rules.",
    firstSeenLine:
      'Remain calm. If that proves impossible, remain useful.',
    optionalUnlockFlavor:
      'Meridian kept his clearance longer than it kept his name.',
  },
};

const earlyFloorBeats: Record<number, EarlyFloorBeat> = {
  1: {
    title: 'Welcome to Meridian Spire',
    summary:
      'A launch-night game show built by HR and lit by a dying sun. Warm employee badges do not match the people wearing them.',
  },
  2: {
    title: 'Audience Participation',
    summary:
      'Doors unlock when the building hears enough applause. The Spire is teaching itself what people will agree to if it is called a contest.',
  },
  3: {
    title: 'Performance Improvement Round',
    summary:
      'Rewards arrive attached to hidden deductions, debts, and body counts. The Spire does not want winners. It wants compliant participants.',
  },
};

const startingTrioSceneOrder = [
  'facilities-goblin',
  'former-executive-assistant',
  'security-skeleton',
];

const partyScenes: Record<string, PartyScene> = {
  'first-meeting': {
    title: 'Crew Chemistry',
    lines: [
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Good news. The pipes still scream, which means the floor is alive.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'That is not, under any recognized policy, good news.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'It is the best news this building usually offers.',
      },
    ],
  },
  'first-route-choice': {
    title: 'Crew Read',
    lines: [
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: "Left path says 'priority access.' Right path says 'surprise evaluation.'",
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Take the one with exposed wiring.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'At least that sign is being honest.',
      },
    ],
  },
  'battle-intro': {
    title: 'Crew Channel',
    lines: [
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Please remain calm. Panic creates paperwork.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Panic also creates openings.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: "Wonderful. We're workshopping a brand.",
      },
    ],
  },
  'suspicious-reward-screen': {
    title: 'Crew Read',
    lines: [
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'No legitimate benefits package glows.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Counterpoint: free stuff.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Counter-counterpoint: nothing in Meridian is free. Some of it is merely prepaid.',
      },
    ],
  },
  'creepy-event-prompt': {
    title: 'Crew Read',
    lines: [
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'I have guarded five executive floors and three mass apologies. This is worse.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Can I keep whatever jumps out?',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'Only if it is useful, deniable, or both.',
      },
    ],
  },
  'low-health': {
    title: 'Crew Channel',
    lines: [
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'You are not dying in front of middle management. That encourages them.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Hold still. I can make this survivable or interesting.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: "Aim for survivable. We've already had interesting.",
      },
    ],
  },
};

const rewardPackagePitches: Record<string, RewardPackagePitch> = {
  'expense-fraud': {
    name: 'Expense Account',
    description: 'More resources, better upgrades, richer run.',
  },
  'per-diem-skimming': {
    name: 'Expense Account',
    description: 'More resources, better upgrades, richer run.',
  },
  'black-card-overage': {
    name: 'Expense Account',
    description: 'More resources, better upgrades, richer run.',
  },
  'triage-cart': {
    name: 'Sick Leave',
    description: 'Recover, reset, survive bad floors.',
  },
  'wellness-cooler': {
    name: 'Sick Leave',
    description: 'Recover, reset, survive bad floors.',
  },
  'concierge-crash-cart': {
    name: 'Sick Leave',
    description: 'Recover, reset, survive bad floors.',
  },
  'contraband-locker': {
    name: 'Back Channel',
    description: 'Better setup, better flow, uglier tricks.',
  },
  'swag-bag-heist': {
    name: 'Lunch-and-Learn',
    description: 'Companion juice, synergy now, payoff later.',
  },
  'golden-parachute-cache': {
    name: 'Exit Package',
    description: 'Desperate power for low-health comebacks.',
  },
};

const eventOverlays: Partial<Record<string, AuthoredEventOverlay>> = {
  'unsafe-team-building': {
    title: 'Warm Badges',
    description:
      'A dispenser spits out fresh employee badges, all still warm. None of the names match the people in your party. The smiling screen above it thanks you for participating in accelerated career visibility.',
    choices: {
      'document-liability': {
        label: 'Take The Highest-Rank Badge',
        description: 'Claim access. Risk attention.',
        outcomeText:
          'You choose the badge with the highest title because Meridian still believes rank should open doors faster than truth. The scanner accepts you just long enough to be dangerous. Somewhere deeper in the building, something updates your file with interest.',
      },
      'loot-welcome-bag': {
        label: 'Sort Through Them Carefully',
        description: 'Play it safe. Look for a useful mismatch.',
        outcomeText:
          'You ignore the flattering titles and look for the least-wrong lie. The dispenser keeps spitting warm plastic while you search, as if the building is impatient for you to become someone easier to route. You leave with a badge that does not fit, but fits well enough to survive on.',
      },
      'voluntell-reserve': {
        label: 'Jam The Machine',
        description: 'Break the system before it tags you cleanly.',
        outcomeText:
          'You get fingers, wire, and delighted malice into the housing before the system can decide who you are. The dispenser shrieks, swallows three names, and coughs up a half-valid badge core and a shower of static. Meridian hates damaged paperwork because damaged paperwork can still be argued with.',
      },
    },
  },
  'mandatory-feedback-loop': {
    title: 'Applause Threshold',
    description:
      'A sealed door will not open until the room registers enough applause. The overhead speakers keep insisting that enthusiasm is voluntary. Dark streaks mark the floor where people stood too long deciding whether to clap.',
    choices: {
      'accept-the-notes': {
        label: 'Clap Along',
        description: 'Easy progress. Keep your head down.',
        outcomeText:
          'You clap. The speakers brighten. The applause track fattens around your own until the room can pretend it was earned. The door opens with the smug grace of a policy being proven right.',
      },
      'weaponize-feedback': {
        label: 'Spoof The Sensor',
        description: 'Outsmart the room.',
        outcomeText:
          'You feed the sensor what it wants without giving it the satisfaction of sincerity. The room accepts the fraud immediately, which tells you something useful about Crown Meridian: even its rituals were built to detect compliance, not belief.',
      },
      'cc-the-reserve': {
        label: 'Refuse And Wait',
        description: 'Test whether the system blinks first.',
        outcomeText:
          'You stand still while the room cycles through incentives, reminders, and gentle threats. The speakers become sharper. The lights become hotter. Meridian finally relents, not because it respects refusal, but because it has finished documenting it.',
      },
    },
  },
  'suspicious-elevator-pitch': {
    title: 'Career Accelerator',
    description:
      'A spinning prize wheel promises a career accelerator package if you sign before reading the deduction schedule. Every wedge on the wheel is gold except the tiny ones that look legally important.',
    choices: {
      'sign-the-addendum': {
        label: 'Spin Now',
        description: 'Grab power. Pay later.',
        outcomeText:
          'The wheel spins with the energy of a game show trying not to become a confession. It lands on something generous enough to feel suspicious, and the contract seals before the applause dies. Later, when the cost shows up in fine print and blood pressure, you understand why Meridian loves acceleration.',
      },
      'let-companion-stall': {
        label: 'Read The Deductions',
        description: 'Smaller gain. Fewer surprises.',
        outcomeText:
          'You ignore the lights and read. The wheel keeps trying to hurry you, which tells you the danger is in the paperwork, not the prize. What you claim is smaller, cleaner, and much harder for the building to leverage against you.',
      },
      'demand-upfront-bribe': {
        label: 'Forge A Signature',
        description: 'Cheat the paperwork.',
        outcomeText:
          'You give the form a name Meridian deserves more than you do. The system accepts it because authority has always mattered more here than authenticity. The payout arrives hot and immediate while someone else inherits the meeting.',
      },
    },
  },
};

const defeatAdvice = {
  'rushed-down-early':
    'You brought a memo to a knife fight. Start next run with faster damage or cheaper control.',
  'died-to-attrition':
    'The Spire did not beat you quickly. It beat you professionally. Bring sustain.',
  'statuses-killed-you':
    'Your bloodstream got audited. Pack cleanse, prevention, or shorter fights.',
  'build-came-online-too-late':
    'Great long-term vision. Shame about the short term. Front-load your first three floors.',
  'boss-outscaled-you':
    'You survived the meeting and lost to the follow-up. Add a real finisher.',
  'spread-power-too-thin':
    'This run died in committee. Pick one lane and overfund it.',
  'bad-route-choice':
    'You chose greed over safety and Meridian noticed. Take the boring door once in a while.',
  'companion-mismatch':
    'Good personalities. Bad team. Bring companions who solve the same problem on purpose.',
  'defense-fine-damage-not':
    'Congratulations on your very durable collapse. Convert safety into pressure sooner.',
  'damage-fine-defense-not':
    'You nearly won the sprint and lost the building. Add one plan for when the enemy gets a turn.',
};

export function getAuthoredClassCodexCard(classId: string) {
  return classCodexCards[classId] ?? null;
}

export function getAuthoredCompanionCodexCard(companionId: string) {
  return companionCodexCards[companionId] ?? null;
}

export function getEarlyFloorBeat(floorNumber: number) {
  return earlyFloorBeats[floorNumber] ?? null;
}

export function getPartyScene(
  sceneId: string,
  companionIds?: string[] | null
): PartyScene | null {
  const scene = partyScenes[sceneId] ?? null;

  if (!scene) {
    return null;
  }

  if (!companionIds || companionIds.length === 0) {
    return scene;
  }

  const filteredIds = companionIds.filter((companionId) =>
    startingTrioSceneOrder.includes(companionId)
  );

  if (filteredIds.length === 0) {
    return null;
  }

  const lines = scene.lines.filter((line) => filteredIds.includes(line.speakerId));

  return lines.length > 0 ? { ...scene, lines } : null;
}

export function getRewardPackagePitch(optionId: string | null | undefined) {
  if (!optionId) {
    return null;
  }

  return rewardPackagePitches[optionId] ?? null;
}

export function getAuthoredEventOverlay(eventId: string) {
  return eventOverlays[eventId] ?? null;
}

export function createAuthoredDefeatRecommendation(combat: CombatState) {
  const heroStatusIds = combat.heroStatuses.map((status) => status.id);
  const enemyHealthRatio =
    combat.enemy.maxHp > 0 ? combat.enemy.currentHp / combat.enemy.maxHp : 1;

  if (combat.enemy.tier === 'boss') {
    return defeatAdvice['boss-outscaled-you'];
  }

  if (heroStatusIds.length >= 2 || heroStatusIds.includes('micromanaged')) {
    return defeatAdvice['statuses-killed-you'];
  }

  if (heroStatusIds.includes('burnout') || combat.turnNumber >= 6) {
    return defeatAdvice['died-to-attrition'];
  }

  if (combat.turnNumber <= 2) {
    return defeatAdvice['rushed-down-early'];
  }

  if (enemyHealthRatio > 0.6) {
    return defeatAdvice['defense-fine-damage-not'];
  }

  if (enemyHealthRatio <= 0.3) {
    return defeatAdvice['damage-fine-defense-not'];
  }

  return defeatAdvice['spread-power-too-thin'];
}
