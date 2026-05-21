import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LatestLogsCard } from '../fragments/LatestLogsCard';

describe('LatestLogsCard', () => {
  it('renders (S) suffix for simulation logs', () => {
    render(
      <LatestLogsCard
        logs={[
          {
            id: 'L1',
            activity: 'CHECK_IN',
            nominal: 0,
            occurredAt: '2026-05-01T10:00:00Z',
            isSimulation: true,
          },
        ]}
      />,
    );
    expect(screen.getByText(/\(S\)/)).toBeTruthy();
  });
});
