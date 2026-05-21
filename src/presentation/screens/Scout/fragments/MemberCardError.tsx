import React from 'react';
import { Text, View } from 'react-native';

interface ScoutErrorCardProps {
  message: string;
}

export function ScoutErrorCard({
  message,
}: Readonly<ScoutErrorCardProps>): React.JSX.Element {
  return (
    <View className="rounded-[20px] p-4 border border-[rgba(255,82,82,0.4)] bg-[rgba(255,82,82,0.1)]">
      <Text className="text-xs font-semibold text-[#DC2626] uppercase">
        Card cannot be processed
      </Text>
      <Text className="mt-1 text-sm font-semibold text-[#111827]">
        {message}
      </Text>
    </View>
  );
}
