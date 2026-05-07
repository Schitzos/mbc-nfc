import React from 'react';
import { Text, View } from 'react-native';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import { LOCALE_ID } from '@shared/constants';

interface LatestResultCardProps {
  latestResult: RoleActionResultDto;
  registerMode: boolean;
}

export function LatestResultCard({
  latestResult,
  registerMode,
}: Readonly<LatestResultCardProps>): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-sm font-bold text-foreground">Latest result</Text>
      <Text
        className={`mt-1 text-xs font-semibold ${
          latestResult.success ? 'text-green-700' : 'text-red-700'
        }`}
      >
        {latestResult.success ? 'Success' : 'Unable to complete'}
      </Text>
      <Text className="mt-1 text-xs text-muted">{latestResult.message}</Text>
      {latestResult.card && (
        <View className="mt-2 flex-row items-center gap-2 border-t border-slate-100 pt-2">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#EAF4FF]">
            <Text className="text-xs text-[#0050AE]">💳</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted">
              {latestResult.card.maskedMemberReference ?? 'MBR-****'}
            </Text>
            {latestResult.card.memberName && (
              <Text className="text-xs text-muted">
                {latestResult.card.memberName}
              </Text>
            )}
          </View>
          <Text className="text-lg font-bold text-foreground">
            Rp {latestResult.card.balance.toLocaleString(LOCALE_ID)}
          </Text>
        </View>
      )}
      {latestResult.card && !registerMode && (
        <Text className="mt-1 text-xs text-muted">Updated just now</Text>
      )}
      {latestResult.card && (
        <Text className="mt-1 text-xs text-muted">
          Status:{' '}
          {latestResult.card.visitStatus === 'CHECKED_IN'
            ? 'Checked in'
            : 'Not checked in'}
        </Text>
      )}
    </View>
  );
}
