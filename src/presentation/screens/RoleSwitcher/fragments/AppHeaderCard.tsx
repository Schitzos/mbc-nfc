import React from 'react';
import { Image, Text, View } from 'react-native';

export function AppHeaderCard(): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-[#001A41] p-4 shadow-md">
      <View className="flex-row items-center">
        <Image
          source={require('../../../assets/icons/nfc-logo.png')}
          className="mr-3 h-10 w-10 rounded-xl bg-white"
        />
        <View className="flex-1">
          <Text className="text-xl font-bold text-white">MBC Card</Text>
          <Text className="mt-0.5 text-sm text-slate-200">
            Professional NFC check-in and checkout
          </Text>
        </View>
        <Text className="text-xs font-semibold uppercase text-slate-200">
          Info
        </Text>
      </View>
      <Text className="mt-3 text-sm text-slate-200">Select operating role</Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {[
          'Offline Ready',
          'NFC Powered',
          'Fast Check-In',
          'Secure Tracking',
        ].map(chip => (
          <View
            key={chip}
            className="rounded-full border border-slate-500/50 bg-white/10 px-3 py-1.5"
          >
            <Text className="text-xs font-semibold text-slate-100">{chip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
