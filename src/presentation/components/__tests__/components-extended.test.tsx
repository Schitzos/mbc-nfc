import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SignalButton } from '@presentation/components/SignalButton';
import { SignalBottomSheet } from '@presentation/components/SignalBottomSheet';

describe('SignalButton – extended coverage', () => {
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

describe('SignalBottomSheet – extended coverage', () => {
  it('renders without title (shows spacer)', () => {
    render(
      <SignalBottomSheet visible onClose={() => undefined}>
        <Text>Content</Text>
      </SignalBottomSheet>,
    );
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('renders without onClose (no close button)', () => {
    render(
      <SignalBottomSheet visible title="No Close">
        <Text>Body</Text>
      </SignalBottomSheet>,
    );
    expect(screen.getByText('No Close')).toBeTruthy();
    expect(screen.queryByText('x')).toBeNull();
  });

  it('renders without stickyAction', () => {
    render(
      <SignalBottomSheet visible title="Simple" onClose={() => undefined}>
        <Text>Just body</Text>
      </SignalBottomSheet>,
    );
    expect(screen.getByText('Just body')).toBeTruthy();
  });

  it('renders stickyAction without caption', () => {
    render(
      <SignalBottomSheet
        visible
        title="With Action"
        onClose={() => undefined}
        stickyAction={<Text>Action</Text>}
      >
        <Text>Body</Text>
      </SignalBottomSheet>,
    );
    expect(screen.getByText('Action')).toBeTruthy();
  });
});

describe('NfcActionSheet – confirm phase', () => {
  it('renders confirm title and buttons', () => {
    const { NfcActionSheet } = require('../../components/NfcActionSheet');

    render(
      <NfcActionSheet
        state={{
          phase: 'confirm',
          title: 'Confirm Action',
          message: 'Are you sure?',
          confirmLabel: 'Yes',
          onConfirm: jest.fn(),
        }}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByText('⚠ Confirm')).toBeTruthy();
    expect(screen.getByText('Are you sure?')).toBeTruthy();
    expect(screen.getByText('Yes')).toBeTruthy();
  });
});

describe('NfcActionSheet – scanning without message', () => {
  it('renders default scanning message when state.message is undefined', () => {
    const { NfcActionSheet } = require('../../components/NfcActionSheet');

    render(
      <NfcActionSheet state={{ phase: 'scanning' }} onDismiss={jest.fn()} />,
    );

    expect(
      screen.getByText('Tap your member card near the phone'),
    ).toBeTruthy();
  });
});

describe('SignalBottomSheet – visible false', () => {
  it('returns null when visible is false', () => {
    const { toJSON } = render(
      <SignalBottomSheet visible={false} title="Test" onClose={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });
});
