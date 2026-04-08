export type BondPairArchiveDefinition = {
  id: string;
  companionIds: [string, string];
  title: string;
  summary: string;
  archiveNote: string;
  sceneLines: string[];
};

export const bondPairArchiveDefinitions: BondPairArchiveDefinition[] = [
  {
    id: 'facilities-goblin__former-executive-assistant',
    companionIds: ['facilities-goblin', 'former-executive-assistant'],
    title: 'Deniable Maintenance',
    summary:
      'A wall-route repair turns into a lesson on how the tower hides authority inside access, timing, and plausible deniability.',
    archiveNote:
      'This pair archive sits beside the solo bond milestones. It records crew chemistry between two current launch companions rather than replacing either companion’s own bond scenes.',
    sceneLines: [
      'The goblin opens a maintenance crawlspace with a grin. The assistant checks the corridor schedule and tells you exactly how long the cameras will be looking somewhere else.',
      'Neither of them says "trust," but the handoff is clean enough that the whole building briefly feels survivable.',
    ],
  },
  {
    id: 'facilities-goblin__security-skeleton',
    companionIds: ['facilities-goblin', 'security-skeleton'],
    title: 'Service Corridor Etiquette',
    summary:
      'A patrol route and a maintenance shortcut overlap just long enough for the two of them to admit they have been covering for each other for longer than policy ever allowed.',
    archiveNote:
      'Use this archive as pair chemistry: route knowledge, cover discipline, and the strange civility that forms when two people keep the same disaster alive for different reasons.',
    sceneLines: [
      'The skeleton watches the hall while the goblin strips a panel open in three practiced motions.',
      'When the route is clear, they trade a single nod like it has stood in for a decade of conversation.',
    ],
  },
  {
    id: 'former-executive-assistant__security-skeleton',
    companionIds: ['former-executive-assistant', 'security-skeleton'],
    title: 'Incident Room',
    summary:
      'A late-night debrief becomes a private operations room where executive timing and security procedure finally start telling the same truth.',
    archiveNote:
      'This pair archive captures the launch roster’s cleanest "read the room" chemistry: one reads the panic, the other holds the line.',
    sceneLines: [
      'She lays the timeline out in neat columns. The skeleton fills the margins with the moments the official report will never survive.',
      'By the time they finish, the room feels less like evidence and more like a plan.',
    ],
  },
];
