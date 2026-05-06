import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useAppStore } from '../stores/app-store';

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  const hh = `${date.getHours()}`.padStart(2, '0');
  const mm = `${date.getMinutes()}`.padStart(2, '0');
  const ss = `${date.getSeconds()}`.padStart(2, '0');
  return `${hh}.${mm}.${ss}`;
};

export function NfcLogPanel(): React.JSX.Element {
  const nfcLogEnabled = useAppStore(state => state.nfcLogEnabled);
  const nfcLogs = useAppStore(state => state.nfcLogs);
  const toggleNfcLogEnabled = useAppStore(state => state.toggleNfcLogEnabled);
  const clearNfcLogs = useAppStore(state => state.clearNfcLogs);

  return (
    <View className="rounded-2xl border border-slate-300 bg-[#0F172A] p-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-[#7DD3FC]">NFC Log</Text>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={toggleNfcLogEnabled}>
            <Text className="text-xs font-semibold text-white">
              {nfcLogEnabled ? 'ON' : 'OFF'}
            </Text>
          </Pressable>
          <Pressable onPress={clearNfcLogs}>
            <Text className="text-xs font-semibold text-[#FB7185]">Clear</Text>
          </Pressable>
        </View>
      </View>

      {nfcLogEnabled ? (
        <View className="mt-2 max-h-40 rounded-lg bg-[#111827] p-2">
          {nfcLogs.length === 0 ? (
            <Text className="text-xs text-slate-300">
              No NFC log lines yet.
            </Text>
          ) : (
            nfcLogs.slice(-12).map(entry => (
              <Text key={entry.id} className="text-xs text-slate-200">
                {formatTime(entry.createdAt)} {entry.message}
              </Text>
            ))
          )}
        </View>
      ) : (
        <Text className="mt-2 text-xs text-slate-300">
          Log panel hidden. Tap ON to view NFC operational events.
        </Text>
      )}
    </View>
  );
}
