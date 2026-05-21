import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';

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

describe('NfcActionSheet type contract', () => {
  it('NfcActionSheet/types.ts is importable', () => {
    expect(require('../../NfcActionSheet/types')).toBeDefined();
  });
});
