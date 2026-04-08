import {
  COMPANY_NAME,
  TOWER_NAME,
  getCompanyDisasterSummary,
} from '@/src/content/company-lore';

export type OnboardingBriefingSection = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  body: string;
};

export type OnboardingTutorialChoice = {
  id: string;
  title: string;
  description: string;
  preview: string;
  resolution: string;
};

export type OnboardingTutorialStep = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  body: string;
  instruction: string;
  kind: 'intro' | 'route' | 'battle' | 'reward' | 'event' | 'meta';
  choices?: OnboardingTutorialChoice[];
};

export const onboardingBriefingTitle = 'HR Onboarding';
export const onboardingBriefingSubtitle =
  'Mandatory orientation for employees still trapped inside the incident.';
export const onboardingCodexCategoryDescription =
  'Replay the full first-run orientation packet, including story setup, run flow, combat basics, and what progress carries forward.';
export const onboardingTutorialTitle = 'Interactive Orientation Sim';
export const onboardingTutorialSubtitle =
  'Short guided first-session tutorial for learning the live loop by doing.';

export const onboardingBriefingSections: OnboardingBriefingSection[] = [
  {
    id: 'welcome',
    eyebrow: 'Story Blurb',
    title: 'Welcome to Meridian Spire',
    summary: 'Why the building is alive, hostile, and somehow still billable.',
    body: `${getCompanyDisasterSummary()}

You are the employee still holding the live incident when everyone important either evacuated, blamed another department, or promoted themselves out of reach.

Your job is not to save the company. Your job is to survive ${TOWER_NAME}, force the disaster upward, and make the people who created it confront their own mess.`,
  },
  {
    id: 'run-flow',
    eyebrow: 'Run Flow',
    title: 'How a Dive Works',
    summary: 'Each run is a floor-by-floor escalation through the tower.',
    body: `A dive starts with a class choice and two companion picks. Your class defines your combat identity, while companions change your early pressure, support tools, and recovery angles.

Each floor contains a short chain of nodes. Battles wear you down, events force ugly choices, rewards stabilize the run, and bosses decide whether the ticket keeps climbing.

Clear the current node, move to the next stop, and keep pushing the incident toward executive ownership before the tower turns you into the scapegoat.`,
  },
  {
    id: 'combat',
    eyebrow: 'Mechanics',
    title: 'Combat Basics',
    summary: 'You win by managing pressure, not by playing politely.',
    body: `Combat is turn-based. Your core actions trade off aggression, survival, and tempo, so the right answer depends on the enemy intent and your remaining health.

Statuses matter. Some enemies stack damage or disruption over multiple turns, and some class tools only shine when you exploit that timing instead of reacting late.

If your health hits zero, the run ends. The safest fight is usually the one you finish quickly, before a bad room gets to demonstrate how unfair it really is.`,
  },
  {
    id: 'events-rewards',
    eyebrow: 'Choices',
    title: 'Events, Rewards, and Companions',
    summary: 'Not every room is a fight, but every room can still cost you.',
    body: `Event rooms trade certainty for fallout. They can hand you healing, items, currency, or damage, and their outcomes permanently archive themselves in the codex once seen.

Reward rooms and victory payouts let you recover health, earn permanent currency, or add contraband that changes the rest of the run.

Companions are not cosmetic. Their bond levels and specialties make weak starts survivable, cover class blind spots, and sometimes create the difference between stabilizing a floor and collapsing on it.`,
  },
  {
    id: 'persistence',
    eyebrow: 'Persistence',
    title: 'What Carries Forward',
    summary: 'Runs end, but the profile keeps receipts.',
    body: `Your active run autosaves, and the game also keeps a backup save in case the current slot breaks mid-disaster.

Outside the run, your profile tracks unlocked classes, companions, codex discoveries, bond growth, upgrades, and total career damage such as runs, wins, deaths, and bosses cleared.

Meta currency and operations upgrades improve future dives, so even failed runs can still teach the tower something expensive. If you ever want to start clean, Settings now includes a full delete-all-save-states option.`,
  },
];

export function getOnboardingReplayLabel() {
  return `${onboardingBriefingTitle} Replay`;
}

export function getOnboardingHeroBody() {
  return `${onboardingBriefingSubtitle} ${COMPANY_NAME} requires acknowledgement before first descent.`;
}

export const onboardingTutorialSteps: OnboardingTutorialStep[] = [
  {
    id: 'intro',
    eyebrow: 'Interactive FTUE',
    title: 'Enter the orientation sim',
    summary: 'This is a short guided version of the real loop.',
    body: `You are not reading a giant lore wall anymore. This sim teaches the actual decisions that matter in a run: choose a route, survive a fight, claim a reward, resolve an event, and understand what progress survives after the smoke clears.`,
    instruction: 'Start the simulation.',
    kind: 'intro',
  },
  {
    id: 'route-choice',
    eyebrow: 'Step 1',
    title: 'Pick the next room',
    summary: 'A floor starts with a visible route choice.',
    body: 'You do not clear every room. You pick one active node, read the risk, and commit to the route that best fits your current HP and build.',
    instruction: 'Tap one route to see how route reading works.',
    kind: 'route',
    choices: [
      {
        id: 'event-node',
        title: 'Applause Threshold',
        description: 'Risk event. Fast progress, ugly fallout.',
        preview: 'Events trade certainty for upside. Good when you can afford volatility.',
        resolution:
          'You opened the event lane. That teaches the first rule of floor flow: read the room type before you commit, because each node asks for a different kind of survival.',
      },
      {
        id: 'reward-node',
        title: 'Concierge Cache',
        description: 'Reward room. Lower pressure, smaller immediate danger.',
        preview: 'Reward nodes help stabilize weak starts and patch bad floors.',
        resolution:
          'You opened the reward lane. That teaches the second rule of floor flow: not every smart play is aggression. Sometimes the right route is the one that keeps the run alive.',
      },
    ],
  },
  {
    id: 'battle-read',
    eyebrow: 'Step 2',
    title: 'Resolve a fight',
    summary: 'Combat is about pressure, timing, and enemy intent.',
    body: 'Read what the enemy is threatening, then choose the action that changes the next exchange in your favor.',
    instruction: 'Pick one combat action.',
    kind: 'battle',
    choices: [
      {
        id: 'stabilize',
        title: 'Stabilize',
        description: 'Recover HP and blunt the next hit.',
        preview: 'Best when HP is tight or the enemy is telegraphing heavy damage.',
        resolution:
          'You chose survival over tempo. That is often correct when a room is about to spike. The key lesson is that actions have different purposes, not just different numbers.',
      },
      {
        id: 'disrupt',
        title: 'Disrupt',
        description: 'Reduce enemy pressure and buy breathing room.',
        preview: 'Best when you need tempo control before committing to damage.',
        resolution:
          'You chose control. That teaches the intent loop: the safest turn is often the one that makes the enemy less dangerous before you race for the kill.',
      },
      {
        id: 'push-hard',
        title: 'Push Hard',
        description: 'Trade safety for a faster finish.',
        preview: 'Best when ending the fight now prevents a worse follow-up.',
        resolution:
          'You chose tempo. That teaches the other half of combat: many rooms get more unfair the longer they live, so fast lethal pressure can be the safest plan.',
      },
    ],
  },
  {
    id: 'reward-draft',
    eyebrow: 'Step 3',
    title: 'Choose one payout',
    summary: 'Rewards are build decisions, not just loot.',
    body: 'Every reward should be understandable, distinct, and relevant to the current run state.',
    instruction: 'Pick the package you would actually take.',
    kind: 'reward',
    choices: [
      {
        id: 'recovery-kit',
        title: 'Recovery Kit',
        description: '+3 HP now and a small chit payout.',
        preview: 'Good when stabilizing the current run matters more than long-term greed.',
        resolution:
          'You prioritized survival. That is a valid build decision, and the UI should always make that trade obvious before you lock it in.',
      },
      {
        id: 'paper-armor',
        title: 'Paper Armor',
        description: 'Add a contraband item that improves future exchanges.',
        preview: 'Good when you can afford short-term risk for a stronger rest of run.',
        resolution:
          'You drafted a build piece. That teaches the reward loop: good rewards change how the next few rooms play, not just what number goes up.',
      },
    ],
  },
  {
    id: 'event-decision',
    eyebrow: 'Step 4',
    title: 'Resolve an event',
    summary: 'Events are choices with consequences, not flavor-only cutaways.',
    body: 'Read the preview, pick once, and accept the fallout. Good event UI tells you enough to choose without drowning you in text.',
    instruction: 'Choose one event response.',
    kind: 'event',
    choices: [
      {
        id: 'tell-the-truth',
        title: 'Tell the truth plainly',
        description: 'Lower immediate chaos, smaller reward.',
        preview: 'Safer outcome with less upside.',
        resolution:
          'You chose the lower-volatility path. Events should support agency by showing what is dangerous, what is safer, and what the likely gain actually is.',
      },
      {
        id: 'weaponize-policy',
        title: 'Weaponize policy',
        description: 'Higher upside, higher fallout.',
        preview: 'Potential bigger reward if you can absorb the mess.',
        resolution:
          'You chose the higher-variance path. That teaches why event previews matter: a player should understand the trade before the game asks for commitment.',
      },
    ],
  },
  {
    id: 'meta-loop',
    eyebrow: 'Step 5',
    title: 'See what carries forward',
    summary: 'Runs end, but the profile keeps progress.',
    body: 'When a run ends, the game should immediately show what you earned, what unlocked, and what your next meaningful goal is. Even failed runs should still move the account somewhere.',
    instruction: 'Finish orientation and continue.',
    kind: 'meta',
  },
];
