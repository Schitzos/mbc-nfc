import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SignalBottomSheet } from '../SignalBottomSheet';
import { SignalButton } from '../SignalButton';
import { SignalJelajahCard } from '../SignalJelajahCard';
import { SignalOptionCard } from '../SignalOptionCard';
import { SignalSkeleton } from '../SignalSkeleton';
import { SignalStatusBanner } from '../SignalStatusBanner';
import { SignalSurfaceCard } from '../SignalSurfaceCard';
import { SignalTextField } from '../SignalTextField';

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

  it('renders option card and triggers press', () => {
    const onPress = jest.fn();
    render(<SignalOptionCard title="Option A" onPress={onPress} />);
    fireEvent.press(screen.getByText('Option A'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders text field and updates value', () => {
    const onChangeText = jest.fn();
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    render(
      <SignalTextField
        label="Amount"
        value=""
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        required
        helperText="Only numbers"
        rightElement={<Text>Right</Text>}
      />,
    );
    const input = screen.getByPlaceholderText('Placeholder');
    fireEvent(input, 'focus');
    fireEvent.changeText(input, '1000');
    fireEvent(input, 'blur');
    expect(onChangeText).toHaveBeenCalledWith('1000');
    expect(onFocus).toHaveBeenCalled();
    expect(onBlur).toHaveBeenCalled();
    expect(screen.getByText('*')).toBeTruthy();
    expect(screen.getByText('Right')).toBeTruthy();
    expect(screen.getByText('Only numbers')).toBeTruthy();
  });

  it('disables input in load state', () => {
    render(
      <SignalTextField state="load" value="" onChangeText={() => undefined} />,
    );
    const input = screen.getByPlaceholderText('Placeholder');
    expect(input.props.editable).toBe(false);
  });

  it('renders status banner list items', () => {
    render(
      <SignalStatusBanner
        tone="info"
        eyebrow="Status"
        title="Info title"
        body="Info body"
        items={['A', 'B']}
      />,
    );
    expect(screen.getByText('Info title')).toBeTruthy();
    expect(screen.getByText('• A')).toBeTruthy();
    expect(screen.getByText('• B')).toBeTruthy();
  });

  it('renders surface card and skeleton variants', () => {
    render(
      <>
        <SignalSurfaceCard>
          <Text>Card child</Text>
        </SignalSurfaceCard>
        <SignalSkeleton variant="title" />
        <SignalSkeleton variant="button" />
        <SignalSkeleton variant="card" />
      </>,
    );
    expect(screen.getByText('Card child')).toBeTruthy();
  });

  it('renders SignalJelajahCard metadata', () => {
    render(
      <SignalJelajahCard
        title="Jelajah title"
        date="2026-05-02"
        category="Promo"
        imageSource={{ uri: 'https://example.com/image.png' }}
      />,
    );
    expect(screen.getByText('Jelajah title')).toBeTruthy();
    expect(screen.getByText('2026-05-02')).toBeTruthy();
    expect(screen.getByText('Promo')).toBeTruthy();
  });
});
