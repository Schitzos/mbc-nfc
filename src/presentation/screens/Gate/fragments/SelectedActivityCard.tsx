import React from 'react';
import { Text, View } from 'react-native';

export function SelectedActivityCard(): React.JSX.Element {
  return (
    <View className="rounded-[20px] p-4 bg-white/55 border border-white/70">
      <Text className="text-xs text-[#6B7280]">Selected Activity</Text>
      <View className="mt-2 flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-[#DBEAFE]">
          <Text className="text-base text-[#2563EB]">P</Text>
        </View>
        <Text className="text-xl font-bold text-[#111827]">Parking</Text>
      </View>
    </View>
  );
}
