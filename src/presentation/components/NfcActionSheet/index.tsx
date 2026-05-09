import React from 'react';
import { Text, View } from 'react-native';
import { SignalBottomSheet } from '@presentation/components/SignalBottomSheet';
import { SignalButton } from '@presentation/components/SignalButton';
import { ScanningRings } from './ScanningRings';
import type { NfcActionSheetProps } from './types';

export type { NfcActionState, NfcActionSheetProps } from './types';

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
    >
      {state.phase === 'scanning' && (
        <View className="items-center px-6 pt-2 pb-8 gap-5">
          <View className="w-[120px] h-[120px] rounded-full bg-[#0050AE]/[0.08] items-center justify-center">
            <ScanningRings color={state.color} />
          </View>
          <View className="gap-1">
            <Text className="text-center text-[15px] font-semibold leading-[22px] text-[#001A41]">
              {state.message ?? 'Hold your NFC card to the back of the phone'}
            </Text>
            <Text className="text-center text-[13px] leading-[18px] text-[#4E5764]">
              Keep the card steady until the operation completes
            </Text>
          </View>
        </View>
      )}

      {state.phase === 'success' && (
        <View className="items-center gap-4 pb-6 px-6">
          <View className="w-16 h-16 rounded-full bg-[#EDFCF0] border-[1.5px] border-[#008E53] items-center justify-center">
            <Text className="text-[28px] text-[#008E53] font-bold">✓</Text>
          </View>
          <View className="w-full rounded-xl bg-[#EDFCF0] border border-[#008E53]/20 p-4 pl-5 overflow-hidden">
            <View className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#008E53]" />
            <Text className="text-[15px] font-semibold leading-[22px] text-[#001A41]">
              {state.title}
            </Text>
            <Text className="mt-1 text-[13px] leading-[18px] text-[#4E5764]">
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
          <View className="w-16 h-16 rounded-full bg-[#FDDDD4] border-[1.5px] border-[#BC1D42] items-center justify-center">
            <Text className="text-[28px] text-[#DB2941] font-bold">✕</Text>
          </View>
          <View className="w-full rounded-xl bg-[#FDDDD4] border border-[#BC1D42]/20 p-4 pl-5 overflow-hidden">
            <View className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#BC1D42]" />
            <Text className="text-[15px] font-semibold leading-[22px] text-[#001A41]">
              {state.title}
            </Text>
            <Text className="mt-1 text-[13px] leading-[18px] text-[#4E5764]">
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
          <View className="w-16 h-16 rounded-full bg-[#FEF3D4] border-[1.5px] border-[#D9801F] items-center justify-center">
            <Text className="text-[28px] text-[#D9801F] font-bold">⚠</Text>
          </View>
          <View className="w-full rounded-xl bg-[#FEF3D4] border border-[#D9801F]/20 p-4 pl-5 overflow-hidden">
            <View className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#D9801F]" />
            <Text className="text-[15px] font-semibold leading-[22px] text-[#001A41]">
              {state.title}
            </Text>
            <Text className="mt-1 text-[13px] leading-[18px] text-[#4E5764]">
              {state.message}
            </Text>
          </View>
          <View className="w-full gap-3">
            <SignalButton label={state.confirmLabel} onPress={state.onConfirm} />
            <SignalButton label="Skip" variant="secondary" onPress={onDismiss} />
          </View>
        </View>
      )}
    </SignalBottomSheet>
  );
}
