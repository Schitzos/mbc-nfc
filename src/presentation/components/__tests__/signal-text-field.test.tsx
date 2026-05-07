import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SignalTextField } from '../SignalTextField';

describe('SignalTextField', () => {
  it('renders with label and required indicator', () => {
    render(
      <SignalTextField
        label="Name"
        required
        value=""
        onChangeText={() => undefined}
      />,
    );
    expect(screen.getByText('Name')).toBeTruthy();
    expect(screen.getByText('*')).toBeTruthy();
  });

  it('renders without label when not provided', () => {
    render(<SignalTextField value="" onChangeText={() => undefined} />);
    expect(screen.queryByText('*')).toBeNull();
  });

  it('renders helper text', () => {
    render(
      <SignalTextField
        value=""
        helperText="Enter amount"
        onChangeText={() => undefined}
      />,
    );
    expect(screen.getByText('Enter amount')).toBeTruthy();
  });

  it('renders right element', () => {
    render(
      <SignalTextField
        value=""
        onChangeText={() => undefined}
        rightElement={<Text>IDR</Text>}
      />,
    );
    expect(screen.getByText('IDR')).toBeTruthy();
  });

  it('applies disabled state when editable is false', () => {
    render(
      <SignalTextField
        value="test"
        editable={false}
        onChangeText={() => undefined}
      />,
    );
    const input = screen.getByPlaceholderText('Placeholder');
    expect(input.props.editable).toBe(false);
  });

  it('applies disabled state in load state', () => {
    render(
      <SignalTextField value="" state="load" onChangeText={() => undefined} />,
    );
    const input = screen.getByPlaceholderText('Placeholder');
    expect(input.props.editable).toBe(false);
  });

  it('applies error state styling', () => {
    render(
      <SignalTextField
        value=""
        state="error"
        helperText="Required"
        onChangeText={() => undefined}
      />,
    );
    expect(screen.getByText('Required')).toBeTruthy();
  });

  it('handles focus and blur events', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(
      <SignalTextField
        value=""
        onChangeText={() => undefined}
        onFocus={onFocus}
        onBlur={onBlur}
      />,
    );
    const input = screen.getByPlaceholderText('Placeholder');
    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalled();
    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalled();
  });

  it('uses custom placeholder', () => {
    render(
      <SignalTextField
        value=""
        placeholder="Type here"
        onChangeText={() => undefined}
      />,
    );
    expect(screen.getByPlaceholderText('Type here')).toBeTruthy();
  });
});
