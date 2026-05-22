import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GateScreen } from '@presentation/screens/Gate';
import { RoleSwitcherScreen } from '@presentation/screens/RoleSwitcher';
import { ScoutScreen } from '@presentation/screens/Scout';
import { SplashScreen } from '@presentation/screens/Splash';
import { StationScreen } from '@presentation/screens/Station';
import { TerminalScreen } from '@presentation/screens/Terminal';

export type RootStackParamList = {
  splash: undefined;
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
      initialRouteName="splash"
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: '#F7F9FC',
        },
      }}
    >
      <Stack.Screen name="splash" component={SplashScreen} />
      <Stack.Screen name="gate" component={GateScreen} />
      <Stack.Screen name="roleSwitcher" component={RoleSwitcherScreen} />
      <Stack.Screen name="scout" component={ScoutScreen} />
      <Stack.Screen name="station" component={StationScreen} />
      <Stack.Screen name="terminal" component={TerminalScreen} />
    </Stack.Navigator>
  );
}
