import type { ImageSourcePropType } from 'react-native';

import {
  getArchivedResultArtKey,
  getEventArtKey,
  getLoopArtVariant,
  getLoopSurfaceArtKey,
  getRewardPackageArtKey,
  getRouteNodeArtKey,
  type ArchivedResultArtKey,
  type EventArtKey,
  type LoopArtVariant,
  type LoopSurfaceArtKey,
  type RewardPackageArtKey,
  type RouteNodeArtKey,
} from '@/src/assets/loop-art';
import type { ProfileSettingsState } from '@/src/types/profile';
import type { ArchivedRunResult, RunNodeKind } from '@/src/types/run';

const routeNodeArtSources: Record<
  LoopArtVariant,
  Record<RouteNodeArtKey, ImageSourcePropType>
> = {
  default: {
    'route__high-risk': require('./ui/rt/png/128/route__high-risk.png'),
    'route__story-node': require('./ui/rt/png/128/route__story-node.png'),
    'route__package-node': require('./ui/rt/png/128/route__package-node.png'),
    'route__boss-floor': require('./ui/rt/png/128/route__boss-floor.png'),
  },
  mono: {
    'route__high-risk': require('./ui/rt/png/128/route__high-risk.png'),
    'route__story-node': require('./ui/rt/png/128/route__story-node.png'),
    'route__package-node': require('./ui/rt/png/128/route__package-node.png'),
    'route__boss-floor': require('./ui/rt/png/128/route__boss-floor.png'),
  },
};

const eventArtSources: Record<LoopArtVariant, Record<EventArtKey, ImageSourcePropType>> = {
  default: {
    'event-generic-backdrop': require('./ui/ev/png/256/event-generic-backdrop_default_340x180.png'),
    'warm-badges-scene': require('./ui/ev/png/256/warm-badges-scene_default_340x180.png'),
    'applause-threshold-scene': require('./ui/ev/png/256/applause-threshold-scene_default_340x180.png'),
    'career-accelerator-scene': require('./ui/ev/png/256/career-accelerator-scene_default_340x180.png'),
  },
  mono: {
    'event-generic-backdrop': require('./ui/ev/png/256/event-generic-backdrop_mono_340x180.png'),
    'warm-badges-scene': require('./ui/ev/png/256/warm-badges-scene_mono_340x180.png'),
    'applause-threshold-scene': require('./ui/ev/png/256/applause-threshold-scene_mono_340x180.png'),
    'career-accelerator-scene': require('./ui/ev/png/256/career-accelerator-scene_mono_340x180.png'),
  },
};

const rewardPackageArtSources: Record<
  LoopArtVariant,
  Record<RewardPackageArtKey, ImageSourcePropType>
> = {
  default: {
    'expense-account': require('./ui/rw/png/128/expense-account_default.png'),
    'sick-leave': require('./ui/rw/png/128/sick-leave_default.png'),
    'back-channel': require('./ui/rw/png/128/back-channel_default.png'),
    'lunch-and-learn': require('./ui/rw/png/128/lunch-and-learn_default.png'),
    'exit-package': require('./ui/rw/png/128/exit-package_default.png'),
  },
  mono: {
    'expense-account': require('./ui/rw/png/128/expense-account_mono.png'),
    'sick-leave': require('./ui/rw/png/128/sick-leave_mono.png'),
    'back-channel': require('./ui/rw/png/128/back-channel_mono.png'),
    'lunch-and-learn': require('./ui/rw/png/128/lunch-and-learn_mono.png'),
    'exit-package': require('./ui/rw/png/128/exit-package_mono.png'),
  },
};

const archivedResultArtSources: Record<
  LoopArtVariant,
  Record<ArchivedResultArtKey, ImageSourcePropType>
> = {
  default: {
    'status__hyped': require('./ui/rt/png/128/status__hyped.png'),
    'status__under-review': require('./ui/rt/png/128/status__under-review.png'),
    'status__backlogged': require('./ui/rt/png/128/status__backlogged.png'),
  },
  mono: {
    'status__hyped': require('./ui/rt/png/128/status__hyped.png'),
    'status__under-review': require('./ui/rt/png/128/status__under-review.png'),
    'status__backlogged': require('./ui/rt/png/128/status__backlogged.png'),
  },
};

const loopSurfaceArtSources: Record<
  LoopArtVariant,
  Record<LoopSurfaceArtKey, ImageSourcePropType>
> = {
  default: {
    'core-main-shell': require('./ui/ch/png/256/core-main-shell_default_360x640.png'),
    'event-screen-panel': require('./ui/ev/png/256/event-screen-panel_default_360x640.png'),
    'reward-screen-panel': require('./ui/rw/png/256/reward-screen-panel_default_360x640.png'),
    'core-overlay-frame': require('./ui/ch/png/256/core-overlay-frame_default_360x640.png'),
  },
  mono: {
    'core-main-shell': require('./ui/ch/png/256/core-main-shell_mono_360x640.png'),
    'event-screen-panel': require('./ui/ev/png/256/event-screen-panel_mono_360x640.png'),
    'reward-screen-panel': require('./ui/rw/png/256/reward-screen-panel_mono_360x640.png'),
    'core-overlay-frame': require('./ui/ch/png/256/core-overlay-frame_mono_360x640.png'),
  },
};

function getVariantSources(settings: ProfileSettingsState) {
  return getLoopArtVariant(settings);
}

export function getRouteNodeArtSource(
  kind: RunNodeKind,
  settings: ProfileSettingsState
) {
  const variant = getVariantSources(settings);
  return routeNodeArtSources[variant][getRouteNodeArtKey(kind)];
}

export function getEventArtSource(
  eventId: string | null | undefined,
  settings: ProfileSettingsState
) {
  const variant = getVariantSources(settings);
  return eventArtSources[variant][getEventArtKey(eventId)];
}

export function getRewardPackageArtSource(
  optionId: string | null | undefined,
  settings: ProfileSettingsState
) {
  const key = getRewardPackageArtKey(optionId);

  if (!key) {
    return null;
  }

  const variant = getVariantSources(settings);
  return rewardPackageArtSources[variant][key];
}

export function getArchivedResultArtSource(
  result: ArchivedRunResult,
  settings: ProfileSettingsState
) {
  const variant = getVariantSources(settings);
  return archivedResultArtSources[variant][getArchivedResultArtKey(result)];
}

export function getLoopSurfaceArtSource(
  surface: 'run-map' | 'event' | 'reward' | 'end-run',
  settings: ProfileSettingsState
) {
  const variant = getVariantSources(settings);
  return loopSurfaceArtSources[variant][getLoopSurfaceArtKey(surface)];
}
