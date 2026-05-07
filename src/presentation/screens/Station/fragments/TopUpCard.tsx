import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { LOCALE_ID } from '@shared/constants';

interface TopUpCardProps {
  topUpAmount: string;
  setTopUpAmount: (v: string) => void;
}

export function TopUpCard({
  topUpAmount,
  setTopUpAmount,
}: Readonly<TopUpCardProps>): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-muted">Top Up Amount</Text>
      </View>
      <View className="mt-1 flex-row items-center">
        <Text className="text-3xl font-bold text-foreground">Rp </Text>
        <TextInput
          className="flex-1 text-3xl font-bold text-foreground p-0"
          keyboardType="numeric"
          value={Number(topUpAmount).toLocaleString(LOCALE_ID)}
          onChangeText={text => {
            const numeric = text.replaceAll(/\D/g, '');
            setTopUpAmount(numeric || '0');
          }}
        />
      </View>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {[10000, 20000, 50000, 100000].map(amount => (
          <Pressable
            key={amount}
            onPress={() => setTopUpAmount(String(amount))}
            className={`rounded-full border px-4 py-2 ${
              topUpAmount === String(amount)
                ? 'border-[#0050AE] bg-[#0050AE]'
                : 'border-slate-200 bg-white'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                topUpAmount === String(amount)
                  ? 'text-white'
                  : 'text-foreground'
              }`}
            >
              {amount.toLocaleString(LOCALE_ID)}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
