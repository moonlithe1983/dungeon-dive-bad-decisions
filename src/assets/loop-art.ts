import type { ProfileSettingsState } from '@/src/types/profile';
import type { ArchivedRunResult, RunNodeKind } from '@/src/types/run';

export type LoopArtVariant = 'default' | 'mono';

export type RouteNodeArtKey =
  | 'route__high-risk'
  | 'route__story-node'
  | 'route__package-node'
  | 'route__boss-floor';

export type EventArtKey =
  | 'event-generic-backdrop'
  | 'warm-badges-scene'
  | 'applause-threshold-scene'
  | 'career-accelerator-scene';

export type RewardPackageArtKey =
  | 'expense-account'
  | 'sick-leave'
  | 'back-channel'
  | 'lunch-and-learn'
  | 'exit-package';

export type ArchivedResultArtKey =
  | 'status__hyped'
  | 'status__under-review'
  | 'status__backlogged';

export type LoopSurfaceArtKey =
  | 'core-main-shell'
  | 'event-screen-panel'
  | 'reward-screen-panel'
  | 'core-overlay-frame';

export function getLoopArtVariant(settings: ProfileSettingsState): LoopArtVariant {
  return settings.highContrastEnabled || settings.themePreset === 'ada-contrast'
    ? 'mono'
    : 'default';
}

export function getRouteNodeArtKey(kind: RunNodeKind): RouteNodeArtKey {
  if (kind === 'event') {
    return 'route__story-node';
  }

  if (kind === 'reward') {
    return 'route__package-node';
  }

  if (kind === 'boss') {
    return 'route__boss-floor';
  }

  return 'route__high-risk';
}

export function getEventArtKey(eventId: string | null | undefined): EventArtKey {
  if (eventId === 'unsafe-team-building') {
    return 'warm-badges-scene';
  }

  if (eventId === 'mandatory-feedback-loop') {
    return 'applause-threshold-scene';
  }

  if (eventId === 'suspicious-elevator-pitch') {
    return 'career-accelerator-scene';
  }

  return 'event-generic-backdrop';
}

export function getRewardPackageArtKey(
  optionId: string | null | undefined
): RewardPackageArtKey | null {
  if (!optionId) {
    return null;
  }

  if (
    optionId === 'expense-fraud' ||
    optionId === 'per-diem-skimming' ||
    optionId === 'black-card-overage'
  ) {
    return 'expense-account';
  }

  if (
    optionId === 'triage-cart' ||
    optionId === 'wellness-cooler' ||
    optionId === 'concierge-crash-cart'
  ) {
    return 'sick-leave';
  }

  if (optionId === 'contraband-locker') {
    return 'back-channel';
  }

  if (optionId === 'swag-bag-heist') {
    return 'lunch-and-learn';
  }

  if (optionId === 'golden-parachute-cache') {
    return 'exit-package';
  }

  return null;
}

export function getArchivedResultArtKey(result: ArchivedRunResult): ArchivedResultArtKey {
  if (result === 'win') {
    return 'status__hyped';
  }

  if (result === 'abandon') {
    return 'status__backlogged';
  }

  return 'status__under-review';
}

export function getLoopSurfaceArtKey(
  surface: 'run-map' | 'event' | 'reward' | 'end-run'
): LoopSurfaceArtKey {
  if (surface === 'event') {
    return 'event-screen-panel';
  }

  if (surface === 'reward') {
    return 'reward-screen-panel';
  }

  if (surface === 'end-run') {
    return 'core-overlay-frame';
  }

  return 'core-main-shell';
}
