import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { RoleOption } from '@presentation/config/role-options';

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

const roleIconColorHex: Record<RoleOption['key'], string> = {
  station: '#15803d',
  gate: '#1d4ed8',
  terminal: '#c2410c',
  scout: '#7e22ce',
};

const roleColor: Record<RoleOption['key'], string> = {
  station: 'bg-green-100',
  gate: 'bg-blue-100',
  terminal: 'bg-orange-100',
  scout: 'bg-purple-100',
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
    <View className="gap-3">
      {roles.map(role => (
        <Pressable
          key={role.key}
          accessibilityRole="button"
          className="flex-row items-center rounded-2xl bg-white px-4 py-4 shadow-sm"
          onPress={() => onSelect(role.key)}
        >
          <View
            className={`mr-3 h-11 w-11 items-center justify-center rounded-xl ${roleColor[role.key]}`}
          >
            <Icon name={roleIcon[role.key]} size={24} color={roleIconColorHex[role.key]} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              {role.label}
            </Text>
            <Text className="text-xs text-muted">{roleHint[role.key]}</Text>
          </View>
          <Text className="text-lg text-muted">›</Text>
        </Pressable>
      ))}
    </View>
  );
}
