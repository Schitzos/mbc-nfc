import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../../app/navigation';
import { roleOptions } from '../../config/role-options';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { useAppStore } from '../../stores/app-store';
import { AppHeaderCard } from './fragments/AppHeaderCard';
import { RoleOptionList } from './fragments/RoleOptionList';

type Props = Readonly<
  Partial<NativeStackScreenProps<RootStackParamList, 'roleSwitcher'>>
>;

export function RoleSwitcherScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const selectedRole = useAppStore(state => state.selectedRole);
  const setSelectedRole = useAppStore(state => state.setSelectedRole);

  const contentContainerStyle = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        },
      }),
    [insets.top, insets.bottom],
  );

  const handleSelectRole = (roleKey: (typeof roleOptions)[number]['key']) => {
    setSelectedRole(roleKey);
    navigation?.navigate?.(roleKey);
  };

  return (
    <View className="flex-1 bg-background">
      <BackgroundDecor variant="roleSwitcher" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={contentContainerStyle.container}
      >
        <View className="gap-4">
          <AppHeaderCard />
          <RoleOptionList
            activeRoleKey={selectedRole}
            roles={roleOptions}
            onSelect={handleSelectRole}
          />
        </View>
      </ScrollView>
    </View>
  );
}
