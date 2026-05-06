/**
 * Validates that the root App.tsx re-exports the src/app/App module.
 * This test exercises the actual import path to cover the re-export file.
 */

jest.mock('../src/app/navigation', () => ({
  AppNavigator: () => null,
}));

jest.mock('../src/app/providers', () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => children,
}));

import React from 'react';
import { render } from '@testing-library/react-native';
import RootApp from '../App';

describe('Root App.tsx re-export', () => {
  it('re-exports the src/app/App component', () => {
    expect(RootApp).toBeDefined();
    expect(typeof RootApp).toBe('function');
  });

  it('renders without crashing', () => {
    render(<RootApp />);
  });
});
