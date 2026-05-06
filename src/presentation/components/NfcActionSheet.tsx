import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SignalBottomSheet } from './SignalBottomSheet';
import { SignalButton } from './SignalButton';

export type NfcActionState =
  | { phase: 'idle' }
  | { phase: 'scanning'; message?: string }
  | { phase: 'success'; title: string; message: string }
  | { phase: 'error'; title: string; message: string };

type Props = {
  state: NfcActionState;
  onDismiss: () => void;
};

export function NfcActionSheet({
  state,
  onDismiss,
}: Props): React.JSX.Element | null {
  if (state.phase === 'idle') {
    return null;
  }

  const visible = state.phase !== 'idle';
  const canClose = state.phase === 'success' || state.phase === 'error';

  return (
    <SignalBottomSheet
      visible={visible}
      title={
        state.phase === 'scanning'
          ? 'Ready to Scan'
          : state.phase === 'success'
            ? '✓ Done'
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
    </SignalBottomSheet>
  );
}
