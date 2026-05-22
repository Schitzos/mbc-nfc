import React from 'react';
import { Text, View } from 'react-native';
import dayjs from 'dayjs';
import { SignalButton } from '@presentation/components/SignalButton';
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
    <View className="rounded-[20px] p-5 w-full bg-white/55 border border-white/70 gap-4">
      <View className="items-center">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[rgba(16,185,129,0.2)]">
          <Text className="text-2xl text-success">✓</Text>
        </View>
        <Text className="mt-2 text-lg font-bold text-foreground">
          Checkout Summary
        </Text>
        <Text className="mt-1 text-3xl font-extrabold text-foreground">
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
          <Text className="text-xs font-bold text-brand">
            Rp {latestResult.chargedAmount?.toLocaleString(LOCALE_ID) ?? '0'}
            {isSimulation ? ' (not deducted)' : ''}
          </Text>
        </View>
      </View>
      {onReset && (
        <SignalButton
          testID="terminal-scan-another"
          label="Scan Another Card"
          variant="secondary"
          onPress={onReset}
        />
      )}
    </View>
  );
}
