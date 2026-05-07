import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SignalTextField } from '@presentation/components/SignalTextField';

describe('SignalTextField – extended branch coverage', () => {
  it('renders label without required indicator when required is false', () => {
    render(
      <SignalTextField
        label="Amount"
        required={false}
        value=""
        onChangeText={() => undefined}
      />,
    );
    expect(screen.getByText('Amount')).toBeTruthy();
    expect(screen.queryByText('*')).toBeNull();
  });
});
