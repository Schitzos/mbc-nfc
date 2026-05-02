import React from 'react';
import { ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../app/navigation';
import { roleOptions } from '../../config/role-options';
import { useAppStore } from '../../stores/app-store';
import { AppHeaderCard } from './fragments/AppHeaderCard';
import { RoleOptionList } from './fragments/RoleOptionList';

type Props = Partial<
  NativeStackScreenProps<RootStackParamList, 'roleSwitcher'>
>;

export function RoleSwitcherScreen({ navigation }: Props): React.JSX.Element {
  const selectedRole = useAppStore(state => state.selectedRole);
  const setSelectedRole = useAppStore(state => state.setSelectedRole);

  const handleSelectRole = (roleKey: (typeof roleOptions)[number]['key']) => {
    setSelectedRole(roleKey);
    navigation?.navigate?.(roleKey);
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 py-6">
      <View className="gap-4">
        <AppHeaderCard />
        <RoleOptionList
          activeRoleKey={selectedRole}
          roles={roleOptions}
          onSelect={handleSelectRole}
        />
      </View>
    </ScrollView>
  );
}
