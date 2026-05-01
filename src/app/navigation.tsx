import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoleSwitcherScreen } from '../presentation/screens/RoleSwitcherScreen';
import { StationScreen } from '../presentation/screens/StationScreen';

export type RootStackParamList = {
  roleSwitcher: undefined;
  station: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator
      initialRouteName="roleSwitcher"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#F7F9FC',
        },
      }}
    >
      <Stack.Screen name="roleSwitcher" component={RoleSwitcherScreen} />
      <Stack.Screen name="station" component={StationScreen} />
    </Stack.Navigator>
  );
}
