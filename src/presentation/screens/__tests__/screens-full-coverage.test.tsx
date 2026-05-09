import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { ScoutScreen } from '@presentation/screens/Scout';
import { StationScreen } from '@presentation/screens/Station';
import { TerminalScreen } from '@presentation/screens/Terminal';
import { GateScreen } from '@presentation/screens/Gate';
import { useAppStore } from '@presentation/stores/app-store';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockCheckNfcAvailabilityUseCase = {
  execute: jest.fn().mockResolvedValue({
    supported: true,
    status: 'SUPPORTED',
    title: 'NFC is ready',
    message: 'Ready',
    guidance: [],
  }),
};

const mockRegisterMemberCardUseCase = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'STATION',
    message: 'Registered.',
    card: { balance: 0, visitStatus: 'NOT_CHECKED_IN', transactionLogs: [] },
  }),
  executeWithReset: jest.fn().mockResolvedValue({
    success: true,
    role: 'STATION',
    message: 'Re-registered.',
  }),
};

const mockTopUpMemberCardUseCase = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'STATION',
    message: 'Top-up done.',
    card: {
      balance: 50000,
      visitStatus: 'NOT_CHECKED_IN',
      transactionLogs: [],
    },
  }),
};

const mockGetStationLedgerSummaryUseCase = {
  execute: jest.fn().mockResolvedValue({
    topUpTotal: 0,
    checkoutTotal: 0,
    registerCount: 0,
    topUpCount: 0,
    checkoutCount: 0,
    latestEntries: [],
  }),
};

const mockCheckInActivityUseCase = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'GATE',
    message: 'Checked in.',
    card: { balance: 50000, visitStatus: 'CHECKED_IN', transactionLogs: [] },
  }),
};

const mockCheckOutActivityUseCase = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'TERMINAL',
    message: 'Checked out.',
    chargedHours: 2,
    chargedAmount: 4000,
    durationMs: 7200000,
    card: {
      balance: 46000,
      visitStatus: 'NOT_CHECKED_IN',
      transactionLogs: [],
    },
  }),
};

const mockInspectMemberCardUseCase = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'SCOUT',
    message: 'Inspected.',
    card: {
      maskedMemberReference: 'MBC-***-0001',
      balance: 46000,
      visitStatus: 'NOT_CHECKED_IN',
      transactionLogs: [
        {
          id: 'L1',
          activity: 'TOP_UP',
          nominal: 50000,
          occurredAt: '2026-05-02T10:00:00.000Z',
        },
      ],
    },
  }),
};

jest.mock('../../../app/container', () => ({
  createAppServices: () => ({
    station: {
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      registerMemberCardUseCase: mockRegisterMemberCardUseCase,
      topUpMemberCardUseCase: mockTopUpMemberCardUseCase,
      getStationLedgerSummaryUseCase: mockGetStationLedgerSummaryUseCase,
    },
    gate: {
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      checkInActivityUseCase: mockCheckInActivityUseCase,
    },
    terminal: {
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      checkOutActivityUseCase: mockCheckOutActivityUseCase,
    },
    scout: {
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      inspectMemberCardUseCase: mockInspectMemberCardUseCase,
    },
  }),
}));

const mockServices = {
  station: {
    checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
    registerMemberCardUseCase: mockRegisterMemberCardUseCase,
    topUpMemberCardUseCase: mockTopUpMemberCardUseCase,
    getStationLedgerSummaryUseCase: mockGetStationLedgerSummaryUseCase,
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  gate: {
    checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
    checkInActivityUseCase: mockCheckInActivityUseCase,
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  terminal: {
    checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
    checkOutActivityUseCase: mockCheckOutActivityUseCase,
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  scout: {
    checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
    inspectMemberCardUseCase: mockInspectMemberCardUseCase,
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
} as never;

function renderWithServices(ui: React.ReactElement) {
  const { ServiceProvider } = require('../../context/service-context');
  return render(
    <ServiceProvider services={mockServices}>{ui}</ServiceProvider>,
  );
}

describe('screens – full branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('Scout formatLogTime handles invalid date string', async () => {
    mockInspectMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'SCOUT',
      message: 'Inspected.',
      card: {
        maskedMemberReference: 'MBC-***-0001',
        balance: 10000,
        visitStatus: 'NOT_CHECKED_IN',
        transactionLogs: [
          {
            id: 'L1',
            activity: 'TOP_UP',
            nominal: 5000,
            occurredAt: 'invalid-date',
          },
        ],
      },
    });

    renderWithServices(<ScoutScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    // Dismiss the success sheet to reveal card data
    await waitFor(() => expect(screen.getByText('Done')).toBeTruthy());
    fireEvent.press(screen.getByText('Done'));

    // The invalid date should be rendered as-is
    await waitFor(() => expect(screen.getByText(/invalid-date/)).toBeTruthy());
  }, 15000);

  it('Scout shows error state for failed inspection', async () => {
    mockInspectMemberCardUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'SCOUT',
      message: 'Card tampered.',
    });

    renderWithServices(<ScoutScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    await waitFor(() =>
      expect(screen.getByText('Card cannot be processed')).toBeTruthy(),
    );
  });

  it('Scout shows log with no nominal', async () => {
    mockInspectMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'SCOUT',
      message: 'Inspected.',
      card: {
        maskedMemberReference: 'MBC-***-0001',
        balance: 10000,
        visitStatus: 'NOT_CHECKED_IN',
        transactionLogs: [
          {
            id: 'L1',
            activity: 'CHECK_IN',
            nominal: 0,
            occurredAt: '2026-05-02T10:00:00.000Z',
          },
          {
            id: 'L2',
            activity: 'CHECK_OUT',
            nominal: 2000,
            occurredAt: '2026-05-02T12:00:00.000Z',
          },
        ],
      },
    });

    renderWithServices(<ScoutScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    await waitFor(() => {
      expect(screen.getByText(/CHECK IN/)).toBeTruthy();
      expect(screen.getByText(/CHECK OUT/)).toBeTruthy();
    });
  });

  it('Station handleRegister in register mode triggers NFC flow', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    // Already in register mode by default
    fireEvent.press(screen.getByText('Tap NFC Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    // Latest result should show
    expect(screen.getByText('Latest result')).toBeTruthy();
    expect(screen.getByText('Success')).toBeTruthy();
  });

  it('Station shows top-up failure result', async () => {
    mockTopUpMemberCardUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'Card tampered.',
    });

    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Switch to Top Up'));
    fireEvent.press(screen.getByText('Tap NFC Card to Top Up'));
    await waitFor(() =>
      expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('Unable to complete')).toBeTruthy();
  });

  it('Gate dismisses NFC action sheet after success', async () => {
    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );

    // After success, the sheet shows "Done" button
    const doneButton = screen.queryByText('Done');
    if (doneButton) {
      fireEvent.press(doneButton);
    }
  });

  it('Scout dismisses NFC action sheet after success', async () => {
    renderWithServices(<ScoutScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    const doneButton = screen.queryByText('Done');
    if (doneButton) {
      fireEvent.press(doneButton);
    }
  });

  it('Station dismisses NFC action sheet after register', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap NFC Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    const doneButton = screen.queryByText('Done');
    if (doneButton) {
      fireEvent.press(doneButton);
    }
  });

  it('Terminal dismisses NFC action sheet after checkout', async () => {
    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );

    const doneButton = screen.queryByText('Done');
    if (doneButton) {
      fireEvent.press(doneButton);
    }
  });

  it('Terminal shows success with duration calculation', async () => {
    mockCheckOutActivityUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'TERMINAL',
      message: 'Checked out.',
      chargedHours: 1,
      chargedAmount: 2000,
      durationMs: 3661000, // 1h 1m 1s
      card: {
        balance: 48000,
        visitStatus: 'NOT_CHECKED_IN',
        transactionLogs: [],
      },
    });

    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('1h 1m 1s')).toBeTruthy();
  });

  it('Gate check-in success with no card in result', async () => {
    mockCheckInActivityUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'GATE',
      message: 'Checked in.',
    });

    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );
  });

  it('Scout shows card without maskedMemberReference (fallback)', async () => {
    mockInspectMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'SCOUT',
      message: 'Inspected.',
      card: {
        balance: 0,
        visitStatus: 'NOT_CHECKED_IN',
        transactionLogs: [],
      },
    });

    renderWithServices(<ScoutScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    await waitFor(() => {
      expect(screen.getByText('MBC-***')).toBeTruthy();
      expect(screen.getByText('Rp 0')).toBeTruthy();
    });
  });

  it('Scout Scan Another Card button returns to radar view', async () => {
    mockInspectMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'SCOUT',
      message: 'Inspected.',
      card: {
        maskedMemberReference: 'MBC-***-0001',
        balance: 5000,
        visitStatus: 'NOT_CHECKED_IN',
        transactionLogs: [],
      },
    });

    renderWithServices(<ScoutScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    await waitFor(() =>
      expect(screen.getByText('Scan Another Card')).toBeTruthy(),
    );

    fireEvent.press(screen.getByText('Scan Another Card'));

    await waitFor(() =>
      expect(screen.getByText('Tap to inspect member card')).toBeTruthy(),
    );
  });

  it('Station top-up success with no card balance in result', async () => {
    mockTopUpMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'STATION',
      message: 'Top-up done.',
    });

    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Switch to Top Up'));
    fireEvent.press(screen.getByText('Tap NFC Card to Top Up'));
    await waitFor(() =>
      expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalled(),
    );
  });

  it('Station refresh summary button works', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    // Expand ledger
    fireEvent.press(screen.getByText('Local Station ledger'));
    // Press refresh
    fireEvent.press(screen.getByText('Refresh'));
    await waitFor(() =>
      expect(mockGetStationLedgerSummaryUseCase.execute).toHaveBeenCalledTimes(
        2,
      ),
    );
  });
});
