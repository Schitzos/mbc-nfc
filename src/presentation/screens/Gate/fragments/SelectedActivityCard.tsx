import React from 'react';
import { Text, View } from 'react-native';

export function SelectedActivityCard(): React.JSX.Element {
  return (
    <View
      className="rounded-2xl bg-white p-4"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
        shadowColor: '#3B82F6',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      }}
    >
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
