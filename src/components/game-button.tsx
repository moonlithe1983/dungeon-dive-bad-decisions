import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '@/src/theme/colors';

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
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={() => {
        Promise.resolve(onPress()).catch((error) => {
          console.error(`GameButton "${label}" failed`, error);
        });
      }}
      disabled={disabled}
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

const styles = StyleSheet.create({
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
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  label: {
    fontSize: 16,
    fontWeight: '900',
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
});
