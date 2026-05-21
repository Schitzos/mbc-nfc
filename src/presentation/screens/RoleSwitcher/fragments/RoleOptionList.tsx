import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { RoleOption } from '@presentation/config/role-options';
import { signalColorTokens } from '@presentation/theme/colors';

interface RoleOptionListProps {
  activeRoleKey: RoleOption['key'] | null;
  roles: RoleOption[];
  onSelect: (roleKey: RoleOption['key']) => void;
}

const roleIcon: Record<RoleOption['key'], string> = {
  station: 'add-circle-outline',
  gate: 'sensor-door',
  terminal: 'settings',
  scout: 'search',
};

const roleHint: Record<RoleOption['key'], string> = {
  station: 'Register and top up member card',
  gate: 'Tap in to activity',
  terminal: 'Tap out and deduct fee',
  scout: 'Read-only card inspection',
};

export function RoleOptionList({
  roles,
  onSelect,
}: Readonly<RoleOptionListProps>): React.JSX.Element {
  return (
    <View className="gap-4">
      {roles.map(role => (
        <Pressable
          key={role.key}
          accessibilityRole="button"
          className="flex-row items-center rounded-[20px] px-4 py-5 bg-white/55 border border-white/70"
          onPress={() => onSelect(role.key)}
        >
          <View className="w-[52px] h-[52px] rounded-[14px] items-center justify-center mr-3.5 bg-[#FFE4E8]">
            <Icon
              name={roleIcon[role.key]}
              size={26}
              color={signalColorTokens.brand.primary}
            />
          </View>
          <View className="flex-1">
            <Text className="text-[16px] font-bold text-[#111827]">
              {role.label}
            </Text>
            <Text className="text-[13px] text-[#6B7280] mt-0.5">
              {roleHint[role.key]}
            </Text>
          </View>
          <Icon
            name="chevron-right"
            size={24}
            color={signalColorTokens.brand.primary}
          />
        </Pressable>
      ))}
    </View>
  );
}
