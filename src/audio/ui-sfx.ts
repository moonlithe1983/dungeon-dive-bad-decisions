import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from 'expo-audio';

import type { ProfileSettingsState } from '@/src/types/profile';

type UiSfxId =
  | 'route-select'
  | 'reward-reveal'
  | 'reward-claim'
  | 'event-open'
  | 'event-confirm'
  | 'invalid-tap'
  | 'boss-warning'
  | 'recap-sting';

const uiSfxSources: Record<UiSfxId, number> = {
  'route-select': require('../assets/audio/ui/wav/ui_route_select.wav'),
  'reward-reveal': require('../assets/audio/ui/wav/ui_reward_reveal.wav'),
  'reward-claim': require('../assets/audio/ui/wav/ui_reward_claim.wav'),
  'event-open': require('../assets/audio/ui/wav/ui_event_open.wav'),
  'event-confirm': require('../assets/audio/ui/wav/ui_event_confirm.wav'),
  'invalid-tap': require('../assets/audio/ui/wav/ui_invalid_tap.wav'),
  'boss-warning': require('../assets/audio/ui/wav/ui_boss_warning.wav'),
  'recap-sting': require('../assets/audio/ui/wav/ui_recap_sting.wav'),
};

const uiSfxVolumes: Record<UiSfxId, number> = {
  'route-select': 0.5,
  'reward-reveal': 0.58,
  'reward-claim': 0.6,
  'event-open': 0.54,
  'event-confirm': 0.5,
  'invalid-tap': 0.48,
  'boss-warning': 0.64,
  'recap-sting': 0.56,
};

const playerCache = new Map<UiSfxId, ReturnType<typeof createAudioPlayer>>();
let audioReadyPromise: Promise<void> | null = null;

async function ensureAudioReadyAsync() {
  if (!audioReadyPromise) {
    audioReadyPromise = (async () => {
      await setAudioModeAsync({
        playsInSilentMode: false,
        interruptionMode: 'mixWithOthers',
        allowsRecording: false,
        shouldPlayInBackground: false,
      });
      await setIsAudioActiveAsync(true);
    })().catch((error) => {
      audioReadyPromise = null;
      throw error;
    });
  }

  await audioReadyPromise;
}

function getPlayer(effectId: UiSfxId) {
  const cachedPlayer = playerCache.get(effectId);

  if (cachedPlayer) {
    return cachedPlayer;
  }

  const player = createAudioPlayer(uiSfxSources[effectId], {
    keepAudioSessionActive: false,
  });
  player.volume = uiSfxVolumes[effectId];
  playerCache.set(effectId, player);
  return player;
}

export async function setUiSfxEnabledAsync(enabled: boolean) {
  try {
    if (!enabled) {
      playerCache.forEach((player) => {
        if (player.playing) {
          player.pause();
        }
      });
    }

    await setIsAudioActiveAsync(enabled);
  } catch (error) {
    console.warn('Failed to update UI audio state', error);
  }
}

export async function playUiSfx(
  effectId: UiSfxId,
  settings: Pick<
    ProfileSettingsState,
    'sfxEnabled' | 'masterVolume' | 'sfxVolume'
  >
) {
  if (!settings.sfxEnabled) {
    return;
  }

  try {
    await ensureAudioReadyAsync();

    const player = getPlayer(effectId);
    const effectiveVolume =
      uiSfxVolumes[effectId] *
      (settings.masterVolume / 100) *
      (settings.sfxVolume / 100);

    if (effectiveVolume <= 0) {
      return;
    }

    player.volume = effectiveVolume;

    if (player.playing) {
      player.pause();
    }

    await player.seekTo(0);
    player.play();
  } catch (error) {
    console.warn(`Failed to play UI SFX "${effectId}"`, error);
  }
}
