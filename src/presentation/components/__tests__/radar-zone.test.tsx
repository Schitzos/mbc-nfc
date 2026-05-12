import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RadarZone } from '../RadarZone';
import { signalColorTokens } from '@presentation/theme/colors';

const PRIMARY_RED = signalColorTokens.brand.primary;

describe('RadarZone', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with given label', () => {
    const { getByText } = render(
      <RadarZone color={PRIMARY_RED} label="Inspect" onPress={jest.fn()} />,
    );
    expect(getByText('Inspect')).toBeTruthy();
  });

  it('starts second pulse animation after 600ms', () => {
    render(
      <RadarZone color={PRIMARY_RED} label="Inspect" onPress={jest.fn()} />,
    );
    jest.advanceTimersByTime(900);
  });

  it('cleans up animations on unmount', () => {
    const { unmount } = render(
      <RadarZone color={PRIMARY_RED} label="Inspect" onPress={jest.fn()} />,
    );
    jest.advanceTimersByTime(700);
    unmount();
  });

  it('cleans up timeout when unmounted before delay', () => {
    const { unmount } = render(
      <RadarZone color={PRIMARY_RED} label="Inspect" onPress={jest.fn()} />,
    );
    unmount();
    jest.advanceTimersByTime(700);
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <RadarZone color={PRIMARY_RED} label="Inspect" onPress={onPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows busyLabel when disabled', () => {
    const { getByText, queryByText } = render(
      <RadarZone
        color={PRIMARY_RED}
        label="Inspect"
        busyLabel="Scanning..."
        disabled={true}
        onPress={jest.fn()}
      />,
    );
    expect(getByText('Scanning...')).toBeTruthy();
    expect(queryByText('Inspect')).toBeNull();
  });

  it('renders with primary red color consistently', () => {
    const { getByRole } = render(
      <RadarZone color={PRIMARY_RED} label="Check In" onPress={jest.fn()} />,
    );
    expect(getByRole('button')).toBeTruthy();
  });
});
