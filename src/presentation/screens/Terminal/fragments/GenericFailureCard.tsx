import React from 'react';
import { Image, Text, View } from 'react-native';
import { SignalButton } from '@presentation/components/SignalButton';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';

const cardErrorIcon = require('@presentation/assets/icon-card-error.png');

interface GenericFailureCardProps {
  latestResult: RoleActionResultDto;
  onReset?: () => void;
}

export function GenericFailureCard({
  latestResult,
  onReset,
}: Readonly<GenericFailureCardProps>): React.JSX.Element {
  return (
    <View className="rounded-[20px] p-5 w-full bg-white/60 border border-pink-light gap-4">
      <View className="flex-row items-center gap-4">
        <Image
          source={cardErrorIcon}
          className="w-[80px] h-[80px]"
          resizeMode="contain"
        />
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase text-brand">
            CARD CANNOT BE PROCESSED
          </Text>
          <Text className="mt-1 text-sm font-semibold text-foreground">
            {latestResult.message}
          </Text>
        </View>
      </View>
      {onReset && (
        <SignalButton
          testID="terminal-scan-another"
          label="Scan Another Card"
          onPress={onReset}
        />
      )}
    </View>
  );
}
