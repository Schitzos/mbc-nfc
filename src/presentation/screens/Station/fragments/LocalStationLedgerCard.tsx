import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { StationLedgerSummaryDto } from '@application/dto/station-ledger-summary-dto';
import { LOCALE_ID } from '@shared/constants';

interface LocalStationLedgerCardProps {
  summary: StationLedgerSummaryDto;
  refreshSummary: () => Promise<void>;
}

export function LocalStationLedgerCard({
  summary,
  refreshSummary,
}: Readonly<LocalStationLedgerCardProps>): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={s.card}>
      <Pressable
        onPress={() => setExpanded(prev => !prev)}
        className="flex-row items-center justify-between"
      >
        <Text className="text-sm font-bold text-white">
          Local Station ledger
        </Text>
        <Text className="text-xs text-white/50">{expanded ? '▲' : '▼'}</Text>
      </Pressable>
      {expanded && (
        <>
          <View className="mt-2 flex-row justify-end">
            <Pressable
              onPress={() => {
                refreshSummary();
              }}
            >
              <Text className="text-xs font-semibold text-[#00B4D8]">
                Refresh
              </Text>
            </Pressable>
          </View>
          <View className="mt-2 gap-1">
            <View className="flex-row justify-between">
              <Text className="text-xs text-white/60">Top-ups</Text>
              <Text className="text-xs font-semibold text-[#F59E0B]">
                Rp {summary.topUpTotal.toLocaleString(LOCALE_ID)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-white/60">Checkouts</Text>
              <Text className="text-xs font-semibold text-[#F59E0B]">
                Rp {summary.checkoutTotal.toLocaleString(LOCALE_ID)}
              </Text>
            </View>
          </View>
          <View className="mt-3 flex-row justify-around border-t border-white/10 pt-3">
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Text className="text-xs">📋</Text>
              </View>
              <Text className="mt-1 text-xs text-white/60">Registers</Text>
              <Text className="text-sm font-bold text-white">
                {summary.registerCount}
              </Text>
            </View>
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Text className="text-xs">↑</Text>
              </View>
              <Text className="mt-1 text-xs text-white/60">Top-ups</Text>
              <Text className="text-sm font-bold text-white">
                {summary.topUpCount}
              </Text>
            </View>
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                <Text className="text-xs">↓</Text>
              </View>
              <Text className="mt-1 text-xs text-white/60">Checkouts</Text>
              <Text className="text-sm font-bold text-white">
                {summary.checkoutCount}
              </Text>
            </View>
          </View>
        </>
      )}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
});
