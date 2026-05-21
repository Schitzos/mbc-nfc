import React from 'react';
import { Text, View } from 'react-native';

export function TariffPreviewCard(): React.JSX.Element {
  return (
    <View className="rounded-[20px] p-4 bg-white/55 border border-white/70">
      <View className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#FDDDD4] items-center justify-center">
        <Text className="text-xs font-bold text-[#FF0025]">P</Text>
      </View>
      <Text className="text-xs text-[#6B7280]">Tariff Preview</Text>
      <Text className="mt-1 text-2xl font-bold text-[#111827]">
        Rp 2.000{' '}
        <Text className="text-sm font-normal text-[#6B7280]">
          / started hour
        </Text>
      </Text>
      <Text className="mt-1 text-xs text-[#6B7280]">Fixed tariff</Text>
    </View>
  );
}
