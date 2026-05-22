import React from 'react';
import { Image, Text, View } from 'react-native';
import { SignalButton } from '@presentation/components/SignalButton';

const cardErrorIcon = require('@presentation/assets/icon-card-error.png');

interface ScoutErrorCardProps {
  message: string;
  onReset?: () => void;
}

export function ScoutErrorCard({
  message,
  onReset,
}: Readonly<ScoutErrorCardProps>): React.JSX.Element {
  return (
    <View className="rounded-[20px] p-5 w-full bg-white/60 border border-pink-light gap-4">
      <View className="flex-row items-center gap-4">
        <Image
          source={cardErrorIcon}
          className="w-[120px] h-[120px]"
          resizeMode="contain"
        />
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase text-brand">
            CARD CANNOT BE PROCESSED
          </Text>
          <Text className="mt-1 text-sm font-semibold text-foreground">
            {message}
          </Text>
        </View>
      </View>
      {onReset && (
        <SignalButton
          testID="scout-scan-another"
          label="Scan Another Card"
          onPress={onReset}
        />
      )}
    </View>
  );
}
