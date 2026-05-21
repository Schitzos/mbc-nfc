import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { CheckoutSummaryCard } from '../fragments/CheckoutSummaryCard';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';

const baseResult: RoleActionResultDto = {
  success: true,
  role: 'TERMINAL',
  message: 'Checked out.',
  chargedHours: 2,
  chargedAmount: 4000,
  durationMs: 7200000,
  card: {
    cardId: 'C1',
    balance: 46000,
    currency: 'IDR',
    visitStatus: 'NOT_CHECKED_IN',
    transactionLogs: [],
  },
};

describe('CheckoutSummaryCard', () => {
  it('renders simulation annotations when isSimulation is true', () => {
    render(
      <CheckoutSummaryCard
        latestResult={{ ...baseResult, checkedInAt: '2026-05-21T08:00:00Z' }}
        checkoutTime="21-May-2026 10:00"
        isSimulation={true}
      />,
    );

    expect(screen.getByText(/not deducted/)).toBeTruthy();
    expect(screen.getByText(/unchanged/)).toBeTruthy();
    expect(screen.getByText(/21-May-2026 15:00/)).toBeTruthy();
  });

  it('renders without simulation annotations when isSimulation is false', () => {
    render(
      <CheckoutSummaryCard
        latestResult={baseResult}
        checkoutTime="21-May-2026 10:00"
        isSimulation={false}
      />,
    );

    expect(screen.queryByText(/not deducted/)).toBeNull();
    expect(screen.queryByText(/unchanged/)).toBeNull();
  });

  it('shows dash when checkedInAt is not provided', () => {
    render(
      <CheckoutSummaryCard
        latestResult={baseResult}
        checkoutTime="21-May-2026 10:00"
      />,
    );

    expect(screen.getByText('-')).toBeTruthy();
  });
});
