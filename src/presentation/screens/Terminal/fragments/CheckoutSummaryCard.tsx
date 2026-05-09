import React from 'react';
import { Text, View } from 'react-native';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import { LOCALE_ID } from '@shared/constants';

interface CheckoutSummaryCardProps {
  latestResult: RoleActionResultDto;
  checkoutTime: string;
}

export function CheckoutSummaryCard({
  latestResult,
  checkoutTime,
}: Readonly<CheckoutSummaryCardProps>): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm mb-4">
      <Text className="mb-2 text-sm font-bold text-foreground">
        Checkout Summary
      </Text>
      <View className="gap-2">
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Tap out at</Text>
          <Text className="text-xs font-semibold text-foreground">
            {checkoutTime}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Duration</Text>
          <Text className="text-xs font-semibold text-foreground">
            {(() => {
              const ms = latestResult.durationMs ?? 0;
              const totalSec = Math.floor(ms / 1000);
              const h = Math.floor(totalSec / 3600);
              const m = Math.floor((totalSec % 3600) / 60);
              const s = totalSec % 60;
              return `${h}h ${m}m ${s}s`;
            })()}
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
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">New Balance</Text>
          <Text className="text-xs font-bold text-foreground">
            Rp {latestResult.card?.balance.toLocaleString(LOCALE_ID) ?? '0'}
          </Text>
        </View>
      </View>
    </View>
  );
}
