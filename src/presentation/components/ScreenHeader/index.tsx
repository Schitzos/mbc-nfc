import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ScreenHeaderProps {
  title: string;
  subtitle: string;
  badgeLabel: string;
  badgeIcon: string;
  badgeColor: string;
  showBack?: boolean;
}

export function ScreenHeader({
  title,
  subtitle,
  badgeLabel,
  badgeIcon,
  badgeColor,
  showBack = true,
}: Readonly<ScreenHeaderProps>): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View style={{ paddingTop: insets.top + 24 }} className="px-6 pb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-4">
          {showBack && (
            <TouchableOpacity
              accessibilityLabel="Go back"
              className="h-6 w-6 items-center justify-center"
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={20} color="#111827" />
            </TouchableOpacity>
          )}
          <Text className="text-[24px] font-bold text-[#111827]">{title}</Text>
        </View>
        <View
          className="px-4 py-1.5 rounded-full bg-white/50 flex-row items-center gap-1 border"
          style={{ borderColor: `${badgeColor}30` }}
        >
          <Icon name={badgeIcon} size={14} color={badgeColor} />
          <Text style={{ color: badgeColor }} className="text-xs font-semibold">
            {badgeLabel}
          </Text>
        </View>
      </View>
      <Text
        className={`text-sm text-[#6B7280] mt-1 ${showBack ? 'ml-10' : ''}`}
      >
        {subtitle}
      </Text>
    </View>
  );
}
