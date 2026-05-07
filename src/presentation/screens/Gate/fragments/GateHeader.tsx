import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface GateHeaderProps {
  onBack: () => void;
}

export function GateHeader({
  onBack,
}: Readonly<GateHeaderProps>): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-[#001A41] p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-[#D7FFE9]">
            <Text className="text-base font-bold text-[#007A4D]">↦</Text>
          </View>
          <View>
            <Text className="text-2xl font-bold text-white">The Gate</Text>
            <Text className="text-sm text-slate-200">Activity check-in</Text>
          </View>
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
