import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

type Variant = 'roleSwitcher' | 'station' | 'gate' | 'terminal' | 'scout';

interface BackgroundDecorProps {
  variant?: Variant;
}

function getDiamondColor(variant: Variant): string {
  if (variant === 'gate') {
    return '#008E53';
  }
  if (variant === 'terminal') {
    return '#FDA22B';
  }
  return '#FF0025';
}

function getCircleColor(variant: Variant): string {
  if (variant === 'scout') {
    return '#0050AE';
  }
  return '#FF0025';
}

export function BackgroundDecor({
  variant = 'roleSwitcher',
}: Readonly<BackgroundDecorProps>): React.JSX.Element {
  const { height } = useWindowDimensions();

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        container: { minHeight: height },
        topCircle: { backgroundColor: getCircleColor(variant), opacity: 0.06 },
        diamond: {
          backgroundColor: getDiamondColor(variant),
          opacity: 0.05,
          transform: [{ rotate: '45deg' }],
          borderRadius: 4,
        },
      }),
    [height, variant],
  );

  return (
    <View
      className="absolute inset-0 overflow-hidden"
      style={dynamicStyles.container}
      pointerEvents="none"
    >
      <View
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full"
        style={dynamicStyles.topCircle}
      />
      <View
        className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full"
        style={styles.bottomCircle}
      />
      <View
        className="absolute right-6 top-1/3 h-16 w-16"
        style={dynamicStyles.diamond}
      />
      <View
        className="absolute bottom-1/4 left-8 h-6 w-6 rounded-full"
        style={styles.dotAccent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomCircle: { backgroundColor: '#001A41', opacity: 0.04 },
  dotAccent: { backgroundColor: '#001A41', opacity: 0.07 },
});
