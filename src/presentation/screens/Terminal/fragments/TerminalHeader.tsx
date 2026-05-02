import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Props = {
  subtitle: string;
  onBack: () => void;
};

export function TerminalHeader({ subtitle, onBack }: Props): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-[#001A41] p-4">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-white">The Terminal</Text>
          <Text className="text-sm text-slate-200">{subtitle}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-[#FFF2D8] px-4 py-2"
          onPress={onBack}
        >
          <Text className="text-xs font-bold uppercase text-[#8A5B00]">
            Terminal
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
