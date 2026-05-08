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
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Pressable
        onPress={() => setExpanded(prev => !prev)}
        className="flex-row items-center justify-between"
      >
        <Text className="text-sm font-bold text-foreground">
          Local Station ledger
        </Text>
        <Text className="text-xs text-muted">{expanded ? '▲' : '▼'}</Text>
      </Pressable>
      {expanded && (
        <>
          <View className="mt-2 flex-row justify-end">
            <Pressable
              onPress={() => {
                refreshSummary();
              }}
            >
              <Text className="text-xs font-semibold text-[#0050AE]">
                Refresh
              </Text>
            </Pressable>
          </View>
          <View className="mt-2 gap-1">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Top-ups</Text>
              <Text className="text-xs font-semibold text-foreground">
                Rp {summary.topUpTotal.toLocaleString(LOCALE_ID)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Checkouts</Text>
              <Text className="text-xs font-semibold text-foreground">
                Rp {summary.checkoutTotal.toLocaleString(LOCALE_ID)}
              </Text>
            </View>
          </View>
          <View className="mt-3 flex-row justify-around border-t border-slate-100 pt-3">
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Text className="text-xs">📋</Text>
              </View>
              <Text className="mt-1 text-xs text-muted">Registers</Text>
              <Text className="text-sm font-bold text-foreground">
                {summary.registerCount}
              </Text>
            </View>
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Text className="text-xs">↑</Text>
              </View>
              <Text className="mt-1 text-xs text-muted">Top-ups</Text>
              <Text className="text-sm font-bold text-foreground">
                {summary.topUpCount}
              </Text>
            </View>
            <View className="items-center">
              <View className="h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                <Text className="text-xs">↓</Text>
              </View>
              <Text className="mt-1 text-xs text-muted">Checkouts</Text>
              <Text className="text-sm font-bold text-foreground">
                {summary.checkoutCount}
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}
