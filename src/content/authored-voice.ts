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
    title: 'Floor 1: False Welcome',
    summary:
      'HR turned the entry floor into a fake welcome experience. It tells you this tower rewards performance over safety and expects you to smile while it does it.',
  },
  2: {
    title: 'Floor 2: Approval Pressure',
    summary:
      'This floor teaches that access now depends on applause, approval, and spectacle. The Spire is testing what people will agree to if it sounds like a contest.',
  },
  3: {
    title: 'Floor 3: Weaponized Performance',
    summary:
      'By here the tower openly attaches rewards to deductions and pain. The lesson is that Meridian does not want winners. It wants compliant survivors.',
  },
};

const startingTrioSceneOrder = [
  'facilities-goblin',
  'former-executive-assistant',
  'security-skeleton',
];

const partyScenes: Record<string, PartyScene> = {
  'first-meeting': {
    title: 'How Companions Help',
    lines: [
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Pick me when you want more recovery and better scavenging. I keep shaky runs upright.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'Pick me when timing matters. I make first turns cleaner and boss reads sharper.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Pick me when you need blunt protection. I make ugly rooms less likely to snowball.',
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
  'first-route-choice-alt-1': {
    title: 'Crew Read',
    lines: [
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Left door feels trapped. Right door feels ambitious. Neither quality comforts me.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'Take the route with fewer adjectives. Meridian hides the knives in branding.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'I vote for whichever hallway looks most like a future apology memo.',
      },
    ],
  },
  'first-route-choice-alt-2': {
    title: 'Crew Read',
    lines: [
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'That route smells like live wiring and broken promises. Which narrows it down nicely.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Choose the danger we understand before the building upgrades it.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'For the record, I hate that those are our professional options.',
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
  'battle-intro-alt-1': {
    title: 'Crew Channel',
    lines: [
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'If anyone asks, this was a controlled escalation.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Then let us control it before it controls the hallway.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Too late. I already like where this is going.',
      },
    ],
  },
  'battle-intro-alt-2': {
    title: 'Crew Channel',
    lines: [
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Same drill as always: survive first, complain second.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'I can multitask if the complaint is specific enough.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Specific complaint: that thing still has kneecaps.',
      },
    ],
  },
  'battle-intro-alt-3': {
    title: 'Crew Channel',
    lines: [
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'There it is. Another room where policy learned to throw itself at people.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Good. I was worried we might have to be reasonable for a whole minute.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Reasonable can resume after the threat is horizontal.',
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
  'suspicious-reward-screen-alt-1': {
    title: 'Crew Read',
    lines: [
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'This reward table has the emotional tone of a trap wearing a blazer.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'Then we take the trap that helps and decline the one that writes a memoir about it.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'I still think we should take the one humming at us.',
      },
    ],
  },
  'suspicious-reward-screen-alt-2': {
    title: 'Crew Read',
    lines: [
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Free equipment is how this tower flirts. Be rude and take the useful piece.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Prefer the payout that keeps us alive over the one that flatters us.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'Excellent. We are making mature choices under completely deranged circumstances.',
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
  'creepy-event-prompt-alt-1': {
    title: 'Crew Read',
    lines: [
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'That room is trying far too hard to look optional.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Understood. We proceed as though consent was forged.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Good. I hate it when the building plays hard to get.',
      },
    ],
  },
  'creepy-event-prompt-alt-2': {
    title: 'Crew Read',
    lines: [
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'I would prefer a hostile hallway. This feels personal.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Personal means breakable. Usually.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'Wonderful. We have downgraded from safe to interpretable.',
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
  'low-health-alt-1': {
    title: 'Crew Channel',
    lines: [
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'You are still upright. Let us preserve that luxury.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Good. Falling over would slow the looting.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'Please survive long enough for me to be smug about it later.',
      },
    ],
  },
  'low-health-alt-2': {
    title: 'Crew Channel',
    lines: [
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'You are doing the dramatic pause before the comeback. Commit to the second half.',
      },
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Confirmed. Breathing remains the current objective.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'I can work with breathing. Please keep doing it.',
      },
    ],
  },
  'low-health-alt-3': {
    title: 'Crew Channel',
    lines: [
      {
        speakerId: 'security-skeleton',
        speakerName: 'Security Skeleton',
        text: 'Critical condition acknowledged. We remain operational out of spite.',
      },
      {
        speakerId: 'former-executive-assistant',
        speakerName: 'Former Executive Assistant',
        text: 'Do not collapse before the room learns from it.',
      },
      {
        speakerId: 'facilities-goblin',
        speakerName: 'Facilities Goblin',
        text: 'Stay upright. I am not dragging dignity and body weight at the same time.',
      },
    ],
  },
};

const rewardPackagePitches: Record<string, RewardPackagePitch> = {
  'expense-fraud': {
    name: 'Expense Account',
    description: 'Buy breathing room now and bill the quarter later.',
  },
  'per-diem-skimming': {
    name: 'Expense Account',
    description: 'Buy breathing room now and bill the quarter later.',
  },
  'black-card-overage': {
    name: 'Expense Account',
    description: 'Buy breathing room now and bill the quarter later.',
  },
  'triage-cart': {
    name: 'Sick Leave',
    description: 'Patch the body before the building notices weakness.',
  },
  'wellness-cooler': {
    name: 'Sick Leave',
    description: 'Patch the body before the building notices weakness.',
  },
  'concierge-crash-cart': {
    name: 'Sick Leave',
    description: 'Patch the body before the building notices weakness.',
  },
  'contraband-locker': {
    name: 'Back Channel',
    description: 'Dirty tools, cleaner kills, worse ethics.',
  },
  'swag-bag-heist': {
    name: 'Lunch-and-Learn',
    description: 'Crew-first value now, sharper synergy if you live long enough.',
  },
  'golden-parachute-cache': {
    name: 'Exit Package',
    description: 'Emergency power for runs already halfway dead.',
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
  'fire-drill-evangelism': {
    title: 'Evacuation Gospel',
    description:
      'A safety lead has turned a fire drill into revival theater. The alarm cadence is wrong, the exits are overexplained, and the crowd is one slogan away from trampling itself for compliance.',
    choices: {
      'loot-the-muster-crate': {
        label: 'Crack The Muster Crate',
        description: 'Take the practical supplies before the sermon reaches attendance.',
        outcomeText:
          'You raid the emergency box while the floor is still pretending this is about safety. Inside: tape, sugar, one useful tool, and proof that Meridian stocks comfort as a prop first and a resource second.',
      },
      'fake-the-all-clear': {
        label: 'Spoof The All-Clear',
        description: 'Cut the ritual short, take the margin, and accept the scorch marks.',
        outcomeText:
          'You feed the room the sound it wants and the crowd obeys immediately. The exits clear faster, the panic turns profitable, and somewhere in the smoke a real problem learns it has been officially deprioritized.',
      },
      'appoint-a-fire-marshal': {
        label: 'Nominate A Fire Marshal',
        description: 'Move the whistle and the blame onto somebody else for a minute.',
        outcomeText:
          'The room accepts the new authority because uniforms and confidence still fool it. The drill remains nonsense, but the handoff buys space, structure, and one precious beat of survivable order.',
      },
    },
  },
  'shadow-it-market': {
    title: 'Shadow IT Market',
    description:
      'Under the office, a hidden bazaar trades in stolen hardware, copied access, and favors nobody wants written down. Every stall feels one audit away from becoming a crime scene.',
    choices: {
      'buy-the-prototype': {
        label: 'Buy The Prototype',
        description: 'Take the dangerous machine and trust that danger can be aimed.',
        outcomeText:
          'You buy the hardware everyone else was smart enough to fear. It hums like trapped litigation and warms in your hands like it already knows whose problem it is now.',
      },
      'broker-a-resale-cut': {
        label: 'Broker A Resale Cut',
        description: 'Skip the object, take the margin, and leave the curse on the shelf.',
        outcomeText:
          'You move value without taking possession, which is the cleanest kind of theft this building allows. The vendors leave thinking you helped them. That is their mistake to keep.',
      },
      'let-the-reserve-haggle': {
        label: 'Let The Reserve Haggle',
        description: 'Rotate the conversation, recover your footing, and let somebody else get lied to first.',
        outcomeText:
          'The negotiation gets louder, uglier, and somehow more favorable. While the room argues over price, you recover enough composure to remember that survival is also a purchasing strategy.',
      },
    },
  },
  'expense-report-exorcism': {
    title: 'Expense Report Exorcism',
    description:
      'Finance trapped something infernal inside reimbursement paperwork and now wants the problem solved without admitting the ritual was budget approved. The receipts twitch when you get too close.',
    choices: {
      'audit-the-possession': {
        label: 'Audit The Possession',
        description: 'Weaponize process until even the demon regrets the paperwork.',
        outcomeText:
          'You go line by line until the haunting realizes it has entered a slower hell than itself. The entity leaves out of sheer administrative fatigue, and the reimbursement clears with obscene politeness.',
      },
      'feed-it-receipts': {
        label: 'Feed It Receipts',
        description: 'Give the ritual worse fraud than it expected and keep what comes back.',
        outcomeText:
          'The paperwork burns blue, the columns scream, and the room smells like taxable regret. When the ritual settles, it leaves behind an object too useful to be moral and too expensive to ignore.',
      },
      'delegate-the-summons': {
        label: 'Delegate The Summons',
        description: 'Rotate the burden and let the ritual learn a new name.',
        outcomeText:
          'The circle stabilizes the moment the responsibility moves. Meridian, as always, becomes easiest to survive when somebody else is holding the clipboard and the curse.',
      },
    },
  },
  'all-hands-mutiny': {
    title: 'All-Hands Mutiny',
    description:
      'A company-wide update has curdled into a soft coup conducted through mic feedback, broken slides, and applause that sounds increasingly mandatory. The room is deciding what kind of lie it wants to become next.',
    choices: {
      'seize-the-mic': {
        label: 'Seize The Mic',
        description: 'Take control of the room before control becomes another weapon pointed at you.',
        outcomeText:
          'You grab the meeting by the throat and force it to call that leadership. The crowd obeys just long enough to be monetized, and the stress bill lands exactly where you were standing.',
      },
      'loot-the-swag-table': {
        label: 'Loot The Swag Table',
        description: 'Ignore the coup, take the salvage, and let the slogans eat each other.',
        outcomeText:
          'The branded giveaways turn out to be mostly plastic lies with one real advantage hidden under the tote bags. You leave heavier, meaner, and considerably less respectful of offsite budgets.',
      },
      'push-the-reserve-onstage': {
        label: 'Push The Reserve Onstage',
        description: 'Change the face of the crisis and buy a cleaner angle for the rest of the crew.',
        outcomeText:
          'The room accepts the substitution because spectacle matters more than competence here. While the spotlight chases the new victim, you get the one thing mutiny rooms rarely offer: time.',
      },
    },
  },
  'breakroom-whistleblower': {
    title: 'Breakroom Whistleblower',
    description:
      'Someone hid evidence of a policy disaster behind a passive-aggressive fridge note and a tray of severance cupcakes. The breakroom smells like panic, dairy, and legal exposure.',
    choices: {
      'raid-the-fridge-file': {
        label: 'Raid The Fridge File',
        description: 'Take the evidence, the hush fund, and whatever dignity still fits in your hands.',
        outcomeText:
          'You pull the documents from behind expired yogurt and discover that blackmail refrigerates beautifully. The attached snack stash is shameful, but not nearly as shameful as leaving value behind.',
      },
      'take-the-severance-lunch': {
        label: 'Take The Severance Lunch',
        description: 'Loot the premium meal prep and whatever contraband is hiding behind the frosting.',
        outcomeText:
          'The lunch itself is executive-grade denial in biodegradable packaging. The hidden prize behind it is much more honest: expensive, useful, and clearly never meant for the people doing the surviving.',
      },
      'make-the-reserve-sign': {
        label: 'Make The Reserve Sign',
        description: 'Move the witness burden, reset the line, and let HR chase the wrong signature.',
        outcomeText:
          'The paperwork still ends in threats, but the room loses track of who exactly it meant to punish first. In Meridian, that kind of confusion counts as cover.',
      },
    },
  },
  'trust-fall-incident-report': {
    title: 'Trust Fall Incident Report',
    description:
      'The offsite legal team left a stack of waivers beside a trust-fall pit nobody wants to discuss directly. Every page smells like toner, liability, and the kind of optimism that kills witnesses.',
    choices: {
      'rewrite-the-liability': {
        label: 'Rewrite The Liability',
        description: 'Make the record honest enough that somebody has to pay to bury it.',
        outcomeText:
          'You clean the language until the blame points exactly where it should have from the start. The payout arrives fast, quiet, and deeply embarrassed to exist.',
      },
      'loot-the-waiver-box': {
        label: 'Loot The Waiver Box',
        description: 'Take the trauma gear, accept the scrape, and keep the best part of the accident kit.',
        outcomeText:
          'The box absolutely fights back. So did the retreat hardware that made it necessary. You leave scraped, vindicated, and carrying one item the safety team clearly meant for themselves.',
      },
      'appoint-a-fall-guy': {
        label: 'Appoint A Fall Guy',
        description: 'Rotate the blame, reset the formation, and let the room call it leadership.',
        outcomeText:
          'The liability cloud shifts just enough to stop sitting directly on your lungs. Someone else inherits the title, the paperwork, and the ceremonial part of the disaster.',
      },
    },
  },
  'golden-parachute-auction': {
    title: 'Golden Parachute Auction',
    description:
      'Executive severance packages are being traded in whispers outside the corner office. The table is covered in emergency perks for people who caused the emergency and already expect to survive it.',
    choices: {
      'skim-the-payout-table': {
        label: 'Skim The Payout Table',
        description: 'Take the cleanest cash and accept what executive air does to your pulse.',
        outcomeText:
          'You steal directly from the panic budget of people who assumed panic was for other employees. The money comes easy. The atmosphere does not.',
      },
      'steal-the-emergency-perks': {
        label: 'Steal The Emergency Perks',
        description: 'Take the premium survival kit before someone with cufflinks remembers it exists.',
        outcomeText:
          'The elite panic package is obscene, overstocked, and annoyingly effective. It turns out executive compassion works fine once it is pointed inward.',
      },
      'nominate-the-reserve-bidder': {
        label: 'Nominate The Reserve Bidder',
        description: 'Push a different face into the auction and collect the recovery window it creates.',
        outcomeText:
          'The room pivots beautifully toward the new bidder because status theater is still stronger than sense. While the brass recalibrates, you recover and leave with a cleaner angle through the wreckage.',
      },
    },
  },
};

const defeatAdvice = {
  'rushed-down-early':
    'You brought a memo to a hallway execution. Start next run with faster damage or cheaper control.',
  'died-to-attrition':
    'The Spire did not beat you quickly. It beat you professionally. Bring sustain before professionalism kills you again.',
  'statuses-killed-you':
    'Your bloodstream got audited and failed compliance. Pack cleanse, prevention, or shorter fights.',
  'build-came-online-too-late':
    'Great long-term vision. Shame about the opening minutes. Front-load your first three floors.',
  'boss-outscaled-you':
    'You survived the meeting and died in the follow-up email. Add a real finisher.',
  'spread-power-too-thin':
    'This run died in committee. Pick one lane, overfund it, and let the others resent you.',
  'bad-route-choice':
    'You chose greed over safety and Meridian noticed immediately. Take the boring door once in a while.',
  'companion-mismatch':
    'Good chemistry. Bad survival math. Bring companions who solve the same problem on purpose.',
  'defense-fine-damage-not':
    'Congratulations on your very durable collapse. Convert safety into pressure sooner.',
  'damage-fine-defense-not':
    'You nearly won the sprint and lost the building. Add one plan for when the enemy gets a turn.',
};

function hashString(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

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

export function getRotatedPartyScene(
  sceneIds: string[],
  seed: string,
  companionIds?: string[] | null
) {
  if (sceneIds.length === 0) {
    return null;
  }

  const sceneId = sceneIds[hashString(seed) % sceneIds.length] ?? sceneIds[0];

  return getPartyScene(sceneId, companionIds);
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
