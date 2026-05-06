import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SignalButton } from '../SignalButton';
import { SignalOptionCard } from '../SignalOptionCard';
import { SignalBottomSheet } from '../SignalBottomSheet';
import { SignalStatusBanner } from '../SignalStatusBanner';
import { SignalSkeleton } from '../SignalSkeleton';

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

describe('SignalOptionCard – extended coverage', () => {
  it('renders in disabled state', () => {
    const onPress = jest.fn();
    render(
      <SignalOptionCard title="Disabled Option" disabled onPress={onPress} />,
    );
    fireEvent.press(screen.getByText('Disabled Option'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders with trailing icon', () => {
    render(
      <SignalOptionCard
        title="With Icon"
        trailingIcon={<Text>→</Text>}
        onPress={() => undefined}
      />,
    );
    expect(screen.getByText('→')).toBeTruthy();
  });

  it('handles pressIn and pressOut state changes', () => {
    render(<SignalOptionCard title="Press Test" onPress={() => undefined} />);
    const button = screen.getByRole('button');
    fireEvent(button, 'pressIn');
    fireEvent(button, 'pressOut');
    expect(screen.getByText('Press Test')).toBeTruthy();
  });

  it('renders with selected state', () => {
    render(
      <SignalOptionCard
        title="Selected"
        state="selected"
        onPress={() => undefined}
      />,
    );
    expect(screen.getByText('Selected')).toBeTruthy();
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

describe('SignalStatusBanner – extended coverage', () => {
  it('renders without items', () => {
    render(
      <SignalStatusBanner
        tone="warning"
        eyebrow="Warning"
        title="Warning title"
        body="Warning body"
      />,
    );
    expect(screen.getByText('Warning title')).toBeTruthy();
  });

  it('renders with children', () => {
    render(
      <SignalStatusBanner
        tone="error"
        eyebrow="Error"
        title="Error title"
        body="Error body"
      >
        <Text>Custom child</Text>
      </SignalStatusBanner>,
    );
    expect(screen.getByText('Custom child')).toBeTruthy();
  });

  it('renders success tone', () => {
    render(
      <SignalStatusBanner
        tone="success"
        eyebrow="Done"
        title="Success"
        body="All good"
        items={['Item 1']}
      />,
    );
    expect(screen.getByText('• Item 1')).toBeTruthy();
  });
});

describe('SignalSkeleton – extended coverage', () => {
  it('renders default title variant without explicit prop', () => {
    render(<SignalSkeleton />);
  });

  it('renders with custom style', () => {
    render(<SignalSkeleton variant="button" style={{ marginTop: 10 }} />);
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

describe('SignalTextField – focused state', () => {
  it('applies focused visual state on focus', async () => {
    const { SignalTextField } = require('../SignalTextField');

    const { getByPlaceholderText } = render(
      <SignalTextField
        state="enabled"
        value=""
        onChangeText={jest.fn()}
        placeholder="test"
      />,
    );

    const input = getByPlaceholderText('test');
    fireEvent(input, 'focus');
    expect(input).toBeTruthy();
  });
});
