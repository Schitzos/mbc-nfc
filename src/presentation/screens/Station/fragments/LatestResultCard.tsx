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
  const Wrapper = latestResult.success ? SuccessWrapper : ErrorWrapper;

  return (
    <Wrapper>
      <Text className="text-sm font-bold text-black">Latest result</Text>
      <Text
        className={`mt-1 text-xs font-semibold ${
          latestResult.success ? 'text-[#00E676]' : 'text-[#FF5252]'
        }`}
      >
        {latestResult.success ? 'Success' : 'Unable to complete'}
      </Text>
      <Text className="mt-1 text-xs text-black/70">{latestResult.message}</Text>
      {latestResult.card && (
        <View className="mt-2 flex-row items-center gap-2 border-t border-black/10 pt-2">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-black/10">
            <Text className="text-xs">💳</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-black/60">
              {latestResult.card.maskedMemberReference ?? 'MBR-****'}
            </Text>
            {latestResult.card.memberName && (
              <Text className="text-xs text-black/60">
                {latestResult.card.memberName}
              </Text>
            )}
          </View>
          <Text className="text-lg font-bold text-black">
            Rp {latestResult.card.balance.toLocaleString(LOCALE_ID)}
          </Text>
        </View>
      )}
      {latestResult.card && !registerMode && (
        <Text className="mt-1 text-xs text-black/50">Updated just now</Text>
      )}
      {latestResult.card && (
        <Text className="mt-1 text-xs text-black/50">
          Status:{' '}
          {latestResult.card.visitStatus === 'CHECKED_IN'
            ? 'Checked in'
            : 'Not checked in'}
        </Text>
      )}
    </Wrapper>
  );
}

function SuccessWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View className="rounded-2xl p-4 bg-white/60 border-l-[3px] border-l-[#16A34A]">
      {children}
    </View>
  );
}

function ErrorWrapper({ children }: { children: React.ReactNode }) {
  return (
    <View className="rounded-2xl p-4 bg-white/60 border-l-[3px] border-l-[#DC2626]">
      {children}
    </View>
  );
}
