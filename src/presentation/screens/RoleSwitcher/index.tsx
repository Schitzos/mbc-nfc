import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@app/navigation';
import { roleOptions } from '@presentation/config/role-options';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { useAppStore } from '@presentation/stores/app-store';
import { RoleOptionList } from './fragments/RoleOptionList';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signalColorTokens } from '@presentation/theme/colors';

type Props = Readonly<
  Partial<NativeStackScreenProps<RootStackParamList, 'roleSwitcher'>>
>;

const bgImage = require('@presentation/assets/bg-role-switcher.png');

export function RoleSwitcherScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const selectedRole = useAppStore(state => state.selectedRole);
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const handleSelectRole = (roleKey: (typeof roleOptions)[number]['key']) => {
    setSelectedRole(roleKey);
    navigation?.navigate?.(roleKey);
  };

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1"
      resizeMode="cover"
      blurRadius={15}
    >
      <View style={{ paddingTop: insets.top + 24 }} className="px-6 pb-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-[28px] font-bold text-foreground">
            MBC Card
          </Text>
          <View
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
            style={s.infoButton}
          >
            <Icon
              name="info"
              size={20}
              color={signalColorTokens.brand.primary}
            />
          </View>
        </View>
        <Text className="text-sm text-muted mt-1">Select Operating Role</Text>
      </View>

      <View className="flex-1 px-4">
        <RoleOptionList
          activeRoleKey={selectedRole}
          roles={roleOptions}
          onSelect={handleSelectRole}
        />
        <View className="mt-auto pb-4">
          <NfcLogPanel variant="light" />
        </View>
      </View>
    </ImageBackground>
  );
}

const s = StyleSheet.create({
  infoButton: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
