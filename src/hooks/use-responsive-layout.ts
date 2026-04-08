import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { spacing } from '@/src/theme/spacing';

export type ResponsiveLayoutMetrics = {
  width: number;
  height: number;
  fontScale: number;
  isLandscape: boolean;
  isCompactWidth: boolean;
  isWide: boolean;
  hasLargeText: boolean;
  maxContentWidth: number;
  shellPaddingHorizontal: number;
  stackStatCards: boolean;
  stackInlineHeader: boolean;
  heroArtMaxHeight: number;
};

export function useResponsiveLayout(): ResponsiveLayoutMetrics {
  const { width, height, fontScale } = useWindowDimensions();

  return useMemo(() => {
    const isLandscape = width > height;
    const isCompactWidth = width < 390;
    const isWide = width >= 760;
    const hasLargeText = fontScale >= 1.35;

    return {
      width,
      height,
      fontScale,
      isLandscape,
      isCompactWidth,
      isWide,
      hasLargeText,
      maxContentWidth: isWide ? 880 : 760,
      shellPaddingHorizontal: isCompactWidth ? spacing.md : spacing.lg,
      stackStatCards: isCompactWidth || hasLargeText,
      stackInlineHeader: isCompactWidth || hasLargeText,
      heroArtMaxHeight: isLandscape ? 320 : hasLargeText ? 440 : 520,
    };
  }, [fontScale, height, width]);
}

