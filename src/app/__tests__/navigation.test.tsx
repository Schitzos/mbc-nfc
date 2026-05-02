import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AppNavigator } from '../navigation';

jest.mock('../../presentation/screens/Gate', () => ({
  GateScreen: () => null,
}));
jest.mock('../../presentation/screens/RoleSwitcher', () => ({
  RoleSwitcherScreen: () => null,
}));
jest.mock('../../presentation/screens/Scout', () => ({
  ScoutScreen: () => null,
}));
jest.mock('../../presentation/screens/Station', () => ({
  StationScreen: () => null,
}));
jest.mock('../../presentation/screens/Terminal', () => ({
  TerminalScreen: () => null,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: ({ name }: { name: string }) => {
      const { Text } = require('react-native');
      return <Text>{name}</Text>;
    },
  }),
}));

describe('AppNavigator', () => {
  it('registers all role screens', () => {
    render(<AppNavigator />);

    expect(screen.getByText('roleSwitcher')).toBeTruthy();
    expect(screen.getByText('station')).toBeTruthy();
    expect(screen.getByText('gate')).toBeTruthy();
    expect(screen.getByText('terminal')).toBeTruthy();
    expect(screen.getByText('scout')).toBeTruthy();
  });
});
