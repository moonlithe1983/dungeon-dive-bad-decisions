export const analyticsEventNames = [
  'app_opened',
  'first_opened',
  'screen_viewed',
  'home_cta_pressed',
  'tutorial_started',
  'tutorial_step_completed',
  'tutorial_completed',
  'class_selected',
  'run_started',
  'room_entered',
  'room_exited',
  'route_selected',
  'route_committed',
  'battle_started',
  'battle_action_selected',
  'boss_reached',
  'boss_defeated',
  'death_recorded',
  'upgrade_presented',
  'upgrade_chosen',
  'reward_option_selected',
  'reward_claimed',
  'event_choice_applied',
  'companion_selected',
  'run_ended',
  'recap_viewed',
  'next_goal_presented',
  'replay_cta_pressed',
  'meta_screen_viewed',
  'currency_earned',
  'currency_spent',
  'settings_changed',
  'accessibility_setting_changed',
  'audio_setting_changed',
  'ad_exposure',
  'ad_opt_in',
  'ad_reward_claimed',
  'purchase_funnel_step',
  'live_event_participated',
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export type AnalyticsEventPayloadValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export type AnalyticsEventPayload = Record<
  string,
  AnalyticsEventPayloadValue | AnalyticsEventPayloadValue[]
>;

export type AnalyticsEvent = {
  name: AnalyticsEventName;
  timestamp: string;
  sessionId: string;
  payload: AnalyticsEventPayload;
};
