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

export const onboardingBriefingTitle = 'Briefing Packet';
export const onboardingBriefingSubtitle =
  'Short reference notes for the live orientation and the first case file.';
export const onboardingCodexCategoryDescription =
  'Replay the short first-run orientation, then open the packet if you want the reference notes in one place.';
export const onboardingTutorialTitle = 'Live Orientation';
export const onboardingTutorialSubtitle =
  'Learn the first run by making real-looking choices, not by reading a wall of HR copy.';

export const onboardingBriefingSections: OnboardingBriefingSection[] = [
  {
    id: 'situation',
    eyebrow: 'Situation',
    title: 'What Went Wrong',
    summary: 'Who you are, what the tower became, and why this run matters.',
    body: `${getCompanyDisasterSummary()}

You are the employee still inside the incident while everyone important runs, blames another department, or hides behind policy.

Your job is to stay alive, force the disaster upward, and drag proof out of ${TOWER_NAME} before ${COMPANY_NAME} buries the cost on you.`,
  },
  {
    id: 'loop',
    eyebrow: 'Live Loop',
    title: 'What A Run Asks You To Do',
    summary: 'Read danger fast, win rooms, draft upgrades, and keep the climb moving.',
    body: `A run starts with a class pick and two companions. Your class changes how you solve trouble. Your companions change how stable your first rooms feel.

Rooms should be short and legible. Fights, rewards, and risk beats all need to tell you what changed without making you hunt for it.

When the run ends, the game should show what carried forward and why another climb is worth it immediately.`,
  },
  {
    id: 'accessibility',
    eyebrow: 'Accessibility',
    title: 'Set Up Readability First',
    summary: 'Text size, contrast, motion, and comfort settings are part of the real game.',
    body: `Before the first live dive, Settings can change text size, contrast, reduced motion, dyslexia assist, handedness bias, haptics, and audio levels.

Those are not fake options or afterthoughts. Use them before the first case file if the default view is not doing its job for you.`,
  },
];

export function getOnboardingReplayLabel() {
  return 'Replay Live Orientation';
}

export function getOnboardingHeroBody() {
  return 'This is a short, choice-driven first-run setup. It should explain the fantasy quickly, surface accessibility immediately, and get you to the first real decision fast.';
}

export const onboardingTutorialSteps: OnboardingTutorialStep[] = [
  {
    id: 'intro',
    eyebrow: 'Step 1',
    title: 'Know the job in one screen',
    summary: 'You are not fixing the company. You are surviving it long enough to force the damage upward.',
    body: `${COMPANY_NAME} turned the building into a live incident. ${TOWER_NAME} is now a hostile workplace ruin. Your run is one case file inside that disaster, and the point is to survive, expose, and keep moving.`,
    instruction: 'Continue when the fantasy is clear.',
    kind: 'intro',
  },
  {
    id: 'room-choice',
    eyebrow: 'Step 2',
    title: 'Pick the problem you want first',
    summary: 'A floor should show the danger and the payoff before it asks you to commit.',
    body: 'Every room asks a different question. Some are cleaner fights. Some are riskier detours. Good route reading means knowing what kind of trouble you can afford right now.',
    instruction: 'Choose the room you would open first.',
    kind: 'route',
    choices: [
      {
        id: 'direct-fight',
        title: 'Direct Fight',
        description: 'Cleaner path, clearer danger, immediate pressure.',
        preview: 'Take this when you want a more honest room and a quick answer.',
        resolution:
          'You chose the cleaner confrontation. That is the right play when the room tells you exactly what can go wrong and you would rather solve it now than let it scale later.',
      },
      {
        id: 'risky-detour',
        title: 'Risky Detour',
        description: 'Higher variance room with possible upside and messier fallout.',
        preview: 'Take this when the upside matters more than a stable floor.',
        resolution:
          'You chose volatility. That can be correct, but only if the game makes the danger and the reward legible before the click. Hidden consequences are not strategy.',
      },
    ],
  },
  {
    id: 'combat-read',
    eyebrow: 'Step 3',
    title: 'Win one ugly exchange',
    summary: 'The room should tell you what hurts, what helps, and why the trade mattered.',
    body: 'Combat should reward fast reading. The player needs to know what the enemy is threatening, what their button press changes, and how much health moved because of it.',
    instruction: 'Pick the combat approach that makes the next exchange best for you.',
    kind: 'battle',
    choices: [
      {
        id: 'pressure',
        title: 'Pressure Hard',
        description: 'End the room faster before the danger scales.',
        preview: 'Good when speed is safer than caution.',
        resolution:
          'You chose tempo. Some rooms punish hesitation, so the safest answer is to end the problem before it gets another full turn to exist.',
      },
      {
        id: 'control',
        title: 'Control The Room',
        description: 'Reduce the threat first, then finish clean.',
        preview: 'Good when the enemy is about to make the room worse.',
        resolution:
          'You chose control. Good combat asks for reading, not guessing. If the enemy is clearly about to spike, reducing that pressure first is the smart play.',
      },
      {
        id: 'recover',
        title: 'Recover And Reset',
        description: 'Spend the moment stabilizing so the room does not snowball.',
        preview: 'Good when your health is already too low to be brave.',
        resolution:
          'You chose survival. Recovery is a real decision, not a coward tax, as long as the screen makes the health trade obvious instead of burying it in text.',
      },
    ],
  },
  {
    id: 'reward-read',
    eyebrow: 'Step 4',
    title: 'Take the package that changes the next room',
    summary: 'Rewards should be build decisions with exact before-and-after clarity.',
    body: 'A good reward screen shows the current value, the new value, and why that package matters now. The player should not have to remember their HP, gear, or currency from another screen.',
    instruction: 'Choose the reward that helps this run most right now.',
    kind: 'reward',
    choices: [
      {
        id: 'patch-now',
        title: 'Patch Now',
        description: 'Heal immediately and steady the next room.',
        preview: 'Best when breathing room matters more than greed.',
        resolution:
          'You chose immediate stability. That is only satisfying if the screen shows exactly how much health you gain and what problem you are solving with it.',
      },
      {
        id: 'build-now',
        title: 'Build Now',
        description: 'Take a stronger upgrade that changes the next rooms more sharply.',
        preview: 'Best when you can afford to get greedier for a stronger run shape.',
        resolution:
          'You chose build power. That should feel exciting because it changes how the next room plays, not because the description is longer.',
      },
    ],
  },
  {
    id: 'carry-forward',
    eyebrow: 'Step 5',
    title: 'Know why another run matters',
    summary: 'A run should end with one clear reason to queue the next one.',
    body: 'When the case file closes, the recap should show what you earned, what carried forward, and what the next run can reveal that this one did not. If the player wins or loses and still feels aimless, the loop is unfinished.',
    instruction: 'Finish orientation and move to class selection.',
    kind: 'meta',
  },
];
