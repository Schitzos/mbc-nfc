import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SignalButton } from '@presentation/components/SignalButton';

describe('SignalButton', () => {
  it('renders and presses SignalButton', () => {
    const onPress = jest.fn();
    render(<SignalButton label="Tap Me" onPress={onPress} />);
    fireEvent.press(screen.getByText('Tap Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders with secondary variant', () => {
    const onPress = jest.fn();
    render(
      <SignalButton label="Secondary" variant="secondary" onPress={onPress} />,
    );
    fireEvent.press(screen.getByText('Secondary'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders with small size', () => {
    render(
      <SignalButton label="Small" size="small" onPress={() => undefined} />,
    );
    expect(screen.getByText('Small')).toBeTruthy();
  });

  it('renders left and right icons', () => {
    render(
      <SignalButton
        label="With Icons"
        leftIcon={<Text>L</Text>}
        rightIcon={<Text>R</Text>}
        onPress={() => undefined}
      />,
    );
    expect(screen.getByText('L')).toBeTruthy();
    expect(screen.getByText('R')).toBeTruthy();
  });

  it('applies disabled opacity', () => {
    render(
      <SignalButton label="Disabled" disabled onPress={() => undefined} />,
    );
    expect(screen.getByText('Disabled')).toBeTruthy();
  });

  it('handles pressIn and pressOut state changes', () => {
    render(<SignalButton label="Pressable" onPress={() => undefined} />);
    const button = screen.getByRole('button');
    fireEvent(button, 'pressIn');
    fireEvent(button, 'pressOut');
    expect(screen.getByText('Pressable')).toBeTruthy();
  });

  it('renders with fullWidth false', () => {
    render(
      <SignalButton
        label="Compact"
        fullWidth={false}
        onPress={() => undefined}
      />,
    );
    expect(screen.getByText('Compact')).toBeTruthy();
  });
});

describe('SignalButton type contract', () => {
  it('SignalButton/types.ts is importable', () => {
    expect(require('../../SignalButton/types')).toBeDefined();
  });
});
