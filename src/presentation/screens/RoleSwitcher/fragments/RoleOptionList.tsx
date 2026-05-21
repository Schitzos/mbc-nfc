import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
  station: '#00E676',
  gate: '#60A5FA',
  terminal: '#FB923C',
  scout: '#A78BFA',
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
          style={s.card}
          onPress={() => onSelect(role.key)}
        >
          <View
            style={[
              s.iconBox,
              { backgroundColor: `${roleIconColorHex[role.key]}22` },
            ]}
          >
            <Icon
              name={roleIcon[role.key]}
              size={24}
              color={roleIconColorHex[role.key]}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-white">{role.label}</Text>
            <Text className="text-xs text-white/[0.72]">
              {roleHint[role.key]}
            </Text>
          </View>
          <Text className="text-lg text-white/50">›</Text>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(13,27,62,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});
