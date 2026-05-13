import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

interface ScanningRingsProps {
  color?: string;
}

const RING_COUNT = 3;
const DURATION = 1500;
const STAGGER = 500;

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function Ring({
  color,
  delay,
  index,
}: Readonly<{ color: string; delay: number; index: number }>) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6 - index * 0.2)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.loop(
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 2.2 + index * 0.4,
            duration: DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [scale, opacity, delay, index]);

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          borderColor: hexToRgba(color, 0.6 - index * 0.15),
          transform: [{ scale }],
          opacity,
        },
      ]}
    />
  );
}

export function ScanningRings({
  color = '#0050AE',
}: Readonly<ScanningRingsProps>): React.JSX.Element {
  const breathe = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breathe]);

  return (
    <View
      style={styles.container}
      accessibilityLabel="Scanning for NFC card"
      accessibilityRole="progressbar"
    >
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <Ring key={`ring-${i}`} color={color} delay={i * STAGGER} index={i} />
      ))}
      <Animated.View
        style={[styles.iconContainer, { transform: [{ scale: breathe }] }]}
      >
        <Text style={[styles.icon, { color }]}>{'((•))'}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  ring: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    fontWeight: '700',
  },
});
