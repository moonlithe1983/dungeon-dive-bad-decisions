export type EventChoiceEffect = {
  metaCurrency: number;
  runHealing: number;
  runDamage: number;
  itemId: string | null;
  nextActiveCompanionId: string | null;
};

export type EventChoice = {
  id: string;
  label: string;
  description: string;
  preview: string;
  outcomeText: string;
  effect: EventChoiceEffect;
  classBonusLabel?: string | null;
  companionBonusLabel?: string | null;
  synergyBonusLabel?: string | null;
};

export type EventClassMoment = {
  classId: string;
  className: string;
  headline: string;
  line: string;
};

export type EventCompanionMoment = {
  companionId: string;
  companionName: string;
  role: 'active' | 'reserve';
  bondLevel: number;
  headline: string;
  line: string;
};

export type EventScene = {
  eventId: string;
  title: string;
  description: string;
  classMoment: EventClassMoment;
  companionMoments: EventCompanionMoment[];
  choices: EventChoice[];
};
