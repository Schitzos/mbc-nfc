import React from 'react';
import { render } from '@testing-library/react-native';
import { MemberCardInfo } from '../fragments/MemberCardInfo';

describe('MemberCardInfo', () => {
  it('shows "Checked in (S)" when activeSession.isSimulation is true', () => {
    const card = {
      balance: 50000,
      visitStatus: 'CHECKED_IN',
      activeSession: {
        checkedInAt: '2026-05-01T08:00:00.000Z',
        isSimulation: true,
      },
    };

    const { getByText } = render(<MemberCardInfo card={card} />);
    expect(getByText('Checked in (S) - Parking')).toBeTruthy();
  });

  it('shows "Checked in" without (S) when isSimulation is not set', () => {
    const card = {
      balance: 50000,
      visitStatus: 'CHECKED_IN',
      activeSession: {
        checkedInAt: '2026-05-01T08:00:00.000Z',
      },
    };

    const { getByText } = render(<MemberCardInfo card={card} />);
    expect(getByText('Checked in - Parking')).toBeTruthy();
  });

  it('shows "Not checked in" when visitStatus is NOT_CHECKED_IN', () => {
    const card = {
      balance: 50000,
      visitStatus: 'NOT_CHECKED_IN',
    };

    const { getByText } = render(<MemberCardInfo card={card} />);
    expect(getByText('Not checked in')).toBeTruthy();
  });
});
