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

  expect(screen.getByText('MBC Card')).toBeTruthy();
  expect(screen.getAllByText('Station').length).toBeGreaterThan(0);
  expect(screen.getByText('Choose role')).toBeTruthy();
});

test('navigates immediately when a role is selected', () => {
  const navigate = jest.fn();
  render(<RoleSwitcherScreen navigation={{ navigate } as never} />);

  fireEvent.press(screen.getByText('Scout'));

  expect(navigate).toHaveBeenCalledWith('scout');
});
