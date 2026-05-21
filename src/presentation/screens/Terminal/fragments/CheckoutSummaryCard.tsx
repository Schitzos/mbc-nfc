import React from 'react';
import { Pressable, Text, View } from 'react-native';
import dayjs from 'dayjs';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import { LOCALE_ID } from '@shared/constants';

interface CheckoutSummaryCardProps {
  latestResult: RoleActionResultDto;
  checkoutTime: string;
  isSimulation?: boolean;
  onReset?: () => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

export function CheckoutSummaryCard({
  latestResult,
  checkoutTime,
  isSimulation,
  onReset,
}: Readonly<CheckoutSummaryCardProps>): React.JSX.Element {
  const checkinDisplay = latestResult.checkedInAt
    ? dayjs(latestResult.checkedInAt).format('DD-MMM-YYYY HH:mm')
    : '-';

  return (
    <View className="rounded-2xl bg-white p-5 shadow-sm w-full">
      <View className="items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <Text className="text-2xl text-green-600">✓</Text>
        </View>
        <Text className="mt-2 text-lg font-bold text-green-700">
          Checkout Summary
        </Text>
        <Text className="mt-1 text-2xl font-bold text-foreground">
          Rp {latestResult.card?.balance.toLocaleString(LOCALE_ID) ?? '0'}
          {isSimulation ? ' (unchanged)' : ''}
        </Text>
      </View>
      <View className="mt-4 gap-2">
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Tap in at</Text>
          <Text className="text-xs font-semibold text-foreground">
            {checkinDisplay}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Tap out at</Text>
          <Text className="text-xs font-semibold text-foreground">
            {checkoutTime}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Duration</Text>
          <Text className="text-xs font-semibold text-foreground">
            {formatDuration(latestResult.durationMs ?? 0)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Charged Hours</Text>
          <Text className="text-xs font-semibold text-foreground">
            {latestResult.chargedHours ?? 0}h
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Fee</Text>
          <Text className="text-xs font-semibold text-foreground">
            Rp {latestResult.chargedAmount?.toLocaleString(LOCALE_ID) ?? '0'}
            {isSimulation ? ' (not deducted)' : ''}
          </Text>
        </View>
      </View>
      {onReset && (
        <Pressable
          testID="terminal-scan-another"
          className="mt-4 items-center justify-center h-10 rounded-full border border-[#FF0025]"
          onPress={onReset}
        >
          <Text className="text-sm font-semibold text-[#FF0025]">
            Scan Another Card
          </Text>
        </Pressable>
      )}
    </View>
  );
}
