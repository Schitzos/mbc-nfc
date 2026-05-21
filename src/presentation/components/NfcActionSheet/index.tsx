import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SignalBottomSheet } from '@presentation/components/SignalBottomSheet';
import { SignalButton } from '@presentation/components/SignalButton';
import { ScanningRings } from './ScanningRings';
import type { NfcActionSheetProps } from './types';

export type { NfcActionState, NfcActionSheetProps } from './types';

const sheetStyle = {
  backgroundColor: 'transparent',
};

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
      <LinearGradient colors={['#0F172A', '#1E293B']} style={s.gradient}>
        {state.phase === 'scanning' && (
          <View className="items-center px-6 pt-2 pb-8 gap-5">
            <View className="w-[120px] h-[120px] rounded-full bg-white/[0.08] items-center justify-center">
              <ScanningRings color={state.color} />
            </View>
            <View className="gap-1">
              <Text className="text-center text-[15px] font-semibold leading-[22px] text-white">
                {state.message ?? 'Hold your NFC card to the back of the phone'}
              </Text>
              <Text className="text-center text-[13px] leading-[18px] text-white/60">
                Keep the card steady until the operation completes
              </Text>
            </View>
          </View>
        )}

        {state.phase === 'success' && (
          <View className="items-center gap-4 pb-6 px-6">
            <View className="w-16 h-16 rounded-full bg-[#00E676]/20 border-[1.5px] border-[#00E676] items-center justify-center">
              <Text className="text-[28px] text-[#00E676] font-bold">✓</Text>
            </View>
            <LinearGradient
              colors={['#064E3B', '#065F46']}
              style={s.successCard}
            >
              <Text className="text-[15px] font-semibold leading-[22px] text-white">
                {state.title}
              </Text>
              <Text className="mt-1 text-[13px] leading-[18px] text-white/70">
                {state.message}
              </Text>
            </LinearGradient>
            <View className="w-full">
              <SignalButton label="Done" onPress={onDismiss} />
            </View>
          </View>
        )}

        {state.phase === 'error' && (
          <View className="items-center gap-4 pb-6 px-6">
            <View className="w-16 h-16 rounded-full bg-[#BC1D42]/20 border-[1.5px] border-[#BC1D42] items-center justify-center">
              <Text className="text-[28px] text-[#FF5252] font-bold">✕</Text>
            </View>
            <View style={s.errorCard}>
              <View className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#BC1D42]" />
              <Text className="text-[15px] font-semibold leading-[22px] text-white">
                {state.title}
              </Text>
              <Text className="mt-1 text-[13px] leading-[18px] text-white/70">
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
            <View className="w-16 h-16 rounded-full bg-[#D9801F]/20 border-[1.5px] border-[#D9801F] items-center justify-center">
              <Text className="text-[28px] text-[#D9801F] font-bold">⚠</Text>
            </View>
            <View style={s.confirmCard}>
              <View className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#D9801F]" />
              <Text className="text-[15px] font-semibold leading-[22px] text-white">
                {state.title}
              </Text>
              <Text className="mt-1 text-[13px] leading-[18px] text-white/70">
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
      </LinearGradient>
    </SignalBottomSheet>
  );
}

const s = StyleSheet.create({
  gradient: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  successCard: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 20,
  },
  errorCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(188, 29, 66, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#BC1D42',
    padding: 16,
    paddingLeft: 20,
    overflow: 'hidden',
  },
  confirmCard: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(217, 128, 31, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#D9801F',
    padding: 16,
    paddingLeft: 20,
    overflow: 'hidden',
  },
});
