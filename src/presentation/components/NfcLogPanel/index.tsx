import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAppStore } from '@presentation/stores/app-store';
import { styles } from './styles';

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  const hh = `${date.getHours()}`.padStart(2, '0');
  const mm = `${date.getMinutes()}`.padStart(2, '0');
  const ss = `${date.getSeconds()}`.padStart(2, '0');
  return `${hh}.${mm}.${ss}`;
};

interface NfcLogPanelProps {
  variant?: 'dark' | 'light';
}

export function NfcLogPanel({
  variant = 'dark',
}: Readonly<NfcLogPanelProps>): React.JSX.Element | null {
  const nfcLogEnabled = useAppStore(state => state.nfcLogEnabled);
  const nfcLogs = useAppStore(state => state.nfcLogs);
  const toggleNfcLogEnabled = useAppStore(state => state.toggleNfcLogEnabled);
  const clearNfcLogs = useAppStore(state => state.clearNfcLogs);

  if (!__DEV__) {
    return null;
  }

  const isLight = variant === 'light';

  return (
    <View
      className={`rounded-2xl border p-3 ${isLight ? 'border-white/60 bg-white/40' : 'border-slate-300 bg-[#0F172A]'}`}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className={`text-sm font-semibold ${isLight ? 'text-[#111827]' : 'text-[#7DD3FC]'}`}
        >
          NFC Log
        </Text>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={toggleNfcLogEnabled}>
            <Text
              className={`text-xs font-semibold ${isLight ? 'text-[#374151]' : 'text-white'}`}
            >
              {nfcLogEnabled ? 'ON' : 'OFF'}
            </Text>
          </Pressable>
          <Pressable onPress={clearNfcLogs}>
            <Text className="text-xs font-semibold text-[#FB7185]">Clear</Text>
          </Pressable>
        </View>
      </View>
      {nfcLogEnabled && (
        <ScrollView
          className={`mt-2 rounded-lg p-2 ${isLight ? 'bg-white' : 'bg-[#111827]'}`}
          style={styles.scrollContainer}
          nestedScrollEnabled
        >
          {nfcLogs.length === 0 && (
            <Text
              className={`text-xs ${isLight ? 'text-[#6B7280]' : 'text-slate-300'}`}
            >
              No NFC log lines yet.
            </Text>
          )}
          {nfcLogs.length > 0 &&
            nfcLogs.slice(-20).map(entry => (
              <Text
                key={entry.id}
                className={`text-xs ${isLight ? 'text-[#374151]' : 'text-slate-200'}`}
              >
                {formatTime(entry.createdAt)} {entry.message}
              </Text>
            ))}
        </ScrollView>
      )}
      {!nfcLogEnabled && (
        <Text
          className={`mt-2 text-xs ${isLight ? 'text-[#6B7280]' : 'text-slate-300'}`}
        >
          Log panel hidden. Tap ON to view NFC operational events.
        </Text>
      )}
    </View>
  );
}
