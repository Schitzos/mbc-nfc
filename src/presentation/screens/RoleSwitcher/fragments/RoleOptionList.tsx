import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import type { RoleOption } from '../../../config/role-options';

interface RoleOptionListProps {
  activeRoleKey: RoleOption['key'] | null;
  roles: RoleOption[];
  onSelect: (roleKey: RoleOption['key']) => void;
}

const roleIcon: Record<RoleOption['key'], string> = {
  station: '+',
  gate: '↦',
  terminal: '✓',
  scout: '◎',
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
}: Readonly<RoleOptionListProps>): React.JSX.Element {
  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-2xl font-bold text-foreground">Choose role</Text>
      <Text className="mt-1 text-sm text-muted">
        Single app, four operational roles.
      </Text>

      <View className="mt-4 rounded-xl border border-[#2A8BFF] bg-[#EAF4FF] p-4">
        <View className="flex-row items-center">
          <Image
            source={require('../../../assets/icons/nfc-tap.png')}
            className="mr-2 h-5 w-5"
          />
          <Text className="text-lg font-semibold text-foreground">
            Offline NFC source of truth
          </Text>
        </View>
        <Text className="mt-1 text-sm leading-5 text-muted">
          Member identity, balance, activity status, and latest logs live on
          card.
        </Text>
      </View>

      <View className="mt-4 gap-2.5">
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
              <View
                className={`mr-3 h-7 w-7 items-center justify-center rounded-full ${
                  active ? 'bg-[#2A8BFF]' : 'bg-[#EAF4FF]'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    active ? 'text-white' : 'text-[#2A8BFF]'
                  }`}
                >
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
    </View>
  );
}
