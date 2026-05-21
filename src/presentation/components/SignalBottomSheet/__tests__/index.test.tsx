import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SignalBottomSheet } from '@presentation/components/SignalBottomSheet';
import { SignalButton } from '@presentation/components/SignalButton';

describe('SignalBottomSheet', () => {
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

  it('returns null when visible is false', () => {
    const { toJSON } = render(
      <SignalBottomSheet visible={false} title="Test" onClose={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });
});

describe('SignalBottomSheet type contract', () => {
  it('SignalBottomSheet/types.ts is importable', () => {
    expect(require('../../SignalBottomSheet/types')).toBeDefined();
  });
});
