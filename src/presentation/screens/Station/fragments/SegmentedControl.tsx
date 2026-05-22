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
    <View className="flex-row bg-white/50 rounded-full p-1 border border-white/60">
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: registerMode }}
        onPress={() => setRegisterMode(true)}
        className={`flex-1 py-2.5 rounded-full items-center ${registerMode ? 'bg-pink-light' : ''}`}
      >
        <Text
          className={`text-sm font-semibold ${registerMode ? 'text-brand' : 'text-muted'}`}
        >
          Register
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="tab"
        accessibilityState={{ selected: !registerMode }}
        onPress={() => setRegisterMode(false)}
        className={`flex-1 py-2.5 rounded-full items-center ${!registerMode ? 'bg-pink-light' : ''}`}
      >
        <Text
          className={`text-sm font-semibold ${!registerMode ? 'text-brand' : 'text-muted'}`}
        >
          Top Up
        </Text>
      </Pressable>
    </View>
  );
}
