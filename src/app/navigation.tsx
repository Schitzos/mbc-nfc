import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RoleSwitcherScreen } from '../presentation/screens/RoleSwitcherScreen';

export type RootStackParamList = {
  roleSwitcher: undefined;
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
    </Stack.Navigator>
  );
}
