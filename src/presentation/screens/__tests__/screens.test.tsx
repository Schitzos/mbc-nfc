import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { GateScreen } from '../GateScreen';
import { ScoutScreen } from '../ScoutScreen';
import { StationScreen } from '../StationScreen';
import { TerminalScreen } from '../TerminalScreen';
import { useAppStore } from '../../stores/app-store';

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
} as never;

function renderWithServices(ui: React.ReactElement) {
  const { ServiceProvider } = require('../../context/service-context');
  return render(
    <ServiceProvider services={mockServices}>{ui}</ServiceProvider>,
  );
}

describe('role screens', () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as never;

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

  it('runs Station mock actions and shows latest result', async () => {
    renderWithServices(<StationScreen navigation={navigation} />);

    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap NFC Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Switch to Top Up'));
    fireEvent.press(screen.getByText('Tap NFC Card to Top Up'));

    await waitFor(() => {
      (expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalled(),
        expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalledWith({
          amount: 50000,
        }));
    });

    // Expand ledger accordion then refresh
    fireEvent.press(screen.getByText('Local Station ledger'));
    fireEvent.press(screen.getByText('Refresh'));
    await waitFor(() =>
      expect(mockGetStationLedgerSummaryUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Station'));
    expect(navigation.goBack).toHaveBeenCalled();
  }, 15000);

  it('runs Gate check-in flow', async () => {
    renderWithServices(<GateScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Gate'));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('shows Gate blocked state for failed check-in', async () => {
    mockCheckInActivityUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'GATE',
      message: 'Already checked in',
    });

    renderWithServices(<GateScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );
    expect(screen.getByText('Blocked')).toBeTruthy();
    expect(screen.getAllByText('Already checked in').length).toBeGreaterThan(0);
  });

  it('runs Terminal checkout flow', async () => {
    renderWithServices(<TerminalScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Terminal'));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('shows Terminal insufficient-balance guidance', async () => {
    mockCheckOutActivityUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'TERMINAL',
      message: 'Insufficient balance for checkout',
    });

    renderWithServices(<TerminalScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );
    expect(screen.getByText('Insufficient balance')).toBeTruthy();
    expect(screen.getByText('Go to Station Top Up')).toBeTruthy();
  });

  it('runs Scout inspection flow', async () => {
    renderWithServices(<ScoutScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Scout'));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
