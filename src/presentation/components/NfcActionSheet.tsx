import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SignalBottomSheet } from './SignalBottomSheet';
import { SignalButton } from './SignalButton';

export type NfcActionState =
  | { phase: 'idle' }
  | { phase: 'scanning'; message?: string }
  | { phase: 'success'; title: string; message: string }
  | { phase: 'error'; title: string; message: string }
  | {
      phase: 'confirm';
      title: string;
      message: string;
      confirmLabel: string;
      onConfirm: () => void;
    };

interface NfcActionSheetProps {
  state: NfcActionState;
  onDismiss: () => void;
}

export function NfcActionSheet({
  state,
  onDismiss,
}: NfcActionSheetProps): React.JSX.Element | null {
  if (state.phase === 'idle') {
    return null;
  }

  const canClose = state.phase !== 'scanning';

  return (
    <SignalBottomSheet
      visible
      title={
        state.phase === 'scanning'
          ? 'Ready to Scan'
          : state.phase === 'success'
            ? '✓ Done'
            : state.phase === 'confirm'
              ? '⚠ Confirm'
              : '✕ Failed'
      }
      onClose={canClose ? onDismiss : undefined}
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
