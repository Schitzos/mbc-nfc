/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RoleSwitcherScreen } from '../src/presentation/screens/RoleSwitcherScreen';
import { useAppStore } from '../src/presentation/stores/app-store';

beforeEach(() => {
  useAppStore.setState({ selectedRole: null });
});

test('renders the role switcher baseline screen', () => {
  render(<RoleSwitcherScreen />);

  expect(screen.getByText('KDX Membership Benefit Card')).toBeTruthy();
  expect(screen.getAllByText('Station').length).toBeGreaterThan(0);
  expect(screen.getByText('Open Station')).toBeTruthy();
});

test('updates the active role before opening a workspace', () => {
  render(<RoleSwitcherScreen />);

  fireEvent.press(screen.getByText('Scout'));

  expect(screen.getByText('Active role')).toBeTruthy();
  expect(screen.getByText('Open Scout')).toBeTruthy();
});
