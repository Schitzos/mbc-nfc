/**
 * @format
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { RoleSwitcherScreen } from '../src/presentation/screens/RoleSwitcherScreen';
import { useAppStore } from '../src/presentation/stores/app-store';

beforeEach(() => {
  useAppStore.setState({ selectedRole: null });
});

test('renders the role switcher baseline screen', () => {
  render(<RoleSwitcherScreen />);

  expect(screen.getByText('KDX Membership Benefit Card')).toBeTruthy();
  expect(screen.getByText('Station')).toBeTruthy();
});
