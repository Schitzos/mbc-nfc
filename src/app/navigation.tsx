import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GateScreen } from '../presentation/screens/GateScreen';
import { RoleSwitcherScreen } from '../presentation/screens/RoleSwitcherScreen';
import { ScoutScreen } from '../presentation/screens/ScoutScreen';
import { StationScreen } from '../presentation/screens/StationScreen';
import { TerminalScreen } from '../presentation/screens/TerminalScreen';

export type RootStackParamList = {
  roleSwitcher: undefined;
  gate: undefined;
  scout: undefined;
  station: undefined;
  terminal: undefined;
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
      <Stack.Screen name="gate" component={GateScreen} />
      <Stack.Screen name="roleSwitcher" component={RoleSwitcherScreen} />
      <Stack.Screen name="scout" component={ScoutScreen} />
      <Stack.Screen name="station" component={StationScreen} />
      <Stack.Screen name="terminal" component={TerminalScreen} />
    </Stack.Navigator>
  );
}
