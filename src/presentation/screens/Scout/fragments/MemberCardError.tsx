import React from 'react';
import { Text, View } from 'react-native';

interface ScoutErrorCardProps {
  message: string;
}

export function ScoutErrorCard({
  message,
}: Readonly<ScoutErrorCardProps>): React.JSX.Element {
  return (
    <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3">
      <Text className="text-xs font-semibold uppercase text-red-700">
        Card cannot be processed
      </Text>
      <Text className="mt-1 text-sm font-semibold text-red-900">
        {message}
      </Text>
    </View>
  );
}
