import React from 'react';
import { Text, View } from 'react-native';

export function SelectedActivityCard(): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-xs text-muted">Selected Activity</Text>
      <View className="mt-2 flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
          <Text className="text-base text-blue-600">P</Text>
        </View>
        <Text className="text-xl font-bold text-foreground">Parking</Text>
      </View>
    </View>
  );
}
