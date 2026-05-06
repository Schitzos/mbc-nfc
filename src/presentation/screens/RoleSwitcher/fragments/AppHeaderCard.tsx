import React from 'react';
import { Text, View } from 'react-native';

export function AppHeaderCard(): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-[#001A41] p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-bold text-white">MBC Card</Text>
        <Text className="text-xs font-semibold uppercase text-slate-200">
          Info
        </Text>
      </View>
      <Text className="mt-1 text-sm text-slate-200">Select operating role</Text>
    </View>
  );
}
