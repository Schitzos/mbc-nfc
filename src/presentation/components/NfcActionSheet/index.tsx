import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SignalBottomSheet } from '@presentation/components/SignalBottomSheet';
import { SignalButton } from '@presentation/components/SignalButton';
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
        <View className="items-center gap-4 pb-8">
          <ActivityIndicator size="large" color="#0050AE" />
          <Text className="text-center text-base text-foreground">
            {state.message ?? 'Hold your NFC card to the back of the phone'}
          </Text>
          <Text className="text-center text-xs text-muted">
            Keep the card steady until the operation completes
          </Text>
        </View>
      )}
      {state.phase === 'success' && (
        <View className="gap-3 pb-6">
          <View className="rounded-xl bg-[#EAFBF2] p-4">
            <Text className="text-base font-bold text-green-800">
              {state.title}
            </Text>
            <Text className="mt-1 text-sm text-green-700">{state.message}</Text>
          </View>
          <SignalButton label="Done" onPress={onDismiss} />
        </View>
      )}
      {state.phase === 'error' && (
        <View className="gap-3 pb-6">
          <View className="rounded-xl bg-[#FFECEC] p-4">
            <Text className="text-base font-bold text-red-800">
              {state.title}
            </Text>
            <Text className="mt-1 text-sm text-red-700">{state.message}</Text>
          </View>
          <SignalButton label="Dismiss" onPress={onDismiss} />
        </View>
      )}
      {state.phase === 'confirm' && (
        <View className="gap-3 pb-6">
          <View className="rounded-xl bg-[#FFF7DB] p-4">
            <Text className="text-base font-bold text-amber-800">
              {state.title}
            </Text>
            <Text className="mt-1 text-sm text-amber-700">{state.message}</Text>
          </View>
          <SignalButton label={state.confirmLabel} onPress={state.onConfirm} />
          <SignalButton label="Skip" variant="secondary" onPress={onDismiss} />
        </View>
      )}
    </SignalBottomSheet>
  );
}
