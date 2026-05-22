import React from 'react';
import { Image, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '@app/navigation';
import { SignalButton } from '@presentation/components/SignalButton';
import { LOCALE_ID } from '@shared/constants';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';

const cardErrorIcon = require('@presentation/assets/icon-card-error.png');

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
    <View className="gap-4 mb-4 w-full">
      <View className="rounded-[20px] p-5 bg-white/60 border border-pink-light gap-4">
        <View className="flex-row items-center gap-4">
          <Image
            source={cardErrorIcon}
            className="w-[80px] h-[80px]"
            resizeMode="contain"
          />
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase text-brand">
              INSUFFICIENT BALANCE
            </Text>
            <Text className="mt-1 text-sm font-semibold text-foreground">
              Balance not enough to cover checkout fee.
            </Text>
          </View>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-xl p-3 bg-white/55 border border-white/70">
            <Text className="text-xs text-muted">Required Fee</Text>
            <Text className="text-lg font-bold text-foreground">
              Rp {latestResult.chargedAmount?.toLocaleString(LOCALE_ID) ?? '0'}
            </Text>
          </View>
          <View className="flex-1 rounded-xl p-3 bg-white/55 border border-white/70">
            <Text className="text-xs text-muted">Available Balance</Text>
            <Text className="text-lg font-bold text-red-600">
              Rp {latestResult.card?.balance.toLocaleString(LOCALE_ID) ?? '0'}
            </Text>
          </View>
        </View>
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
