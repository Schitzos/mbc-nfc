import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { MockCardScenario } from '../../../infrastructure/nfc/mock-mbc-card.repository';
import { GateScreen } from '../GateScreen';
import { ScoutScreen } from '../ScoutScreen';
import { StationScreen } from '../StationScreen';
import { TerminalScreen } from '../TerminalScreen';

const setScenario = jest.fn();
const getScenario = jest.fn<MockCardScenario, []>(() => 'normal');
const readCard = jest.fn();

const mockRepository = {
  setScenario,
  getScenario,
  readCard,
};

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
  appContainer: {
    getStationServices: () => ({
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      registerMemberCardUseCase: mockRegisterMemberCardUseCase,
      topUpMemberCardUseCase: mockTopUpMemberCardUseCase,
      getStationLedgerSummaryUseCase: mockGetStationLedgerSummaryUseCase,
      mockRepository,
    }),
    getGateServices: () => ({
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      checkInActivityUseCase: mockCheckInActivityUseCase,
      mockRepository,
    }),
    getTerminalServices: () => ({
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      checkOutActivityUseCase: mockCheckOutActivityUseCase,
      mockRepository,
    }),
    getScoutServices: () => ({
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      inspectMemberCardUseCase: mockInspectMemberCardUseCase,
      mockRepository,
    }),
  },
}));

describe('role screens', () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
    getScenario.mockReturnValue('normal');
    readCard.mockResolvedValue({
      activeSession: {
        activityType: 'PARKING',
      },
    });
  });

  it('runs Station mock actions and shows latest result', async () => {
    render(<StationScreen navigation={navigation} />);

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

    fireEvent.press(screen.getByText('Low balance'));
    expect(setScenario).toHaveBeenCalledWith('low-balance');
    fireEvent.changeText(screen.getByPlaceholderText('50000'), '75000');

    fireEvent.press(screen.getByText('Refresh'));
    await waitFor(() =>
      expect(mockGetStationLedgerSummaryUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Station'));
    expect(navigation.goBack).toHaveBeenCalled();
  });

  it('runs Gate check-in flow', async () => {
    render(<GateScreen navigation={navigation} />);
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

    render(<GateScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Already checked in'));
    expect(setScenario).toHaveBeenCalledWith('checked-in');

    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );
    expect(screen.getByText('Blocked')).toBeTruthy();
    expect(screen.getByText('Recovery guidance')).toBeTruthy();
  });

  it('runs Terminal checkout flow', async () => {
    render(<TerminalScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Checked-in parking card'));
    expect(setScenario).toHaveBeenCalledWith('checked-in');
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

    render(<TerminalScreen navigation={navigation} />);
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
    render(<ScoutScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Unregistered'));
    expect(setScenario).toHaveBeenCalledWith('unregistered');
    fireEvent.press(screen.getByText('Tap Card to Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Scout'));
    expect(navigation.goBack).toHaveBeenCalled();
  });
});
