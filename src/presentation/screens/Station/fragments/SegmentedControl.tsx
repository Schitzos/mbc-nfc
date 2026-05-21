import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = Readonly<{
  registerMode: boolean;
  setRegisterMode: (value: boolean) => void;
}>;

export function SegmentedControl({
  registerMode,
  setRegisterMode,
}: Props): React.JSX.Element {
  return (
    <View className="flex-row bg-[#0F172A] rounded-full p-1">
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: registerMode }}
        onPress={() => setRegisterMode(true)}
        className={`flex-1 py-2 rounded-full items-center ${registerMode ? 'bg-[#DC2626]' : ''}`}
      >
        <Text className="text-sm font-semibold text-white">Register</Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: !registerMode }}
        onPress={() => setRegisterMode(false)}
        className={`flex-1 py-2 rounded-full items-center ${!registerMode ? 'bg-[#DC2626]' : ''}`}
      >
        <Text className="text-sm font-semibold text-white">Top Up</Text>
      </Pressable>
    </View>
  );
}
