import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LatestLogsCard } from '../fragments/LatestLogsCard';

describe('LatestLogsCard', () => {
  it('shows (S) suffix for simulation logs', () => {
    render(
      <LatestLogsCard
        logs={[
          {
            id: '1',
            activity: 'CHECK_IN',
            nominal: 0,
            occurredAt: '2026-05-21T08:00:00Z',
            isSimulation: true,
          },
          {
            id: '2',
            activity: 'CHECK_OUT',
            nominal: 4000,
            occurredAt: '2026-05-21T10:00:00Z',
            isSimulation: false,
          },
        ]}
      />,
    );

    expect(screen.getByText(/CHECK IN \(S\)/)).toBeTruthy();
    expect(screen.queryByText(/CHECK OUT \(S\)/)).toBeNull();
  });

  it('shows no (S) suffix for non-simulation logs', () => {
    render(
      <LatestLogsCard
        logs={[
          {
            id: '1',
            activity: 'TOP_UP',
            nominal: 50000,
            occurredAt: '2026-05-21T09:00:00Z',
          },
        ]}
      />,
    );

    expect(screen.getByText(/TOP UP/)).toBeTruthy();
    expect(screen.queryByText(/\(S\)/)).toBeNull();
  });
});
