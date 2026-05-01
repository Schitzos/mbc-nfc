import React from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../app/navigation';
import { roleOptions } from '../config/role-options';
import { SignalOptionCard } from '../components/SignalOptionCard';
import { useAppStore } from '../stores/app-store';

type Props = Partial<
  NativeStackScreenProps<RootStackParamList, 'roleSwitcher'>
>;

export function RoleSwitcherScreen({ navigation }: Props): React.JSX.Element {
  const selectedRole = useAppStore(state => state.selectedRole);
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const activeRole =
    roleOptions.find(role => role.key === selectedRole) ?? roleOptions[0];

  const handleSelectRole = (roleKey: (typeof roleOptions)[number]['key']) => {
    setSelectedRole(roleKey);
    navigation?.navigate?.(roleKey);
  };

  return (
    <View className="flex-1 bg-background px-6 py-6">
      <View className="flex-1 justify-end gap-4">
        <View className="rounded-3xl bg-white p-6 shadow-sm">
          <Text className="text-xs font-semibold uppercase tracking-wide text-accent">
            Shared app shell
          </Text>
          <Text className="mt-2 text-3xl font-bold text-foreground">
            KDX Membership Benefit Card
          </Text>
          <Text className="mt-3 text-base leading-6 text-muted">
            Switch roles from one app without resetting the current card source.
            The selected role stays visible so the active operator context is
            never ambiguous.
          </Text>
        </View>

        <View className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Active role
          </Text>
          <Text className="mt-2 text-2xl font-bold text-foreground">
            {activeRole.label}
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            {activeRole.purpose}
          </Text>
          <Text className="mt-3 text-sm font-semibold text-blue-700">
            {activeRole.note}
          </Text>
        </View>

        <View className="rounded-3xl bg-white p-6 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Choose workspace
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Pick the role you want to operate. The app will open that workspace
            immediately so there is no extra step before the real NFC flow.
          </Text>

          <View className="mt-5 gap-3">
            {roleOptions.map(role => {
              const isActive = activeRole.key === role.key;

              return (
                <SignalOptionCard
                  key={role.key}
                  title={role.label}
                  state={isActive ? 'selected' : 'default'}
                  onPress={() => handleSelectRole(role.key)}
                />
              );
            })}
          </View>

          <Text className="mt-4 text-sm leading-5 text-muted">
            Station, Gate, Terminal, and Scout are all available in the current
            demo build.
          </Text>
        </View>
      </View>
    </View>
  );
}
