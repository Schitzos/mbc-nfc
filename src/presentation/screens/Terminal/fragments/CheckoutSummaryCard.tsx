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
    <View className="rounded-[20px] p-5 w-full bg-white/55 border border-white/70">
      <View className="items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[rgba(16,185,129,0.2)]">
          <Text className="text-2xl text-[#059669]">✓</Text>
        </View>
        <Text className="mt-2 text-lg font-bold text-[#111827]">
          Checkout Summary
        </Text>
        <Text className="mt-1 text-3xl font-extrabold text-[#111827]">
          Rp {latestResult.card?.balance.toLocaleString(LOCALE_ID) ?? '0'}
          {isSimulation ? ' (unchanged)' : ''}
        </Text>
      </View>
      <View className="mt-4 gap-2">
        <View className="flex-row justify-between">
          <Text className="text-xs text-[#6B7280]">Tap in at</Text>
          <Text className="text-xs font-semibold text-[#111827]">
            {checkinDisplay}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-[#6B7280]">Tap out at</Text>
          <Text className="text-xs font-semibold text-[#111827]">
            {checkoutTime}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-[#6B7280]">Duration</Text>
          <Text className="text-xs font-semibold text-[#111827]">
            {formatDuration(latestResult.durationMs ?? 0)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-[#6B7280]">Charged Hours</Text>
          <Text className="text-xs font-semibold text-[#111827]">
            {latestResult.chargedHours ?? 0}h
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-[#6B7280]">Fee</Text>
          <Text className="text-xs font-bold text-brand">
            Rp {latestResult.chargedAmount?.toLocaleString(LOCALE_ID) ?? '0'}
            {isSimulation ? ' (not deducted)' : ''}
          </Text>
        </View>
      </View>
      {onReset && (
        <Pressable
          testID="terminal-scan-another"
          className="mt-4 items-center justify-center h-10 rounded-full bg-brand"
          onPress={onReset}
        >
          <Text className="text-sm font-semibold text-white">
            Scan Another Card
          </Text>
        </Pressable>
      )}
    </View>
  );
}
