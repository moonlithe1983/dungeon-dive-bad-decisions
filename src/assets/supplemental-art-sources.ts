import type { ImageSourcePropType } from 'react-native';

import { getLoopArtVariant } from '@/src/assets/loop-art';
import type { ArchivedRunResult } from '@/src/types/run';
import type { ProfileSettingsState } from '@/src/types/profile';

const classEmblemArtSources = {
  default: {
    'it-support': require('./ui/cl/png/128/it-support_default.png'),
    'human-resources': require('./ui/cl/png/128/human-resources_default.png'),
    finance: require('./ui/cl/png/128/finance_default.png'),
    compliance: require('./ui/cl/png/128/compliance_default.png'),
    operations: require('./ui/cl/png/128/operations_default.png'),
  },
  mono: {
    'it-support': require('./ui/cl/png/128/it-support_mono.png'),
    'human-resources': require('./ui/cl/png/128/human-resources_mono.png'),
    finance: require('./ui/cl/png/128/finance_mono.png'),
    compliance: require('./ui/cl/png/128/compliance_mono.png'),
    operations: require('./ui/cl/png/128/operations_mono.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const companionCardArtSources = {
  default: {
    'facilities-goblin': require('./art/cp/png/card/facilities-goblin_card_default_300x220.png'),
    'former-executive-assistant': require('./art/cp/png/card/former-executive-assistant_card_default_300x220.png'),
    'security-skeleton': require('./art/cp/png/card/security-skeleton_card_default_300x220.png'),
  },
  mono: {
    'facilities-goblin': require('./art/cp/png/card/facilities-goblin_card_mono_300x220.png'),
    'former-executive-assistant': require('./art/cp/png/card/former-executive-assistant_card_mono_300x220.png'),
    'security-skeleton': require('./art/cp/png/card/security-skeleton_card_mono_300x220.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const companionHeaderArtSources = {
  default: {
    'facilities-goblin': require('./art/cp/png/header/facilities-goblin_header_default_1080x220.png'),
    'former-executive-assistant': require('./art/cp/png/header/former-executive-assistant_header_default_1080x220.png'),
    'security-skeleton': require('./art/cp/png/header/security-skeleton_header_default_1080x220.png'),
  },
  mono: {
    'facilities-goblin': require('./art/cp/png/header/facilities-goblin_header_mono_1080x220.png'),
    'former-executive-assistant': require('./art/cp/png/header/former-executive-assistant_header_mono_1080x220.png'),
    'security-skeleton': require('./art/cp/png/header/security-skeleton_header_mono_1080x220.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const enemyHeaderArtSources = {
  default: {
    'applause-drone': require('./art/eh/png/compact/applause-drone_header_default_360x74.png'),
    'badge-clerk': require('./art/eh/png/compact/badge-clerk_header_default_360x74.png'),
    'corrective-usher': require('./art/eh/png/compact/corrective-usher_header_default_360x74.png'),
    'queue-leech': require('./art/eh/png/compact/queue-leech_header_default_360x74.png'),
    'kpi-penitent': require('./art/eh/png/compact/kpi-penitent_header_default_360x74.png'),
    'hold-music-revenant': require('./art/eh/png/compact/hold-music-revenant_header_default_360x74.png'),
    'toner-seraph': require('./art/eh/png/compact/toner-seraph_header_default_360x74.png'),
    'proxy-notary': require('./art/eh/png/compact/proxy-notary_header_default_360x74.png'),
    'investor-smile': require('./art/eh/png/compact/investor-smile_header_default_360x74.png'),
    'quorum-bailiff': require('./art/eh/png/compact/quorum-bailiff_header_default_360x74.png'),
  },
  mono: {
    'applause-drone': require('./art/eh/png/compact/applause-drone_header_mono_360x74.png'),
    'badge-clerk': require('./art/eh/png/compact/badge-clerk_header_mono_360x74.png'),
    'corrective-usher': require('./art/eh/png/compact/corrective-usher_header_mono_360x74.png'),
    'queue-leech': require('./art/eh/png/compact/queue-leech_header_mono_360x74.png'),
    'kpi-penitent': require('./art/eh/png/compact/kpi-penitent_header_mono_360x74.png'),
    'hold-music-revenant': require('./art/eh/png/compact/hold-music-revenant_header_mono_360x74.png'),
    'toner-seraph': require('./art/eh/png/compact/toner-seraph_header_mono_360x74.png'),
    'proxy-notary': require('./art/eh/png/compact/proxy-notary_header_mono_360x74.png'),
    'investor-smile': require('./art/eh/png/compact/investor-smile_header_mono_360x74.png'),
    'quorum-bailiff': require('./art/eh/png/compact/quorum-bailiff_header_mono_360x74.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const enemyIntroArtSources = {
  default: {
    'applause-drone': require('./art/eh/png/compact/applause-drone_intro_default_360x106.png'),
    'badge-clerk': require('./art/eh/png/compact/badge-clerk_intro_default_360x106.png'),
    'corrective-usher': require('./art/eh/png/compact/corrective-usher_intro_default_360x106.png'),
    'queue-leech': require('./art/eh/png/compact/queue-leech_intro_default_360x106.png'),
    'kpi-penitent': require('./art/eh/png/compact/kpi-penitent_intro_default_360x106.png'),
    'hold-music-revenant': require('./art/eh/png/compact/hold-music-revenant_intro_default_360x106.png'),
    'toner-seraph': require('./art/eh/png/compact/toner-seraph_intro_default_360x106.png'),
    'proxy-notary': require('./art/eh/png/compact/proxy-notary_intro_default_360x106.png'),
    'investor-smile': require('./art/eh/png/compact/investor-smile_intro_default_360x106.png'),
    'quorum-bailiff': require('./art/eh/png/compact/quorum-bailiff_intro_default_360x106.png'),
  },
  mono: {
    'applause-drone': require('./art/eh/png/compact/applause-drone_intro_mono_360x106.png'),
    'badge-clerk': require('./art/eh/png/compact/badge-clerk_intro_mono_360x106.png'),
    'corrective-usher': require('./art/eh/png/compact/corrective-usher_intro_mono_360x106.png'),
    'queue-leech': require('./art/eh/png/compact/queue-leech_intro_mono_360x106.png'),
    'kpi-penitent': require('./art/eh/png/compact/kpi-penitent_intro_mono_360x106.png'),
    'hold-music-revenant': require('./art/eh/png/compact/hold-music-revenant_intro_mono_360x106.png'),
    'toner-seraph': require('./art/eh/png/compact/toner-seraph_intro_mono_360x106.png'),
    'proxy-notary': require('./art/eh/png/compact/proxy-notary_intro_mono_360x106.png'),
    'investor-smile': require('./art/eh/png/compact/investor-smile_intro_mono_360x106.png'),
    'quorum-bailiff': require('./art/eh/png/compact/quorum-bailiff_intro_mono_360x106.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const minibossHeaderArtSources = {
  default: {
    'audience-warm-up-manager': require('./art/mh/png/compact/audience-warm-up-manager_header_default_360x74.png'),
    'incentive-podium': require('./art/mh/png/compact/incentive-podium_header_default_360x74.png'),
    'lunch-break-denial-engine': require('./art/mh/png/compact/lunch-break-denial-engine_header_default_360x74.png'),
    'calibration-committee': require('./art/mh/png/compact/calibration-committee_header_default_360x74.png'),
    'investor-relations-avatar': require('./art/mh/png/compact/investor-relations-avatar_header_default_360x74.png'),
  },
  mono: {
    'audience-warm-up-manager': require('./art/mh/png/compact/audience-warm-up-manager_header_mono_360x74.png'),
    'incentive-podium': require('./art/mh/png/compact/incentive-podium_header_mono_360x74.png'),
    'lunch-break-denial-engine': require('./art/mh/png/compact/lunch-break-denial-engine_header_mono_360x74.png'),
    'calibration-committee': require('./art/mh/png/compact/calibration-committee_header_mono_360x74.png'),
    'investor-relations-avatar': require('./art/mh/png/compact/investor-relations-avatar_header_mono_360x74.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const minibossIntroArtSources = {
  default: {
    'audience-warm-up-manager': require('./art/mh/png/compact/audience-warm-up-manager_intro_default_360x106.png'),
    'incentive-podium': require('./art/mh/png/compact/incentive-podium_intro_default_360x106.png'),
    'lunch-break-denial-engine': require('./art/mh/png/compact/lunch-break-denial-engine_intro_default_360x106.png'),
    'calibration-committee': require('./art/mh/png/compact/calibration-committee_intro_default_360x106.png'),
    'investor-relations-avatar': require('./art/mh/png/compact/investor-relations-avatar_intro_default_360x106.png'),
  },
  mono: {
    'audience-warm-up-manager': require('./art/mh/png/compact/audience-warm-up-manager_intro_mono_360x106.png'),
    'incentive-podium': require('./art/mh/png/compact/incentive-podium_intro_mono_360x106.png'),
    'lunch-break-denial-engine': require('./art/mh/png/compact/lunch-break-denial-engine_intro_mono_360x106.png'),
    'calibration-committee': require('./art/mh/png/compact/calibration-committee_intro_mono_360x106.png'),
    'investor-relations-avatar': require('./art/mh/png/compact/investor-relations-avatar_intro_mono_360x106.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const bossHeaderArtSources = {
  default: {
    'boss-director-onboarding': require('./art/bh/png/compact/boss-director-onboarding-header_default_360x140.png'),
    'boss-vp-throughput': require('./art/bh/png/compact/boss-vp-throughput-header_default_360x140.png'),
    'boss-everrise-board': require('./art/bh/png/compact/boss-everrise-board-header_default_360x140.png'),
  },
  mono: {
    'boss-director-onboarding': require('./art/bh/png/compact/boss-director-onboarding-header_mono_360x140.png'),
    'boss-vp-throughput': require('./art/bh/png/compact/boss-vp-throughput-header_mono_360x140.png'),
    'boss-everrise-board': require('./art/bh/png/compact/boss-everrise-board-header_mono_360x140.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const bossArchiveArtSources = {
  default: {
    'boss-director-onboarding': require('./art/bh/png/banner/boss-director-onboarding-archive_default_1080x420.png'),
    'boss-vp-throughput': require('./art/bh/png/banner/boss-vp-throughput-archive_default_1080x420.png'),
    'boss-everrise-board': require('./art/bh/png/banner/boss-everrise-board-archive_default_1080x420.png'),
  },
  mono: {
    'boss-director-onboarding': require('./art/bh/png/banner/boss-director-onboarding-archive_mono_1080x420.png'),
    'boss-vp-throughput': require('./art/bh/png/banner/boss-vp-throughput-archive_mono_1080x420.png'),
    'boss-everrise-board': require('./art/bh/png/banner/boss-everrise-board-archive_mono_1080x420.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const endingHeaderArtSources = {
  default: {
    'full-exposure': require('./art/er/png/header/full-exposure_ending-header_default_1080x220.png'),
    'controlled-detonation': require('./art/er/png/header/controlled-detonation_ending-header_default_1080x220.png'),
    'partial-exposure': require('./art/er/png/header/partial-exposure_ending-header_default_1080x220.png'),
    'licensed-survival': require('./art/er/png/header/licensed-survival_ending-header_default_1080x220.png'),
    'quiet-survival': require('./art/er/png/header/quiet-survival_ending-header_default_1080x220.png'),
  },
  mono: {
    'full-exposure': require('./art/er/png/header/full-exposure_ending-header_mono_1080x220.png'),
    'controlled-detonation': require('./art/er/png/header/controlled-detonation_ending-header_mono_1080x220.png'),
    'partial-exposure': require('./art/er/png/header/partial-exposure_ending-header_mono_1080x220.png'),
    'licensed-survival': require('./art/er/png/header/licensed-survival_ending-header_mono_1080x220.png'),
    'quiet-survival': require('./art/er/png/header/quiet-survival_ending-header_mono_1080x220.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const endingRecapPanelArtSources = {
  default: {
    'full-exposure': require('./art/er/png/panel/full-exposure-recap_recap-panel_default_1080x320.png'),
    'controlled-detonation': require('./art/er/png/panel/controlled-detonation-recap_recap-panel_default_1080x320.png'),
    'partial-exposure': require('./art/er/png/panel/partial-exposure-recap_recap-panel_default_1080x320.png'),
    'licensed-survival': require('./art/er/png/panel/licensed-survival-recap_recap-panel_default_1080x320.png'),
    'quiet-survival': require('./art/er/png/panel/quiet-survival-recap_recap-panel_default_1080x320.png'),
  },
  mono: {
    'full-exposure': require('./art/er/png/panel/full-exposure-recap_recap-panel_mono_1080x320.png'),
    'controlled-detonation': require('./art/er/png/panel/controlled-detonation-recap_recap-panel_mono_1080x320.png'),
    'partial-exposure': require('./art/er/png/panel/partial-exposure-recap_recap-panel_mono_1080x320.png'),
    'licensed-survival': require('./art/er/png/panel/licensed-survival-recap_recap-panel_mono_1080x320.png'),
    'quiet-survival': require('./art/er/png/panel/quiet-survival-recap_recap-panel_mono_1080x320.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const bondPairHeaderArtSources = {
  default: {
    'facilities-goblin__former-executive-assistant': require('./art/bd/png/compact/bond-facilities-goblin-former-executive-assistant_header_default_360x74.png'),
    'facilities-goblin__security-skeleton': require('./art/bd/png/compact/bond-facilities-goblin-security-skeleton_header_default_360x74.png'),
    'former-executive-assistant__security-skeleton': require('./art/bd/png/compact/bond-former-executive-assistant-security-skeleton_header_default_360x74.png'),
  },
  mono: {
    'facilities-goblin__former-executive-assistant': require('./art/bd/png/compact/bond-facilities-goblin-former-executive-assistant_header_mono_360x74.png'),
    'facilities-goblin__security-skeleton': require('./art/bd/png/compact/bond-facilities-goblin-security-skeleton_header_mono_360x74.png'),
    'former-executive-assistant__security-skeleton': require('./art/bd/png/compact/bond-former-executive-assistant-security-skeleton_header_mono_360x74.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const bondPairPanelArtSources = {
  default: {
    'facilities-goblin__former-executive-assistant': require('./art/bd/png/compact/bond-facilities-goblin-former-executive-assistant_panel_default_360x106.png'),
    'facilities-goblin__security-skeleton': require('./art/bd/png/compact/bond-facilities-goblin-security-skeleton_panel_default_360x106.png'),
    'former-executive-assistant__security-skeleton': require('./art/bd/png/compact/bond-former-executive-assistant-security-skeleton_panel_default_360x106.png'),
  },
  mono: {
    'facilities-goblin__former-executive-assistant': require('./art/bd/png/compact/bond-facilities-goblin-former-executive-assistant_panel_mono_360x106.png'),
    'facilities-goblin__security-skeleton': require('./art/bd/png/compact/bond-facilities-goblin-security-skeleton_panel_mono_360x106.png'),
    'former-executive-assistant__security-skeleton': require('./art/bd/png/compact/bond-former-executive-assistant-security-skeleton_panel_mono_360x106.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const biomeAmbientArtSources = {
  'orientation-arcade': require('./art/bg/png/360x640/biome-orientation-arcade-bg_360x640.png'),
  'throughput-maze': require('./art/bg/png/360x640/biome-throughput-maze-bg_360x640.png'),
  'executive-apex': require('./art/bg/png/360x640/biome-executive-apex-bg_360x640.png'),
} as const satisfies Record<string, ImageSourcePropType>;

const floorBadgeArtSources = {
  default: {
    1: require('./ui/fl/png/badge/floor-01-welcome_badge_default_256x96.png'),
    2: require('./ui/fl/png/badge/floor-02-audience_badge_default_256x96.png'),
    3: require('./ui/fl/png/badge/floor-03-performance_badge_default_256x96.png'),
    4: require('./ui/fl/png/badge/floor-04-corrective_badge_default_256x96.png'),
    5: require('./ui/fl/png/badge/floor-05-cubicle_badge_default_256x96.png'),
    6: require('./ui/fl/png/badge/floor-06-variance_badge_default_256x96.png'),
    7: require('./ui/fl/png/badge/floor-07-quarterly_badge_default_256x96.png'),
    8: require('./ui/fl/png/badge/floor-08-marble_badge_default_256x96.png'),
    9: require('./ui/fl/png/badge/floor-09-consensus-garden_badge_default_256x96.png'),
    10: require('./ui/fl/png/badge/floor-10-consensus-engine_badge_default_256x96.png'),
  },
  mono: {
    1: require('./ui/fl/png/badge/floor-01-welcome_badge_mono_256x96.png'),
    2: require('./ui/fl/png/badge/floor-02-audience_badge_mono_256x96.png'),
    3: require('./ui/fl/png/badge/floor-03-performance_badge_mono_256x96.png'),
    4: require('./ui/fl/png/badge/floor-04-corrective_badge_mono_256x96.png'),
    5: require('./ui/fl/png/badge/floor-05-cubicle_badge_mono_256x96.png'),
    6: require('./ui/fl/png/badge/floor-06-variance_badge_mono_256x96.png'),
    7: require('./ui/fl/png/badge/floor-07-quarterly_badge_mono_256x96.png'),
    8: require('./ui/fl/png/badge/floor-08-marble_badge_mono_256x96.png'),
    9: require('./ui/fl/png/badge/floor-09-consensus-garden_badge_mono_256x96.png'),
    10: require('./ui/fl/png/badge/floor-10-consensus-engine_badge_mono_256x96.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<number, ImageSourcePropType>>;

const floorHeaderArtSources = {
  default: {
    1: require('./ui/fl/png/header/floor-01-welcome_header_default_1080x220.png'),
    2: require('./ui/fl/png/header/floor-02-audience_header_default_1080x220.png'),
    3: require('./ui/fl/png/header/floor-03-performance_header_default_1080x220.png'),
    4: require('./ui/fl/png/header/floor-04-corrective_header_default_1080x220.png'),
    5: require('./ui/fl/png/header/floor-05-cubicle_header_default_1080x220.png'),
    6: require('./ui/fl/png/header/floor-06-variance_header_default_1080x220.png'),
    7: require('./ui/fl/png/header/floor-07-quarterly_header_default_1080x220.png'),
    8: require('./ui/fl/png/header/floor-08-marble_header_default_1080x220.png'),
    9: require('./ui/fl/png/header/floor-09-consensus-garden_header_default_1080x220.png'),
    10: require('./ui/fl/png/header/floor-10-consensus-engine_header_default_1080x220.png'),
  },
  mono: {
    1: require('./ui/fl/png/header/floor-01-welcome_header_mono_1080x220.png'),
    2: require('./ui/fl/png/header/floor-02-audience_header_mono_1080x220.png'),
    3: require('./ui/fl/png/header/floor-03-performance_header_mono_1080x220.png'),
    4: require('./ui/fl/png/header/floor-04-corrective_header_mono_1080x220.png'),
    5: require('./ui/fl/png/header/floor-05-cubicle_header_mono_1080x220.png'),
    6: require('./ui/fl/png/header/floor-06-variance_header_mono_1080x220.png'),
    7: require('./ui/fl/png/header/floor-07-quarterly_header_mono_1080x220.png'),
    8: require('./ui/fl/png/header/floor-08-marble_header_mono_1080x220.png'),
    9: require('./ui/fl/png/header/floor-09-consensus-garden_header_mono_1080x220.png'),
    10: require('./ui/fl/png/header/floor-10-consensus-engine_header_mono_1080x220.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<number, ImageSourcePropType>>;

const floorActHeaderArtSources = {
  default: {
    'orientation-arcade': require('./ui/fl/png/header/biome-orientation-arcade_act-header_default_1080x220.png'),
    'throughput-maze': require('./ui/fl/png/header/biome-throughput-maze_act-header_default_1080x220.png'),
    'executive-apex': require('./ui/fl/png/header/biome-executive-apex_act-header_default_1080x220.png'),
  },
  mono: {
    'orientation-arcade': require('./ui/fl/png/header/biome-orientation-arcade_act-header_mono_1080x220.png'),
    'throughput-maze': require('./ui/fl/png/header/biome-throughput-maze_act-header_mono_1080x220.png'),
    'executive-apex': require('./ui/fl/png/header/biome-executive-apex_act-header_mono_1080x220.png'),
  },
} as const satisfies Record<'default' | 'mono', Record<string, ImageSourcePropType>>;

const classEmblemAlignment: Record<
  string,
  {
    emblemKey:
      | 'it-support'
      | 'human-resources'
      | 'finance'
      | 'compliance'
      | 'operations';
    label: string;
  }
> = {
  'it-support': {
    emblemKey: 'it-support',
    label: 'IT Support track',
  },
  'customer-service-rep': {
    emblemKey: 'human-resources',
    label: 'Human Resources track',
  },
  'sales-rep': {
    emblemKey: 'finance',
    label: 'Finance track',
  },
  intern: {
    emblemKey: 'operations',
    label: 'Operations track',
  },
  paralegal: {
    emblemKey: 'compliance',
    label: 'Compliance track',
  },
};

const endingAccentMetadata = {
  'full-exposure': {
    title: 'Full Exposure',
    archiveHeader: 'Final Record: Meridian Had the Numbers',
    recapTitle: 'Archive Recap: Exposure Won',
  },
  'controlled-detonation': {
    title: 'Controlled Detonation',
    archiveHeader: 'Final Record: Authority Helped Carry the Knife',
    recapTitle: 'Archive Recap: Permission Became the Wound',
  },
  'partial-exposure': {
    title: 'Partial Exposure',
    archiveHeader: 'Final Record: Confirmed Harm, Incomplete Chain',
    recapTitle: 'Archive Recap: The Confession Came Out Damaged',
  },
  'licensed-survival': {
    title: 'Licensed Survival',
    archiveHeader: 'Final Record: Contained Lie, Escalating Leak',
    recapTitle: 'Archive Recap: The Leak Has a Badge',
  },
  'quiet-survival': {
    title: 'Quiet Survival',
    archiveHeader: 'Final Record: Survivor Exit, Truth Deferred',
    recapTitle: 'Archive Recap: Survival Logged, Core Truth Pending',
  },
} as const;

const enemyVisualAlignment: Record<
  string,
  {
    kind: 'normal' | 'miniboss' | 'boss';
    artKey: string;
  }
> = {
  'ticket-swarm': { kind: 'normal', artKey: 'applause-drone' },
  'meeting-leech': { kind: 'normal', artKey: 'queue-leech' },
  'policy-wisp': { kind: 'normal', artKey: 'proxy-notary' },
  'budget-ghoul': { kind: 'normal', artKey: 'investor-smile' },
  'compliance-mite': { kind: 'normal', artKey: 'badge-clerk' },
  'calendar-worm': { kind: 'normal', artKey: 'hold-music-revenant' },
  'escalation-hound': { kind: 'normal', artKey: 'corrective-usher' },
  'survey-revenant': { kind: 'normal', artKey: 'kpi-penitent' },
  'vendor-shade': { kind: 'normal', artKey: 'quorum-bailiff' },
  'performance-review-slime': { kind: 'normal', artKey: 'toner-seraph' },
  'middle-manager-echo': {
    kind: 'miniboss',
    artKey: 'audience-warm-up-manager',
  },
  'procurement-horror': {
    kind: 'miniboss',
    artKey: 'calibration-committee',
  },
  'mandatory-fun-coordinator': {
    kind: 'miniboss',
    artKey: 'incentive-podium',
  },
  'legacy-system-beast': {
    kind: 'miniboss',
    artKey: 'lunch-break-denial-engine',
  },
  'payroll-abomination': {
    kind: 'miniboss',
    artKey: 'investor-relations-avatar',
  },
  'hr-compliance-director': {
    kind: 'boss',
    artKey: 'boss-director-onboarding',
  },
  'chief-synergy-officer': {
    kind: 'boss',
    artKey: 'boss-vp-throughput',
  },
  'executive-assistant-to-the-abyssal-ceo': {
    kind: 'boss',
    artKey: 'boss-everrise-board',
  },
};

function getFloorBiomeKey(floorIndex: number) {
  if (floorIndex >= 8) {
    return 'executive-apex';
  }

  if (floorIndex >= 5) {
    return 'throughput-maze';
  }

  return 'orientation-arcade';
}

function getFloorActLabel(floorIndex: number) {
  const biomeKey = getFloorBiomeKey(floorIndex);

  if (biomeKey === 'executive-apex') {
    return 'Executive Apex';
  }

  if (biomeKey === 'throughput-maze') {
    return 'Throughput Maze';
  }

  return 'Orientation Arcade';
}

function getBossArchiveArtKey(floorIndex: number) {
  if (floorIndex >= 10) {
    return 'boss-everrise-board';
  }

  if (floorIndex >= 7) {
    return 'boss-vp-throughput';
  }

  if (floorIndex >= 4) {
    return 'boss-director-onboarding';
  }

  return null;
}

function getEndingAccentKey(
  result: ArchivedRunResult,
  floorIndex: number
): keyof typeof endingAccentMetadata {
  if (result === 'abandon') {
    return 'quiet-survival';
  }

  if (result === 'win') {
    return floorIndex >= 10 ? 'full-exposure' : 'controlled-detonation';
  }

  return floorIndex >= 8 ? 'partial-exposure' : 'licensed-survival';
}

export function getClassEmblemSource(
  classId: string,
  settings: ProfileSettingsState
) {
  const variant = getLoopArtVariant(settings);
  const alignment = classEmblemAlignment[classId];

  if (!alignment) {
    return null;
  }

  return classEmblemArtSources[variant][alignment.emblemKey] ?? null;
}

export function getClassEmblemAlignmentLabel(classId: string) {
  return classEmblemAlignment[classId]?.label ?? null;
}

export function getCompanionCardArtSource(
  companionId: string,
  settings: ProfileSettingsState
) {
  const variant = getLoopArtVariant(settings);
  const sources = companionCardArtSources[variant] as Record<
    string,
    ImageSourcePropType
  >;

  return sources[companionId] ?? null;
}

export function getCompanionHeaderArtSource(
  companionId: string,
  settings: ProfileSettingsState
) {
  const variant = getLoopArtVariant(settings);
  const sources = companionHeaderArtSources[variant] as Record<
    string,
    ImageSourcePropType
  >;

  return sources[companionId] ?? null;
}

export function getEncounterVisualAlignmentLabel(enemyId: string) {
  const alignment = enemyVisualAlignment[enemyId];

  if (!alignment) {
    return null;
  }

  if (alignment.kind === 'boss') {
    return 'Executive boss archive alignment';
  }

  if (alignment.kind === 'miniboss') {
    return 'Miniboss overlay alignment';
  }

  return 'Enemy overlay alignment';
}

export function getEncounterArtSources(
  enemyId: string | null | undefined,
  settings: ProfileSettingsState
) {
  if (!enemyId) {
    return null;
  }

  const variant = getLoopArtVariant(settings);
  const alignment = enemyVisualAlignment[enemyId];

  if (!alignment) {
    return null;
  }

  if (alignment.kind === 'boss') {
    const headerSources = bossHeaderArtSources[variant] as Record<
      string,
      ImageSourcePropType
    >;

    return {
      headerSource: headerSources[alignment.artKey] ?? null,
      introSource: null,
    };
  }

  if (alignment.kind === 'miniboss') {
    const headerSources = minibossHeaderArtSources[variant] as Record<
      string,
      ImageSourcePropType
    >;
    const introSources = minibossIntroArtSources[variant] as Record<
      string,
      ImageSourcePropType
    >;

    return {
      headerSource: headerSources[alignment.artKey] ?? null,
      introSource: introSources[alignment.artKey] ?? null,
    };
  }

  const headerSources = enemyHeaderArtSources[variant] as Record<
    string,
    ImageSourcePropType
  >;
  const introSources = enemyIntroArtSources[variant] as Record<
    string,
    ImageSourcePropType
  >;

  return {
    headerSource: headerSources[alignment.artKey] ?? null,
    introSource: introSources[alignment.artKey] ?? null,
  };
}

export function getBondPairArchiveArtSources(
  pairId: string,
  settings: ProfileSettingsState
) {
  const variant = getLoopArtVariant(settings);
  const headerSources = bondPairHeaderArtSources[variant] as Record<
    string,
    ImageSourcePropType
  >;
  const panelSources = bondPairPanelArtSources[variant] as Record<
    string,
    ImageSourcePropType
  >;

  return {
    headerSource: headerSources[pairId] ?? null,
    panelSource: panelSources[pairId] ?? null,
  };
}

export function getBossArchiveArtSource(
  floorIndex: number | null | undefined,
  settings: ProfileSettingsState
) {
  if (!floorIndex) {
    return null;
  }

  const artKey = getBossArchiveArtKey(floorIndex);

  if (!artKey) {
    return null;
  }

  const variant = getLoopArtVariant(settings);
  return bossArchiveArtSources[variant][artKey] ?? null;
}

export function getEndingAccentArtSources(
  result: ArchivedRunResult | null | undefined,
  floorIndex: number | null | undefined,
  settings: ProfileSettingsState
) {
  if (!result || !floorIndex) {
    return null;
  }

  const variant = getLoopArtVariant(settings);
  const endingKey = getEndingAccentKey(result, floorIndex);
  const metadata = endingAccentMetadata[endingKey];

  return {
    endingKey,
    title: metadata.title,
    archiveHeader: metadata.archiveHeader,
    recapTitle: metadata.recapTitle,
    headerSource: endingHeaderArtSources[variant][endingKey] ?? null,
    recapPanelSource: endingRecapPanelArtSources[variant][endingKey] ?? null,
  };
}

export function getFloorBadgeArtSource(
  floorIndex: number | null | undefined,
  settings: ProfileSettingsState
) {
  if (!floorIndex) {
    return null;
  }

  const variant = getLoopArtVariant(settings);
  const sources = floorBadgeArtSources[variant] as Record<
    number,
    ImageSourcePropType
  >;

  return sources[floorIndex] ?? null;
}

export function getFloorHeaderArtSource(
  floorIndex: number | null | undefined,
  settings: ProfileSettingsState
) {
  if (!floorIndex) {
    return null;
  }

  const variant = getLoopArtVariant(settings);
  const sources = floorHeaderArtSources[variant] as Record<
    number,
    ImageSourcePropType
  >;

  return sources[floorIndex] ?? null;
}

export function getFloorActHeaderSource(
  floorIndex: number | null | undefined,
  settings: ProfileSettingsState
) {
  if (!floorIndex) {
    return null;
  }

  const variant = getLoopArtVariant(settings);
  return floorActHeaderArtSources[variant][getFloorBiomeKey(floorIndex)] ?? null;
}

export function getFloorActLabelForIndex(floorIndex: number | null | undefined) {
  if (!floorIndex) {
    return null;
  }

  return getFloorActLabel(floorIndex);
}

export function getBiomeAmbientArtSource(
  floorIndex: number | null | undefined,
  settings: ProfileSettingsState
) {
  if (!floorIndex || settings.highContrastEnabled) {
    return null;
  }

  return biomeAmbientArtSources[getFloorBiomeKey(floorIndex)] ?? null;
}
