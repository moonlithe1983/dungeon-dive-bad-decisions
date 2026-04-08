import type {
  ProfileSettingsState,
  TextSizeSetting,
  ThemePresetId,
} from '@/src/types/profile';
import { DEFAULT_PROFILE_SETTINGS } from '@/src/types/profile';
import { useProfileStore } from '@/src/state/profileStore';
import { useSystemAccessibilityStore } from '@/src/state/systemAccessibilityStore';
import { useWindowDimensions } from 'react-native';

export type AppPalette = {
  background: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textSubtle: string;
  buttonText: string;
  buttonDisabled: string;
  error: string;
  errorMuted: string;
};

type ThemePresetDefinition = {
  id: ThemePresetId;
  name: string;
  description: string;
  palette: AppPalette;
};

const themePresetDefinitions: ThemePresetDefinition[] = [
  {
    id: 'corporate-hell',
    name: 'Corporate Hell',
    description: 'Gold accents over bruised charcoal for the default descent.',
    palette: {
      background: '#0b0d10',
      surface: '#11151b',
      surfaceRaised: '#171d25',
      border: '#262f39',
      borderStrong: '#2b3440',
      accent: '#f4d35e',
      textPrimary: '#f8fafc',
      textSecondary: '#d7dee7',
      textMuted: '#b1bcc8',
      textSubtle: '#93a4b5',
      buttonText: '#17120a',
      buttonDisabled: '#495463',
      error: '#ff9d9d',
      errorMuted: '#e7b4b4',
    },
  },
  {
    id: 'amber-terminal',
    name: 'Amber Terminal',
    description: 'Warmer amber console tones with clearer system contrast.',
    palette: {
      background: '#0a0b0d',
      surface: '#10151a',
      surfaceRaised: '#171f26',
      border: '#34414b',
      borderStrong: '#42515d',
      accent: '#ffbf47',
      textPrimary: '#f7f4ea',
      textSecondary: '#ddd6c5',
      textMuted: '#c4bca8',
      textSubtle: '#9a927d',
      buttonText: '#160f04',
      buttonDisabled: '#55616d',
      error: '#ffb4a2',
      errorMuted: '#ecc3bc',
    },
  },
  {
    id: 'night-shift',
    name: 'Night Shift',
    description: 'Cooler blue-cyan UI for longer sessions and clearer edges.',
    palette: {
      background: '#081018',
      surface: '#0f1823',
      surfaceRaised: '#152131',
      border: '#23364b',
      borderStrong: '#2d4560',
      accent: '#7bdff2',
      textPrimary: '#f2fbff',
      textSecondary: '#d4e7ef',
      textMuted: '#a9c2cf',
      textSubtle: '#84a0af',
      buttonText: '#071218',
      buttonDisabled: '#456170',
      error: '#ffb3c1',
      errorMuted: '#e6bcc6',
    },
  },
  {
    id: 'ada-contrast',
    name: 'ADA Contrast',
    description: 'High-contrast surfaces and strong accent separation.',
    palette: {
      background: '#050607',
      surface: '#0b0d10',
      surfaceRaised: '#11151a',
      border: '#6f7f91',
      borderStrong: '#92a7bf',
      accent: '#ffd84d',
      textPrimary: '#ffffff',
      textSecondary: '#f2f7fb',
      textMuted: '#d5dce4',
      textSubtle: '#b8c5d3',
      buttonText: '#0a0a0a',
      buttonDisabled: '#56606d',
      error: '#ffb0b0',
      errorMuted: '#f3caca',
    },
  },
];

const themePresetMap = Object.fromEntries(
  themePresetDefinitions.map((preset) => [preset.id, preset])
) as Record<ThemePresetId, ThemePresetDefinition>;

export function getThemePresetDefinitions() {
  return themePresetDefinitions;
}

export function getThemePresetName(themePreset: ThemePresetId) {
  return themePresetMap[themePreset]?.name ?? themePresetMap['corporate-hell'].name;
}

function getTextScale(textSize: TextSizeSetting) {
  if (textSize === 'largest') {
    return 1.22;
  }

  if (textSize === 'large') {
    return 1.1;
  }

  return 1;
}

function getMaxFontSizeMultiplier(textSize: TextSizeSetting, fontScale: number) {
  const configuredMaximum =
    textSize === 'largest' ? 3.6 : textSize === 'large' ? 3.1 : 2.6;

  return Math.max(configuredMaximum, fontScale);
}

function resolveBasePalette(themePreset: ThemePresetId) {
  return themePresetMap[themePreset]?.palette ?? themePresetMap['corporate-hell'].palette;
}

export function resolveAppPalette(settings: ProfileSettingsState): AppPalette {
  const basePalette = resolveBasePalette(settings.themePreset);

  if (settings.highContrastEnabled && settings.themePreset !== 'ada-contrast') {
    return {
      ...themePresetMap['ada-contrast'].palette,
      accent: settings.colorAssistEnabled ? '#8bd3ff' : '#ffd84d',
    };
  }

  if (settings.colorAssistEnabled) {
    return {
      ...basePalette,
      accent: settings.themePreset === 'amber-terminal' ? '#8bd3ff' : '#ffcf66',
      error: '#ffb8a6',
      errorMuted: '#efd0c6',
    };
  }

  return basePalette;
}

export function getReadableMetrics(
  settings: ProfileSettingsState,
  fontScale = 1
) {
  return {
    textScale: getTextScale(settings.textSize),
    lineHeightScale: settings.dyslexiaAssistEnabled ? 1.18 : 1,
    letterSpacing: settings.dyslexiaAssistEnabled ? 0.18 : 0,
    maxFontSizeMultiplier: getMaxFontSizeMultiplier(settings.textSize, fontScale),
  };
}

export function scaleFontSize(baseSize: number, settings: ProfileSettingsState) {
  return Math.round(baseSize * getReadableMetrics(settings).textScale);
}

export function scaleLineHeight(baseLineHeight: number, settings: ProfileSettingsState) {
  const metrics = getReadableMetrics(settings);
  return Math.round(baseLineHeight * metrics.textScale * metrics.lineHeightScale);
}

export function useAppTheme() {
  const { fontScale } = useWindowDimensions();
  const profileSettings =
    useProfileStore((state) => state.profile?.settings) ?? DEFAULT_PROFILE_SETTINGS;
  const reduceMotionEnabled = useSystemAccessibilityStore(
    (state) => state.reduceMotionEnabled
  );
  const screenReaderEnabled = useSystemAccessibilityStore(
    (state) => state.screenReaderEnabled
  );

  const settings: ProfileSettingsState = {
    ...profileSettings,
    reducedMotionEnabled:
      profileSettings.reducedMotionEnabled || reduceMotionEnabled,
    screenReaderHintsEnabled:
      profileSettings.screenReaderHintsEnabled || screenReaderEnabled,
  };

  return {
    settings,
    colors: resolveAppPalette(settings),
    metrics: getReadableMetrics(settings, fontScale),
  };
}
