import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { LOCALE_ID } from '@shared/constants';

type Props = Readonly<{
  topUpAmount: string;
  setTopUpAmount: (value: string) => void;
}>;

export function AmountInput({
  topUpAmount,
  setTopUpAmount,
}: Props): React.JSX.Element {
  return (
    <View className="mt-3 rounded-xl bg-white p-3 shadow-sm">
      <Text className="text-xs font-semibold text-[#4E5764]">
        Top Up Amount
      </Text>
      <View className="mt-1 flex-row items-center">
        <Text className="text-2xl font-bold text-[#1A1A1A]">Rp </Text>
        <TextInput
          className="flex-1 text-2xl font-bold text-[#1A1A1A] p-0"
          keyboardType="numeric"
          value={Number(topUpAmount).toLocaleString(LOCALE_ID)}
          onChangeText={text => {
            const numeric = text.replaceAll(/\D/g, '');
            setTopUpAmount(numeric || '0');
          }}
        />
      </View>
      <View className="mt-2 flex-row gap-2">
        {[10000, 20000, 50000, 100000].map(amount => (
          <Pressable
            key={amount}
            onPress={() => setTopUpAmount(String(amount))}
            className={`rounded-full border px-3 py-1.5 ${
              topUpAmount === String(amount)
                ? 'border-[#16A34A] bg-[#16A34A]'
                : 'border-slate-200 bg-white'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                topUpAmount === String(amount) ? 'text-white' : 'text-[#4E5764]'
              }`}
            >
              {amount / 1000}k
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
