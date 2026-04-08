import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { playUiHaptic } from '@/src/haptics/ui-haptics';
import { useAppTheme } from '@/src/theme/app-theme';

type GameButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  inputHint?: string | null;
  inputHintPosition?: 'left' | 'right';
  accessibilityHint?: string;
};

export function GameButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  inputHint = null,
  inputHintPosition = 'right',
  accessibilityHint,
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
          borderWidth: settings.highContrastEnabled ? 2 : 0,
          borderColor: settings.highContrastEnabled ? colors.textPrimary : colors.accent,
        },
        buttonSecondary: {
          backgroundColor: colors.surfaceRaised,
          borderWidth: settings.highContrastEnabled ? 2 : 1,
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
        contentRow: {
          flexDirection: inputHint && inputHintPosition === 'left' ? 'row-reverse' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: inputHint ? 10 : 0,
        },
        inputHint: {
          minWidth: 28,
          minHeight: 28,
          borderRadius: 999,
          paddingHorizontal: 8,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isPrimary ? 'rgba(0,0,0,0.14)' : colors.surface,
          borderWidth: 1,
          borderColor: isPrimary ? 'rgba(0,0,0,0.12)' : colors.borderStrong,
        },
        inputHintText: {
          color: isPrimary ? colors.buttonText : colors.textPrimary,
          fontSize: Math.round(11 * metrics.textScale),
          fontWeight: '900',
          lineHeight: Math.round(14 * metrics.textScale * metrics.lineHeightScale),
          letterSpacing: metrics.letterSpacing,
          textAlign: 'center',
        },
      }),
    [
      colors,
      inputHint,
      inputHintPosition,
      isPrimary,
      metrics,
      settings.highContrastEnabled,
      settings.reducedMotionEnabled,
    ]
  );

  return (
    <Pressable
      onPress={() => {
        void playUiHaptic('tap', settings);
        Promise.resolve(onPress()).catch((error) => {
          console.error(`GameButton "${label}" failed`, error);
        });
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      accessibilityHint={
        settings.screenReaderHintsEnabled
          ? accessibilityHint ??
            `${label}. ${
              variant === 'secondary' ? 'Secondary action.' : 'Primary action.'
            }${inputHint ? ` Bound to ${inputHint}.` : ''}`
          : undefined
      }
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
      ]}
    >
      <View style={styles.contentRow}>
          <Text
            style={[
              styles.label,
              isPrimary ? styles.labelPrimary : styles.labelSecondary,
              disabled && styles.labelDisabled,
            ]}
          >
            {label}
          </Text>
          {inputHint ? (
              <View style={styles.inputHint}>
                <Text style={styles.inputHintText}>{inputHint}</Text>
              </View>
          ) : null}
        </View>
    </Pressable>
  );
}
