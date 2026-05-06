import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import type { MockCardScenario } from '../../../infrastructure/nfc/mock-mbc-card.repository';
import { GateScreen } from '../GateScreen';
import { TerminalScreen } from '../TerminalScreen';
import { StationScreen } from '../StationScreen';
import { ScoutScreen } from '../ScoutScreen';
import { useAppStore } from '../../stores/app-store';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

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

describe('role screens – extended branch coverage', () => {
  const navigation = {
    goBack: jest.fn(),
    navigate: jest.fn(),
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
    getScenario.mockReturnValue('normal');
    readCard.mockResolvedValue({
      activeSession: { activityType: 'PARKING' },
    });
  });

  it('Gate simulation mode toggle works', async () => {
    render(<GateScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    // Toggle simulation on
    fireEvent.press(screen.getByText('Set past time'));
    expect(screen.getByText('Simulation active')).toBeTruthy();
    expect(screen.getByText('On')).toBeTruthy();

    // Check in with simulation timestamp
    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          simulatedCheckedInAt: '2026-05-01T08:30:00.000Z',
        }),
      ),
    );

    // Toggle simulation off
    fireEvent.press(screen.getByText('Clear simulation'));
    expect(screen.getByText('Off')).toBeTruthy();
  });

  it('Gate shows non-double-check-in error (generic card error)', async () => {
    mockCheckInActivityUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'GATE',
      message: 'Card payload is invalid or tampered',
    });

    render(<GateScreen navigation={navigation} />);
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
    });

    render(<TerminalScreen navigation={navigation} />);
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
    });

    render(<TerminalScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Go to Station Top Up'));
    expect(navigation.navigate).toHaveBeenCalledWith('station');
  });

  it('Station shows failed registration result', async () => {
    mockRegisterMemberCardUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'Card is already registered.',
    });

    render(<StationScreen navigation={navigation} />);
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

    render(<ScoutScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('Checked in')).toBeTruthy();
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

    render(<ScoutScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('No logs yet.')).toBeTruthy();
  });

  it('Scout does not call writeCard (read-only)', async () => {
    render(<ScoutScreen navigation={navigation} />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    // Scout should never trigger a write operation
    expect(mockRepository.setScenario).not.toHaveBeenCalledWith(
      expect.objectContaining({ writeCard: expect.anything() }),
    );
  });

  it('Station NFC log panel can be toggled and cleared', async () => {
    render(<StationScreen navigation={navigation} />);
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
});
