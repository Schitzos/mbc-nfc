import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { RoleOption } from '../../../config/role-options';

type Props = {
  activeRoleKey: RoleOption['key'];
  roles: RoleOption[];
  onSelect: (roleKey: RoleOption['key']) => void;
};

const roleIcon: Record<RoleOption['key'], string> = {
  station: 'S',
  gate: 'G',
  terminal: 'T',
  scout: 'R',
};

const roleHint: Record<RoleOption['key'], string> = {
  station: 'Register and top up member card',
  gate: 'Tap in to activity',
  terminal: 'Tap out and deduct fee',
  scout: 'Read-only card inspection',
};

export function RoleOptionList({
  activeRoleKey,
  roles,
  onSelect,
}: Props): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-white p-4">
      <Text className="text-2xl font-bold text-foreground">Choose role</Text>

      <View className="mt-4 rounded-xl border border-[#2A8BFF] bg-[#EAF4FF] p-4">
        <Text className="text-lg font-semibold text-foreground">
          Offline NFC source of truth
        </Text>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Member identity, balance, activity status, and latest logs live on
          card.
        </Text>
      </View>

      <View className="mt-4 gap-3">
        {roles.map(role => {
          const active = role.key === activeRoleKey;
          return (
            <Pressable
              key={role.key}
              accessibilityRole="button"
              className={`flex-row items-center rounded-xl border px-4 py-3 ${
                active
                  ? 'border-[#2A8BFF] bg-[#EAF4FF]'
                  : 'border-slate-200 bg-white'
              }`}
              onPress={() => onSelect(role.key)}
            >
              <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-[#EAF4FF]">
                <Text className="text-xs font-bold text-[#2A8BFF]">
                  {roleIcon[role.key]}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-foreground">
                  {role.label}
                </Text>
                <Text className="text-xs text-muted">{roleHint[role.key]}</Text>
              </View>
              <Text className="text-lg text-muted">›</Text>
            </Pressable>
          );
        })}
      </View>

      <Text className="mt-4 text-xs text-muted">
        Default demo: Parking. Reusable activity model stays available.
      </Text>
    </View>
  );
}
