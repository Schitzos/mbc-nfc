import React from 'react';
import { Text, View } from 'react-native';

export function TariffPreviewCard(): React.JSX.Element {
  return (
    <View className="rounded-[20px] p-4 bg-white/55 border border-white/70">
      <View className="absolute top-3 right-3 w-7 h-7 rounded-full bg-error-light items-center justify-center">
        <Text className="text-xs font-bold text-brand">P</Text>
      </View>
      <Text className="text-xs text-muted">Tariff Preview</Text>
      <Text className="mt-1 text-2xl font-bold text-foreground">
        Rp 2.000{' '}
        <Text className="text-sm font-normal text-muted">/ started hour</Text>
      </Text>
      <Text className="mt-1 text-xs text-muted">Fixed tariff</Text>
    </View>
  );
}
