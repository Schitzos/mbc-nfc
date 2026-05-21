import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SignalBottomSheet } from '@presentation/components/SignalBottomSheet';
import { SignalButton } from '@presentation/components/SignalButton';

describe('presentation components', () => {
  it('renders and presses SignalButton', () => {
    const onPress = jest.fn();
    render(<SignalButton label="Tap Me" onPress={onPress} />);
    fireEvent.press(screen.getByText('Tap Me'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders bottom sheet content and close action', () => {
    const onClose = jest.fn();
    render(
      <SignalBottomSheet
        visible
        title="Sheet title"
        caption="Sticky caption"
        onClose={onClose}
        stickyAction={<SignalButton label="Do it" onPress={() => undefined} />}
      >
        <Text>Sheet body</Text>
      </SignalBottomSheet>,
    );
    expect(screen.getByText('Sheet title')).toBeTruthy();
    expect(screen.getByText('Sheet body')).toBeTruthy();
    fireEvent.press(screen.getByText('x'));
    expect(onClose).toHaveBeenCalled();
  });
});
