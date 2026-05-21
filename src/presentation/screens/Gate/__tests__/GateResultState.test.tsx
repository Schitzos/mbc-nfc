import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GateResultState } from '../fragments/GateResultState';

describe('GateResultState', () => {
  it('returns null when latestResult is null', () => {
    const { toJSON } = render(<GateResultState latestResult={null} />);
    expect(toJSON()).toBeNull();
  });

  it('renders success without onReset', () => {
    render(
      <GateResultState
        latestResult={{
          success: true,
          role: 'GATE',
          message: 'In.',
          card: {
            balance: 50000,
            activeSession: { checkedInAt: '2026-05-01T10:00:00Z' },
          },
        }}
      />,
    );
    expect(screen.getByText('Check-in Successful')).toBeTruthy();
    expect(screen.queryByTestId('gate-scan-another')).toBeNull();
  });

  it('renders error without onReset', () => {
    render(
      <GateResultState
        latestResult={{
          success: false,
          role: 'GATE',
          message: 'Failed.',
          errorCode: 'CARD_TAMPERED',
        }}
      />,
    );
    expect(screen.getByText('Card cannot be processed')).toBeTruthy();
    expect(screen.queryByTestId('gate-scan-another')).toBeNull();
  });

  it('calls onReset when Scan Another Card is pressed in success state', () => {
    const onReset = jest.fn();
    render(
      <GateResultState
        latestResult={{
          success: true,
          role: 'GATE',
          message: 'In.',
          card: { balance: 50000 },
        }}
        onReset={onReset}
      />,
    );
    fireEvent.press(screen.getByTestId('gate-scan-another'));
    expect(onReset).toHaveBeenCalled();
  });
});
