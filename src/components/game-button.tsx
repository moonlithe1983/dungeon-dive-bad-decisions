import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/src/theme/app-theme';

type GameButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function GameButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: GameButtonProps) {
  const { colors, metrics, settings } = useAppTheme();
  const isPrimary = variant === 'primary';
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        button: {
          minHeight: 54,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
        },
        buttonPrimary: {
          backgroundColor: colors.accent,
        },
        buttonSecondary: {
          backgroundColor: colors.surfaceRaised,
          borderWidth: 1,
          borderColor: colors.borderStrong,
        },
        buttonDisabled: {
          backgroundColor: colors.buttonDisabled,
          borderColor: colors.buttonDisabled,
        },
        buttonPressed: {
          opacity: settings.reducedMotionEnabled ? 0.95 : 0.92,
          transform: settings.reducedMotionEnabled ? [] : [{ scale: 0.995 }],
        },
        label: {
          fontSize: Math.round(16 * metrics.textScale),
          fontWeight: '900',
          lineHeight: Math.round(20 * metrics.textScale * metrics.lineHeightScale),
          letterSpacing: metrics.letterSpacing,
          textAlign: 'center',
        },
        labelPrimary: {
          color: colors.buttonText,
        },
        labelSecondary: {
          color: colors.textPrimary,
        },
        labelDisabled: {
          color: colors.textMuted,
        },
      }),
    [colors, metrics, settings.reducedMotionEnabled]
  );

  return (
    <Pressable
      onPress={() => {
        Promise.resolve(onPress()).catch((error) => {
          console.error(`GameButton "${label}" failed`, error);
        });
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={
        settings.screenReaderHintsEnabled
          ? variant === 'secondary'
            ? `${label}. Secondary action.`
            : `${label}. Primary action.`
          : undefined
      }
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <Text
        style={[
          styles.label,
          isPrimary ? styles.labelPrimary : styles.labelSecondary,
          disabled && styles.labelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
