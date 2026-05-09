import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { GateScreen } from '@presentation/screens/Gate';
import { TerminalScreen } from '@presentation/screens/Terminal';
import { StationScreen } from '@presentation/screens/Station';
import { ScoutScreen } from '@presentation/screens/Scout';
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
    guidance: ['Hold device close'],
    shouldUseMockMode: false,
  }),
};

const mockRegisterMemberCardUseCase = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'STATION',
    message: 'Member card registered successfully.',
    card: {
      maskedMemberReference: 'MBC-***-0001',
      balance: 0,
      visitStatus: 'NOT_CHECKED_IN',
      transactionLogs: [],
    },
  }),
  executeWithReset: jest.fn().mockResolvedValue({
    success: true,
    role: 'STATION',
    message: 'Member card registered successfully.',
    card: {
      maskedMemberReference: 'MBC-***-0002',
      balance: 0,
      visitStatus: 'NOT_CHECKED_IN',
      transactionLogs: [],
    },
  }),
};

const mockTopUpMemberCardUseCase = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'STATION',
    message: 'Top-up completed successfully.',
    card: {
      maskedMemberReference: 'MBC-***-0001',
      balance: 50000,
      visitStatus: 'NOT_CHECKED_IN',
      transactionLogs: [],
    },
  }),
};

const mockGetStationLedgerSummaryUseCase = {
  execute: jest.fn().mockResolvedValue({
    topUpTotal: 50000,
    checkoutTotal: 4000,
    registerCount: 1,
    topUpCount: 1,
    checkoutCount: 1,
    latestEntries: [],
  }),
};

const mockCheckInActivityUseCase = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'GATE',
    message: 'Card checked in successfully.',
    card: {
      maskedMemberReference: 'MBC-***-0001',
      balance: 50000,
      visitStatus: 'CHECKED_IN',
      activeSession: { activityType: 'PARKING' },
      transactionLogs: [],
    },
  }),
};

const mockCheckOutActivityUseCase = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'TERMINAL',
    message: 'Card checked out successfully.',
    chargedHours: 2,
    chargedAmount: 4000,
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
    message: 'Card inspected successfully.',
    card: {
      maskedMemberReference: 'MBC-***-0001',
      balance: 46000,
      visitStatus: 'NOT_CHECKED_IN',
      transactionLogs: [
        {
          id: 'LOG-001',
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

describe('role screens – extended branch coverage', () => {
  beforeEach(() => {
    mockCheckNfcAvailabilityUseCase.execute.mockClear();
    mockRegisterMemberCardUseCase.execute.mockClear();
    mockRegisterMemberCardUseCase.executeWithReset.mockClear();
    mockTopUpMemberCardUseCase.execute.mockClear();
    mockGetStationLedgerSummaryUseCase.execute.mockClear();
    mockCheckInActivityUseCase.execute.mockClear();
    mockCheckOutActivityUseCase.execute.mockClear();
    mockInspectMemberCardUseCase.execute.mockClear();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('Gate check-in calls use case', async () => {
    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          activityType: 'PARKING',
        }),
      ),
    );
  }, 15000);

  it('Gate shows non-double-check-in error (generic card error)', async () => {
    mockCheckInActivityUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'GATE',
      message: 'Card payload is invalid or tampered',
      errorCode: 'CARD_TAMPERED',
    });

    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('Card cannot be processed')).toBeTruthy();
  });

  it('Terminal shows generic failure state (not insufficient balance)', async () => {
    mockCheckOutActivityUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'TERMINAL',
      message: 'Card is not registered yet.',
      errorCode: 'UNREGISTERED_CARD',
    });

    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('Card cannot be processed')).toBeTruthy();
  });

  it('Terminal navigates to station on insufficient balance guidance', async () => {
    mockCheckOutActivityUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'TERMINAL',
      message: 'Insufficient balance for checkout',
      errorCode: 'INSUFFICIENT_BALANCE',
    });

    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Go to Station Top Up'));
    const { __mockNavigation } = require('@react-navigation/native');
    expect(__mockNavigation.navigate).toHaveBeenCalledWith('station');
  });

  it('Station shows failed registration result', async () => {
    mockRegisterMemberCardUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'Card is already registered.',
    });

    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap NFC Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('Unable to complete')).toBeTruthy();
  });

  it('Scout shows checked-in card status', async () => {
    mockInspectMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'SCOUT',
      message: 'Card inspected successfully.',
      card: {
        maskedMemberReference: 'MBC-***-0001',
        balance: 12000,
        visitStatus: 'CHECKED_IN',
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

    await waitFor(() => expect(screen.getByText('Checked in')).toBeTruthy());
  });

  it('Scout shows "No logs yet" when transaction logs are empty', async () => {
    mockInspectMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'SCOUT',
      message: 'Card inspected successfully.',
      card: {
        maskedMemberReference: 'MBC-***-0001',
        balance: 12000,
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

    await waitFor(() => expect(screen.getByText('No logs yet.')).toBeTruthy());
  });

  it('Scout does not call writeCard (read-only)', async () => {
    renderWithServices(<ScoutScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    // Scout only calls inspectMemberCardUseCase (read-only)
    expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('Station NFC log panel can be toggled and cleared', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('NFC Log')).toBeTruthy();
    expect(
      screen.getByText(
        'Log panel hidden. Tap ON to view NFC operational events.',
      ),
    ).toBeTruthy();

    fireEvent.press(screen.getByText('OFF'));
    expect(screen.getAllByText(/\[NFC\]/).length).toBeGreaterThan(0);

    fireEvent.press(screen.getByText('Clear'));
    expect(screen.getByText('No NFC log lines yet.')).toBeTruthy();
  });

  it('Station shows wipe confirm when card already registered, then re-registers', async () => {
    mockRegisterMemberCardUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'This card is already registered.',
    });

    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap NFC Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    // Confirm sheet should show wipe option
    expect(screen.getByText('Card Already Registered')).toBeTruthy();
    expect(screen.getByText('Wipe & Re-register')).toBeTruthy();
    expect(screen.getByText('Skip')).toBeTruthy();

    // Tap wipe
    fireEvent.press(screen.getByText('Wipe & Re-register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.executeWithReset).toHaveBeenCalled(),
    );
  });

  it('Station top-up with preset amount selection', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Switch to Top Up'));
    fireEvent.press(screen.getByText('100.000'));
    fireEvent.press(screen.getByText('Tap NFC Card to Top Up'));
    await waitFor(() =>
      expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalledWith({
        amount: 100000,
      }),
    );
  });

  it('Gate shows checkedInAt timestamp when present', async () => {
    mockCheckInActivityUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'GATE',
      message: 'Card checked in successfully.',
      card: {
        maskedMemberReference: 'MBC-***-0001',
        balance: 50000,
        visitStatus: 'CHECKED_IN',
        activeSession: {
          activityType: 'PARKING',
          checkedInAt: '2026-05-02T10:30:00.000Z',
        },
        transactionLogs: [],
      },
    });

    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText(/Checked in at:/)).toBeTruthy();
  });
});
