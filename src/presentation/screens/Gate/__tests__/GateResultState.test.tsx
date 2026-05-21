import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { GateResultState } from '../fragments/GateResultState';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';

const successResult: RoleActionResultDto = {
  success: true,
  role: 'GATE',
  message: 'In.',
  card: {
    cardId: 'c1',
    balance: 50000,
    currency: 'IDR',
    visitStatus: 'CHECKED_IN',
    transactionLogs: [],
    activeSession: {
      activityId: 'p1',
      activityType: 'PARKING',
      checkedInAt: '2026-05-01T10:00:00Z',
    },
  },
};

const errorResult: RoleActionResultDto = {
  success: false,
  role: 'GATE',
  message: 'Failed.',
  errorCode: 'CARD_TAMPERED',
};

describe('GateResultState', () => {
  it('returns null when latestResult is null', () => {
    const { toJSON } = render(<GateResultState latestResult={null} />);
    expect(toJSON()).toBeNull();
  });

  it('renders success without onReset', () => {
    render(<GateResultState latestResult={successResult} />);
    expect(screen.getByText('Check-in Successful')).toBeTruthy();
    expect(screen.queryByTestId('gate-scan-another')).toBeNull();
  });

  it('renders error without onReset', () => {
    render(<GateResultState latestResult={errorResult} />);
    expect(screen.getByText('Card cannot be processed')).toBeTruthy();
    expect(screen.queryByTestId('gate-scan-another')).toBeNull();
  });

  it('calls onReset when Scan Another Card is pressed in success state', () => {
    const onReset = jest.fn();
    render(<GateResultState latestResult={successResult} onReset={onReset} />);
    fireEvent.press(screen.getByTestId('gate-scan-another'));
    expect(onReset).toHaveBeenCalled();
  });
});
