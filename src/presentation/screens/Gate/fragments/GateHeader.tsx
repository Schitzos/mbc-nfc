import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  onBack: () => void;
};

export function GateHeader({ onBack }: Props): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-[#001A41] p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-white">The Gate</Text>
          <Text className="text-sm text-slate-200">Activity check-in</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-[#D7FFE9] px-4 py-2"
          onPress={onBack}
        >
          <Text className="text-xs font-bold uppercase text-[#007A4D]">
            Gate
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
