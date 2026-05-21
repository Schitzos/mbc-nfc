import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '@app/navigation';
import { SignalButton } from '@presentation/components/SignalButton';
import { LOCALE_ID } from '@shared/constants';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';

interface InsufficientBalanceCardProps {
  latestResult: RoleActionResultDto;
  onRetry: () => void;
}

export function InsufficientBalanceCard({
  latestResult,
  onRetry,
}: Readonly<InsufficientBalanceCardProps>): React.JSX.Element {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View className="gap-4 mb-4">
      <View className="rounded-[20px] p-4 bg-[rgba(255,82,82,0.1)] border border-[rgba(255,82,82,0.4)]">
        <Text className="text-base font-bold text-red-700">
          Insufficient balance
        </Text>
        <Text className="mt-1 text-xs text-[#6B7280]">
          Balance not enough to cover checkout fee.
        </Text>
        <View className="mt-3 flex-row gap-3">
          <View className="flex-1 rounded-xl p-3 bg-white/55 border border-white/70">
            <Text className="text-xs text-[#6B7280]">Required Fee</Text>
            <Text className="text-lg font-bold text-[#111827]">
              Rp {latestResult.chargedAmount?.toLocaleString(LOCALE_ID) ?? '0'}
            </Text>
          </View>
          <View className="flex-1 rounded-xl p-3 bg-white/55 border border-white/70">
            <Text className="text-xs text-[#6B7280]">Available Balance</Text>
            <Text className="text-lg font-bold text-red-600">
              Rp {latestResult.card?.balance.toLocaleString(LOCALE_ID) ?? '0'}
            </Text>
          </View>
        </View>
      </View>

      <View className="rounded-[20px] p-4 bg-white/55 border border-white/70">
        <View className="flex-row items-center gap-2">
          <Text className="text-amber-500">⚠</Text>
          <Text className="text-sm font-bold text-[#111827]">
            What you can do
          </Text>
        </View>
        <Text className="mt-1 text-xs text-[#6B7280]">
          Please go to a Station to top up your balance and try again.
        </Text>
      </View>

      <SignalButton
        label="Go to Station Top Up"
        onPress={() => navigation.navigate('station')}
      />
      <SignalButton
        label="Retry Checkout"
        variant="secondary"
        onPress={onRetry}
      />
    </View>
  );
}
