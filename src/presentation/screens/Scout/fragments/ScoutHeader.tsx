import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  onBack: () => void;
};

export function ScoutHeader({ onBack }: Props): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-[#001A41] p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-white">The Scout</Text>
          <Text className="text-sm text-slate-200">Read-only inspection</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-white px-4 py-2"
          onPress={onBack}
        >
          <Text className="text-xs font-bold uppercase text-[#0050AE]">
            Scout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
