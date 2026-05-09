import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

export function AppHeaderCard({
  title,
  subTitle,
  hasBackButton,
  rightIcon,
}: Readonly<{
  title: string;
  subTitle?: string;
  hasBackButton?: boolean;
  rightIcon?: React.JSX.Element;
}>): React.JSX.Element {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top + 32 }} className="bg-[#001A41] px-6 pb-12">
      <View className="flex-row items-center gap-2 w-max justify-between">
        <View className="flex-row items-center gap-4 ">
          {hasBackButton && (
            <TouchableOpacity
              accessibilityLabel="Go back"
              className="h-6 w-6 items-center justify-center"
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={16} color="#fff" />
            </TouchableOpacity>
          )}
          <Text className="text-2xl font-bold text-white">{title}</Text>
        </View>
        {rightIcon && <View className="items-center justify-center">
          {rightIcon}
        </View>}
      </View>
      <Text className="mt-1 text-sm text-slate-300">{subTitle || ''}</Text>
    </View>
  );
}
