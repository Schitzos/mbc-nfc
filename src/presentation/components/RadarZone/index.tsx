import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export interface RadarZoneProps {
  color: string;
  label: string;
  disabled?: boolean;
  onPress: () => void;
  busyLabel?: string;
}

const BUTTON_SIZE = 140;
const RING_SIZES = [180, 260, 340];

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = Number.parseInt(h.substring(0, 2), 16);
  const g = Number.parseInt(h.substring(2, 4), 16);
  const b = Number.parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function RadarZone({
  color,
  label,
  disabled,
  onPress,
  busyLabel,
}: Readonly<RadarZoneProps>): React.JSX.Element {
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseOpacity1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseOpacity2 = useRef(new Animated.Value(1)).current;
  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring3Scale = useRef(new Animated.Value(1)).current;
  const sweepRotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim1, {
          toValue: 1.4,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity1, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim1, pulseOpacity1]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const loop = Animated.loop(
        Animated.parallel([
          Animated.timing(pulseAnim2, {
            toValue: 1.6,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity2, {
            toValue: 0,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
    }, 600);
    return () => clearTimeout(timeout);
  }, [pulseAnim2, pulseOpacity2]);

  useEffect(() => {
    const createBreath = (anim: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1.04,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
    const l1 = createBreath(ring1Scale, 1600);
    const l2 = createBreath(ring2Scale, 2000);
    const l3 = createBreath(ring3Scale, 2400);
    l1.start();
    setTimeout(() => l2.start(), 400);
    setTimeout(() => l3.start(), 800);
    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
    };
  }, [ring1Scale, ring2Scale, ring3Scale]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweepRotation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweepRotation]);

  const sweepSpin = sweepRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const ringScales = [ring1Scale, ring2Scale, ring3Scale];
  const displayLabel = disabled && busyLabel ? busyLabel : label;

  return (
    <View className="flex-1 items-center justify-center min-h-[340px]">
      <View
        className="absolute w-[360px] h-[360px] rounded-full"
        style={{ backgroundColor: hexToRgba(color, 0.08) }}
      />

      {RING_SIZES.map((size, i) => (
        <Animated.View
          key={size}
          className="absolute border"
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: hexToRgba(color, 0.4),
            opacity: 0.3 - i * 0.1,
            transform: [{ scale: ringScales[i] }],
          }}
        />
      ))}

      <Animated.View
        className="absolute w-[170px] h-[170px] items-center justify-start"
        style={{ transform: [{ rotate: sweepSpin }] }}
      >
        <View
          className="w-px h-[85px]"
          style={{ backgroundColor: hexToRgba(color, 0.3) }}
        />
      </Animated.View>

      <Animated.View
        style={[
          s.pulseRing,
          {
            borderColor: hexToRgba(color, 0.5),
            transform: [{ scale: pulseAnim1 }],
            opacity: pulseOpacity1,
          },
        ]}
      />
      <Animated.View
        style={[
          s.pulseRing,
          s.pulseRing2,
          {
            borderColor: hexToRgba(color, 0.3),
            transform: [{ scale: pulseAnim2 }],
            opacity: pulseOpacity2,
          },
        ]}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={displayLabel}
        disabled={disabled}
        onPress={onPress}
        style={[
          s.scanButton,
          {
            borderColor: hexToRgba(color, 0.6),
            shadowColor: color,
          },
          disabled && s.scanButtonDisabled,
        ]}
      >
        <LinearGradient
          colors={['#FFB3C1', color]}
          locations={[0, 0.7]}
          style={s.scanButtonGradient}
        >
          <Text className="text-white text-[20px] mb-1">{'((•))'}</Text>
          <Text className="text-white text-sm font-semibold text-center">
            {displayLabel}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  pulseRing: {
    position: 'absolute',
    width: BUTTON_SIZE + 10,
    height: BUTTON_SIZE + 10,
    borderRadius: (BUTTON_SIZE + 10) / 2,
    borderWidth: 2,
  },
  pulseRing2: {
    borderWidth: 1.5,
  },
  scanButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  scanButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonDisabled: {
    opacity: 0.4,
  },
});
