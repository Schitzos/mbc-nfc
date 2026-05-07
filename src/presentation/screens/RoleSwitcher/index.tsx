import React from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@app/navigation';
import { roleOptions } from '@presentation/config/role-options';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { useAppStore } from '@presentation/stores/app-store';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { RoleOptionList } from './fragments/RoleOptionList';
import Icon from 'react-native-vector-icons/MaterialIcons';

type Props = Readonly<
  Partial<NativeStackScreenProps<RootStackParamList, 'roleSwitcher'>>
>;

export function RoleSwitcherScreen({ navigation }: Props): React.JSX.Element {
  const selectedRole = useAppStore(state => state.selectedRole);
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const handleSelectRole = (roleKey: (typeof roleOptions)[number]['key']) => {
    setSelectedRole(roleKey);
    navigation?.navigate?.(roleKey);
  };

  return (
    <View className="flex-1 bg-transparent">
      <View className="flex-1">
        <AppHeaderCard title="MBC Card" subTitle="Select Operating Role" rightIcon={<Icon name="info" size={20} color="#fff" />} />
        <View className="-mt-3 rounded-t-xl bg-[#F0F2F5] p-6 gap-3 min-h-1 flex-1 justify-between">
          <RoleOptionList
            activeRoleKey={selectedRole}
            roles={roleOptions}
            onSelect={handleSelectRole}
          />
          <NfcLogPanel />
        </View>
      </View>
    </View>
  );
}
