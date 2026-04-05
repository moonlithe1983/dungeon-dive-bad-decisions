import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';

import {
  scaleFontSize,
  scaleLineHeight,
  useAppTheme,
} from '@/src/theme/app-theme';
import { spacing } from '@/src/theme/spacing';
import type { ProfileSettingsState } from '@/src/types/profile';

type LoopArtPanelProps = {
  title: string;
  body: string;
  source: ImageSourcePropType;
  backgroundSource?: ImageSourcePropType;
};

export function LoopArtPanel({
  title,
  body,
  source,
  backgroundSource,
}: LoopArtPanelProps) {
  const { colors, settings } = useAppTheme();
  const styles = useMemo(() => createStyles(settings, colors), [colors, settings]);

  return (
    <View style={styles.panel}>
      <View style={styles.artFrame} accessible={false}>
        {backgroundSource ? (
          <Image
            source={backgroundSource}
            style={styles.backgroundArt}
            resizeMode="contain"
          />
        ) : null}
        <Image source={source} style={styles.foregroundArt} resizeMode="contain" />
      </View>
      <View style={styles.copyWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </View>
  );
}

function createStyles(
  settings: ProfileSettingsState,
  colors: ReturnType<typeof useAppTheme>['colors']
) {
  return StyleSheet.create({
    panel: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: spacing.md,
      gap: spacing.md,
      overflow: 'hidden',
    },
    artFrame: {
      minHeight: 124,
      borderRadius: 14,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
    },
    backgroundArt: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.18,
      width: undefined,
      height: undefined,
    },
    foregroundArt: {
      width: '72%',
      maxWidth: 180,
      height: 88,
      alignSelf: 'center',
    },
    copyWrap: {
      gap: spacing.xs + 2,
    },
    title: {
      color: colors.textPrimary,
      fontSize: scaleFontSize(15, settings),
      fontWeight: '800',
      lineHeight: scaleLineHeight(20, settings),
    },
    body: {
      color: colors.textMuted,
      fontSize: scaleFontSize(13, settings),
      lineHeight: scaleLineHeight(19, settings),
      letterSpacing: settings.dyslexiaAssistEnabled ? 0.16 : 0,
    },
  });
}
