import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  modeLabel: string;
  onBack: () => void;
};

export function StationHeader({ modeLabel, onBack }: Props): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-[#001A41] p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-white">The Station</Text>
          <Text className="text-sm text-slate-200">{modeLabel}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-[#EAF4FF] px-4 py-2"
          onPress={onBack}
        >
          <Text className="text-xs font-bold uppercase text-[#0050AE]">
            Station
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
