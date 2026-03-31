import type { ArchivedRunBondGain } from '@/src/types/run';

export type BondMilestoneLevel = 3 | 5;

export type BondSceneDefinition = {
  id: string;
  companionId: string;
  milestoneLevel: BondMilestoneLevel;
  title: string;
  summary: string;
  sceneLines: string[];
};

export const bondSceneDefinitions: BondSceneDefinition[] = [
  {
    id: 'former-executive-assistant-level-3',
    companionId: 'former-executive-assistant',
    milestoneLevel: 3,
    title: 'Calendar Sabotage',
    summary:
      'A late-night Meridian Spire debrief turns into a lesson on how Crown Meridian power really hides itself inside scheduling.',
    sceneLines: [
      'She drags a marker across the Meridian Spire breakroom whiteboard and circles three empty meeting blocks like they are crime scenes.',
      '"Executives never say what they want in the room," she says. "They say it with who got invited, who got cut, and who suddenly had to reschedule."',
      'You realize she is not venting. She is teaching you how to read a hierarchy by its absences.',
    ],
  },
  {
    id: 'former-executive-assistant-level-5',
    companionId: 'former-executive-assistant',
    milestoneLevel: 5,
    title: 'Emergency Contact',
    summary:
      'She quietly admits that, somewhere along the way, your Meridian Spire disasters became the one thing she still shows up for on purpose.',
    sceneLines: [
      'Meridian Spire is finally quiet enough to hear the vending machine hum like an anxious witness.',
      '"I used to keep a go-bag for Crown Meridian executives," she says. "Now I keep one because if your radio goes silent, I will absolutely come looking."',
      'It lands with the weight of a confession neither of you is willing to call one.',
    ],
  },
  {
    id: 'facilities-goblin-level-3',
    companionId: 'facilities-goblin',
    milestoneLevel: 3,
    title: 'Maintenance Gospel',
    summary:
      'A repair run through the walls turns into the first time they trust you with the Meridian Spire routes that matter.',
    sceneLines: [
      'They pry open a panel, point into the ductwork, and grin like a raccoon unveiling cathedral architecture.',
      '"Every building has a nervous system," they say. "Meridian Spire just happens to scream in budget codes. Most people only learn where it hurts. You are learning where it listens."',
      'Then they hand you the flashlight without hesitation, and that feels bigger than any speech.',
    ],
  },
  {
    id: 'facilities-goblin-level-5',
    companionId: 'facilities-goblin',
    milestoneLevel: 5,
    title: 'Spare Key Doctrine',
    summary:
      'They finally give you the emergency keyring they trust more than management, policy, or probably God.',
    sceneLines: [
      'The ring is heavier than it looks, all nicked brass and impossible labels.',
      '"If I do not make it back from a crawlspace," they mutter, pressing it into your hand, "you are the only person here I trust not to use this stupidly."',
      'You both know that is a lie. The trust is real anyway.',
    ],
  },
  {
    id: 'security-skeleton-level-3',
    companionId: 'security-skeleton',
    milestoneLevel: 3,
    title: 'After-Hours Patrol',
    summary:
      'A patrol loop through a dead Meridian floor becomes a strangely sincere conversation about duty, habits, and who is worth guarding.',
    sceneLines: [
      'Their flashlight never shakes, even when the generator does.',
      '"Policy is mostly an excuse to stand next to people who need backup," they say, staring down a dark hallway. "You have started to qualify."',
      'For a skeleton, it is alarmingly generous.'
    ],
  },
  {
    id: 'security-skeleton-level-5',
    companionId: 'security-skeleton',
    milestoneLevel: 5,
    title: 'Keycard Priority',
    summary:
      'They recategorize you from tolerated anomaly to protected asset, which is about as close to affection as their vocabulary gets.',
    sceneLines: [
      'They slide a spare keycard across the table with the solemnity of a military promotion.',
      '"If alarms trigger," they say, "I am now obligated to reach you first."',
      'It is the driest promise of loyalty you have ever heard, and somehow also the clearest.'
    ],
  },
  {
    id: 'possessed-copier-level-3',
    companionId: 'possessed-copier',
    milestoneLevel: 3,
    title: 'Unauthorized Duplicate',
    summary:
      'The copier spits out a page containing a Project Everrise memory you never typed, and then waits for your reaction like a nervous dog.',
    sceneLines: [
      'A warm sheet slides out with your handwriting on it, except you never wrote the words.',
      'The machine chirps once, uncertain, then prints a second page: "SORRY. TRYING TO HELP."',
      'You set the paper aside instead of throwing it away. The copier hums with visible relief.'
    ],
  },
  {
    id: 'possessed-copier-level-5',
    companionId: 'possessed-copier',
    milestoneLevel: 5,
    title: 'Master Copy',
    summary:
      'It finally prints the truth of what it thinks you are: not an operator, but its person.',
    sceneLines: [
      'The page comes out black-backed and hot enough to sting.',
      'In block capitals, it reads: "PRIMARY USER: TRUSTED." Then, after a pause: "DO NOT LOSE."',
      'The machine jams immediately afterward, like it is embarrassed by its own honesty.'
    ],
  },
  {
    id: 'disillusioned-temp-level-3',
    companionId: 'disillusioned-temp',
    milestoneLevel: 3,
    title: 'Exit Strategy',
    summary:
      'What starts as a joke about quitting Meridian Spire becomes a real conversation about why they keep staying when you ask.',
    sceneLines: [
      'They lean back in a folding chair and stare at the Meridian Spire ceiling tiles like they owe them money.',
      '"I keep planning to ghost this place," they admit. "Then you do something deranged and I want to see how it turns out."',
      'It is not quite loyalty yet, but it is definitely investment.'
    ],
  },
  {
    id: 'disillusioned-temp-level-5',
    companionId: 'disillusioned-temp',
    milestoneLevel: 5,
    title: 'No Notice',
    summary:
      'They admit they already had a chance to leave, and chose not to because leaving you behind felt worse.',
    sceneLines: [
      'There is a folded train ticket in their pocket that never got used.',
      '"I almost took the out," they say. "Then I pictured this place eating you alive without anyone sarcastic enough to intervene."',
      'They laugh after saying it, but only because the alternative would be sincerity.'
    ],
  },
];

export function getBondScenesForCompanion(companionId: string) {
  return bondSceneDefinitions
    .filter((scene) => scene.companionId === companionId)
    .sort((left, right) => left.milestoneLevel - right.milestoneLevel);
}

export function getUnlockedBondScenesForLevel(companionId: string, bondLevel: number) {
  return getBondScenesForCompanion(companionId).filter(
    (scene) => bondLevel >= scene.milestoneLevel
  );
}

export function getBondScenesUnlockedByBondGains(bondGains: ArchivedRunBondGain[]) {
  const unlockedSceneIds = new Set<string>();

  for (const bondGain of bondGains) {
    for (const scene of getBondScenesForCompanion(bondGain.companionId)) {
      if (
        bondGain.levelBefore < scene.milestoneLevel &&
        bondGain.levelAfter >= scene.milestoneLevel
      ) {
        unlockedSceneIds.add(scene.id);
      }
    }
  }

  return bondSceneDefinitions.filter((scene) => unlockedSceneIds.has(scene.id));
}
