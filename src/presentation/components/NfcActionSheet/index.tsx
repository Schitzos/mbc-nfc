import React, { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { SignalBottomSheet } from '@presentation/components/SignalBottomSheet';
import { SignalButton } from '@presentation/components/SignalButton';
import type { NfcActionSheetProps } from './types';

export type { NfcActionState, NfcActionSheetProps } from './types';

const sheetStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
};

const nfcOrb = require('@presentation/assets/nfc-orb.png');

function PulseRing({ delay }: Readonly<{ delay: number }>) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [delay, scale, opacity]);

  return (
    <Animated.View style={[s.pulseRing, { transform: [{ scale }], opacity }]} />
  );
}

export function NfcActionSheet({
  state,
  onDismiss,
}: Readonly<NfcActionSheetProps>): React.JSX.Element | null {
  if (state.phase === 'idle') {
    return null;
  }

  let sheetTitle = '✕ Failed';
  if (state.phase === 'scanning') {
    sheetTitle = 'Ready to Scan';
  } else if (state.phase === 'success') {
    sheetTitle = '✓ Done';
  } else if (state.phase === 'confirm') {
    sheetTitle = '⚠ Confirm';
  }

  return (
    <SignalBottomSheet
      visible
      title={sheetTitle}
      onClose={onDismiss}
      style={sheetStyle}
    >
      <View className="flex-1">
        {state.phase === 'scanning' && (
          <View className="items-center px-6 pt-2 pb-8 gap-5">
            <View className="w-[200px] h-[200px] items-center justify-center">
              <PulseRing delay={0} />
              <PulseRing delay={500} />
              <Image
                source={nfcOrb}
                className="w-[200px] h-[200px]"
                resizeMode="contain"
              />
            </View>
            <View className="gap-2">
              <Text className="text-center text-[16px] font-bold text-[#111827]">
                {state.message ?? 'Tap your member card near the phone'}
              </Text>
              <Text className="text-center text-[13px] text-[#6B7280]">
                Keep the card close until the operation is detected.
              </Text>
            </View>
            <View className="flex-row items-center gap-2 bg-[#FFF1F2] px-5 py-2.5 rounded-full border border-[#FFE4E8]">
              <View className="w-2.5 h-2.5 rounded-full bg-[#FF0025]" />
              <Text className="text-[13px] font-medium text-[#111827]">
                Waiting for NFC card
              </Text>
            </View>
          </View>
        )}

        {state.phase === 'success' && (
          <View className="items-center gap-4 pb-6 px-6">
            <View className="w-32 h-32 rounded-full bg-[#DCFCE7] border-[1.5px] border-[#16A34A] items-center justify-center">
              <Text className="text-[48px] text-[#16A34A] font-bold">✓</Text>
            </View>
            <View className="w-full rounded-xl p-4 bg-white/60 border border-white">
              <Text className="text-[15px] font-semibold text-[#111827]">
                {state.title}
              </Text>
              <Text className="mt-1 text-[13px] text-[#6B7280]">
                {state.message}
              </Text>
            </View>
            <View className="w-full">
              <SignalButton label="Done" onPress={onDismiss} />
            </View>
          </View>
        )}

        {state.phase === 'error' && (
          <View className="items-center gap-4 pb-6 px-6">
            <View className="w-32 h-32 rounded-full bg-[#FEE2E2] border-[1.5px] border-[#DC2626] items-center justify-center">
              <Text className="text-[48px] text-[#DC2626] font-bold">✕</Text>
            </View>
            <View className="w-full rounded-xl p-4 bg-white/60 border border-white">
              <Text className="text-[15px] font-semibold text-[#111827]">
                {state.title}
              </Text>
              <Text className="mt-1 text-[13px] text-[#6B7280]">
                {state.message}
              </Text>
            </View>
            <View className="w-full">
              <SignalButton label="Dismiss" onPress={onDismiss} />
            </View>
          </View>
        )}

        {state.phase === 'confirm' && (
          <View className="items-center gap-4 pb-6 px-6">
            <View className="w-32 h-32 rounded-full bg-[#FEF3C7] border-[1.5px] border-[#D97706] items-center justify-center">
              <Text className="text-[48px] text-[#D97706] font-bold">⚠</Text>
            </View>
            <View className="w-full rounded-xl p-4 bg-white/60 border border-white">
              <Text className="text-[15px] font-semibold text-[#111827]">
                {state.title}
              </Text>
              <Text className="mt-1 text-[13px] text-[#6B7280]">
                {state.message}
              </Text>
            </View>
            <View className="w-full gap-3">
              <SignalButton
                label={state.confirmLabel}
                onPress={state.onConfirm}
              />
              <SignalButton
                label="Skip"
                variant="secondary"
                onPress={onDismiss}
              />
            </View>
          </View>
        )}
      </View>
    </SignalBottomSheet>
  );
}

const s = StyleSheet.create({
  pulseRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255, 128, 160, 0.4)',
  },
});
