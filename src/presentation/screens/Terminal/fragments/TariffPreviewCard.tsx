import React from 'react';
import { Text, View } from 'react-native';

export function TariffPreviewCard(): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-xs text-muted">Tariff Preview</Text>
      <Text className="mt-1 text-2xl font-bold text-foreground">
        Rp 2.000{' '}
        <Text className="text-sm font-normal text-muted">/ started hour</Text>
      </Text>
      <Text className="mt-1 text-xs text-muted">Fixed tariff</Text>
    </View>
  );
}
