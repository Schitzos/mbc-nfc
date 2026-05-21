import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
    <View className="rounded-2xl p-4 my-4 bg-white/55 border border-white/70">
      <Pressable
        onPress={() => setExpanded(prev => !prev)}
        className="flex-row items-center justify-between"
      >
        <Text className="text-sm font-bold text-[#111827]">
          Local Station ledger
        </Text>
        <Text className="text-xs text-[#6B7280]">{expanded ? '▲' : '▼'}</Text>
      </Pressable>
      {expanded && (
        <>
          <View className="mt-2 flex-row justify-end">
            <Pressable
              onPress={() => {
                refreshSummary();
              }}
            >
              <Text className="text-xs font-semibold text-brand">Refresh</Text>
            </Pressable>
          </View>
          <View className="mt-2 gap-1">
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#6B7280]">Top-ups</Text>
              <Text className="text-xs font-semibold text-[#111827]">
                Rp {summary.topUpTotal.toLocaleString(LOCALE_ID)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#6B7280]">Checkouts</Text>
              <Text className="text-xs font-semibold text-[#111827]">
                Rp {summary.checkoutTotal.toLocaleString(LOCALE_ID)}
              </Text>
            </View>
          </View>
          <View className="mt-3 flex-row justify-around border-t border-black/10 pt-3">
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#FFE4E8]">
                <Text className="text-xs">📋</Text>
              </View>
              <Text className="mt-1 text-xs text-[#6B7280]">Registers</Text>
              <Text className="text-sm font-bold text-[#111827]">
                {summary.registerCount}
              </Text>
            </View>
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#FFE4E8]">
                <Text className="text-xs">↑</Text>
              </View>
              <Text className="mt-1 text-xs text-[#6B7280]">Top-ups</Text>
              <Text className="text-sm font-bold text-[#111827]">
                {summary.topUpCount}
              </Text>
            </View>
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#FFE4E8]">
                <Text className="text-xs">↓</Text>
              </View>
              <Text className="mt-1 text-xs text-[#6B7280]">Checkouts</Text>
              <Text className="text-sm font-bold text-[#111827]">
                {summary.checkoutCount}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
