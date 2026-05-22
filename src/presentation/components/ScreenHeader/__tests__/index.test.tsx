import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ScreenHeader } from '../index';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('ScreenHeader', () => {
  it('hides back button when showBack is false', () => {
    render(
      <ScreenHeader
        title="Test"
        subtitle="Sub"
        badgeLabel="Badge"
        badgeIcon="star"
        badgeColor="#000"
        showBack={false}
      />,
    );
    expect(screen.queryByLabelText('Go back')).toBeNull();
    expect(screen.getByText('Test')).toBeTruthy();
  });
});
