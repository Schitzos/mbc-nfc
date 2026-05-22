import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';

describe('NfcActionSheet – idle phase', () => {
  it('returns null when phase is idle', () => {
    const { toJSON } = render(
      <NfcActionSheet state={{ phase: 'idle' }} onDismiss={jest.fn()} />,
    );

    expect(toJSON()).toBeNull();
  });
});

describe('NfcActionSheet – confirm phase', () => {
  it('renders confirm title and buttons', () => {
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
    render(
      <NfcActionSheet state={{ phase: 'scanning' }} onDismiss={jest.fn()} />,
    );

    expect(
      screen.getByText('Tap your member card near the phone'),
    ).toBeTruthy();
  });
});

describe('NfcActionSheet – success phase', () => {
  it('renders default title when state.title is undefined', () => {
    render(
      <NfcActionSheet
        state={{ phase: 'success', message: 'All good' }}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByText('✓ Done')).toBeTruthy();
  });

  it('renders onConfirm button when provided', () => {
    const onConfirm = jest.fn();
    render(
      <NfcActionSheet
        state={{
          phase: 'success',
          title: 'Success',
          message: 'Done',
          onConfirm,
          confirmLabel: 'Next Step',
        }}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByText('Next Step')).toBeTruthy();
  });

  it('renders default confirmLabel when not provided', () => {
    render(
      <NfcActionSheet
        state={{
          phase: 'success',
          title: 'Success',
          message: 'Done',
          onConfirm: jest.fn(),
        }}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByText('Continue')).toBeTruthy();
  });
});

describe('NfcActionSheet – error phase', () => {
  it('renders error state with default title', () => {
    render(
      <NfcActionSheet
        state={{ phase: 'error', title: 'Oops', message: 'Something broke' }}
        onDismiss={jest.fn()}
      />,
    );

    expect(screen.getByText('✕ Failed')).toBeTruthy();
    expect(screen.getByText('Something broke')).toBeTruthy();
  });
});

describe('NfcActionSheet type contract', () => {
  it('NfcActionSheet/types.ts is importable', () => {
    expect(require('../../NfcActionSheet/types')).toBeDefined();
  });
});
