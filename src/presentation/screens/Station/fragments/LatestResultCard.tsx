import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
      <Text className="text-sm font-bold text-white">Latest result</Text>
      <Text
        className={`mt-1 text-xs font-semibold ${
          latestResult.success ? 'text-[#00E676]' : 'text-[#FF5252]'
        }`}
      >
        {latestResult.success ? 'Success' : 'Unable to complete'}
      </Text>
      <Text className="mt-1 text-xs text-white/70">{latestResult.message}</Text>
      {latestResult.card && (
        <View className="mt-2 flex-row items-center gap-2 border-t border-white/10 pt-2">
          <View className="h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <Text className="text-xs">💳</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-white/60">
              {latestResult.card.maskedMemberReference ?? 'MBR-****'}
            </Text>
            {latestResult.card.memberName && (
              <Text className="text-xs text-white/60">
                {latestResult.card.memberName}
              </Text>
            )}
          </View>
          <Text className="text-lg font-bold text-white">
            Rp {latestResult.card.balance.toLocaleString(LOCALE_ID)}
          </Text>
        </View>
      )}
      {latestResult.card && !registerMode && (
        <Text className="mt-1 text-xs text-white/50">Updated just now</Text>
      )}
      {latestResult.card && (
        <Text className="mt-1 text-xs text-white/50">
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
    <LinearGradient colors={['#064E3B', '#065F46']} style={s.card}>
      {children}
    </LinearGradient>
  );
}

function ErrorWrapper({ children }: { children: React.ReactNode }) {
  return <View style={[s.card, s.errorCard]}>{children}</View>;
}

const s = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  errorCard: {
    backgroundColor: '#1E293B',
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
});
