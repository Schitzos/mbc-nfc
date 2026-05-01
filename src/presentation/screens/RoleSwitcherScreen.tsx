import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../app/navigation';
import { useAppStore } from '../stores/app-store';

const roles = [
  { key: 'station', label: 'Station' },
  { key: 'gate', label: 'Gate' },
  { key: 'terminal', label: 'Terminal' },
  { key: 'scout', label: 'Scout' },
] as const;

type Props = Partial<
  NativeStackScreenProps<RootStackParamList, 'roleSwitcher'>
>;

export function RoleSwitcherScreen({ navigation }: Props): React.JSX.Element {
  const selectedRole = useAppStore(state => state.selectedRole);
  const setSelectedRole = useAppStore(state => state.setSelectedRole);

  return (
    <View className="flex-1 bg-background px-6 py-10">
      <View className="mt-auto rounded-2xl bg-white p-6 shadow-sm">
        <Text className="text-3xl font-bold text-foreground">
          KDX Membership Benefit Card
        </Text>
        <Text className="mt-3 text-base leading-6 text-muted">
          Core dependencies are wired. Role flows will be added feature by
          feature from the execution order.
        </Text>

        <View className="mt-6 flex-row flex-wrap gap-3">
          {roles.map(role => {
            const isActive = selectedRole === role.key;

            return (
              <Pressable
                key={role.key}
                accessibilityRole="button"
                className={`rounded-full border px-4 py-3 ${
                  isActive
                    ? 'border-accent bg-accent'
                    : 'border-slate-200 bg-slate-100'
                }`}
                onPress={() => {
                  setSelectedRole(role.key);

                  if (role.key === 'station') {
                    navigation?.navigate?.('station');
                  }

                  if (role.key === 'gate') {
                    navigation?.navigate?.('gate');
                  }

                  if (role.key === 'terminal') {
                    navigation?.navigate?.('terminal');
                  }
                }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    isActive ? 'text-white' : 'text-foreground'
                  }`}
                >
                  {role.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-5 text-sm leading-5 text-muted">
          Station, Gate, and Terminal are ready for the current demo path. Scout
          will be wired in the next execution phase.
        </Text>
      </View>
    </View>
  );
}
