import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

const mockEnableScreens = jest.fn();

jest.mock('react-native-screens', () => ({
  enableScreens: () => mockEnableScreens(),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

describe('AppProviders', () => {
  it('renders children inside providers', () => {
    const { AppProviders } = require('../providers');

    render(
      <AppProviders>
        <Text>Providers child</Text>
      </AppProviders>,
    );

    expect(screen.getByText('Providers child')).toBeTruthy();
  });
});
