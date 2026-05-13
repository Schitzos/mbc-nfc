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
    <View className="flex-row bg-white rounded-full p-1 border border-slate-200">
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: registerMode }}
        onPress={() => setRegisterMode(true)}
        className={`flex-1 py-2 rounded-full items-center ${registerMode ? 'bg-[#16A34A]' : ''}`}
      >
        <Text
          className={`text-sm font-semibold ${registerMode ? 'text-white' : 'text-[#4E5764]'}`}
        >
          Register
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: !registerMode }}
        onPress={() => setRegisterMode(false)}
        className={`flex-1 py-2 rounded-full items-center ${!registerMode ? 'bg-[#16A34A]' : ''}`}
      >
        <Text
          className={`text-sm font-semibold ${!registerMode ? 'text-white' : 'text-[#4E5764]'}`}
        >
          Top Up
        </Text>
      </Pressable>
    </View>
  );
}
