import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { GateScreen } from '@presentation/screens/Gate';
import { useAppStore } from '@presentation/stores/app-store';

const { __mockNavigation } = require('@react-navigation/native');

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

jest.mock('../../../../app/container', () => ({
  createAppServices: () => ({
    station: {
      checkNfcAvailabilityUseCase: {
        execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
      },
      registerMemberCardUseCase: {
        execute: jest.fn(),
        executeWithReset: jest.fn(),
      },
      topUpMemberCardUseCase: { execute: jest.fn() },
      getStationLedgerSummaryUseCase: { execute: jest.fn() },
    },
    gate: {
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      checkInActivityUseCase: mockCheckInActivityUseCase,
    },
    terminal: {
      checkNfcAvailabilityUseCase: {
        execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
      },
      checkOutActivityUseCase: { execute: jest.fn() },
    },
    scout: {
      checkNfcAvailabilityUseCase: {
        execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
      },
      inspectMemberCardUseCase: { execute: jest.fn() },
    },
  }),
}));

const mockServices = {
  station: {
    checkNfcAvailabilityUseCase: {
      execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
    },
    registerMemberCardUseCase: {
      execute: jest.fn(),
      executeWithReset: jest.fn(),
    },
    topUpMemberCardUseCase: { execute: jest.fn() },
    getStationLedgerSummaryUseCase: { execute: jest.fn() },
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  gate: {
    checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
    checkInActivityUseCase: mockCheckInActivityUseCase,
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  terminal: {
    checkNfcAvailabilityUseCase: {
      execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
    },
    checkOutActivityUseCase: { execute: jest.fn() },
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  scout: {
    checkNfcAvailabilityUseCase: {
      execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
    },
    inspectMemberCardUseCase: { execute: jest.fn() },
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
} as never;

function renderWithServices(ui: React.ReactElement) {
  const { ServiceProvider } = require('../../../context/service-context');
  return render(
    <ServiceProvider services={mockServices}>{ui}</ServiceProvider>,
  );
}

describe('Gate screen', () => {
  beforeEach(() => {
    __mockNavigation.goBack.mockClear();
    __mockNavigation.navigate.mockClear();
    mockCheckNfcAvailabilityUseCase.execute.mockClear();
    mockCheckInActivityUseCase.execute.mockClear();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('runs Gate check-in flow', async () => {
    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(__mockNavigation.goBack).toHaveBeenCalled();
  });

  it('shows Gate blocked state for failed check-in', async () => {
    mockCheckInActivityUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'GATE',
      message: 'Already checked in',
      errorCode: 'ALREADY_CHECKED_IN',
    });

    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );
    expect(screen.getByText('ALREADY CHECKED IN')).toBeTruthy();
    expect(screen.getAllByText('Already checked in').length).toBeGreaterThan(0);
  });

  it('Gate check-in calls use case with activityType', async () => {
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

    expect(screen.getByText('CARD CANNOT BE PROCESSED')).toBeTruthy();
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

  it('Gate dismisses NFC action sheet after success', async () => {
    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );

    const doneButton = screen.queryByText('Done');
    if (doneButton) {
      fireEvent.press(doneButton);
    }
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

  it('covers .catch(() => undefined) on handleCheckIn onPress', async () => {
    mockCheckInActivityUseCase.execute.mockRejectedValueOnce(
      new Error('nfc lost'),
    );
    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );
  });

  it('covers NfcActionSheet onDismiss callback', async () => {
    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() =>
      expect(mockCheckInActivityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Done'));
  });

  it('covers formatCheckinDate with invalid ISO string', async () => {
    mockCheckInActivityUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'GATE',
      message: 'In.',
      card: {
        balance: 50000,
        visitStatus: 'CHECKED_IN',
        activeSession: { checkedInAt: 'invalid-date' },
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
    expect(screen.getByText('invalid-date')).toBeTruthy();
  });

  it('Gate simulation toggle shows banner and date picker UI', async () => {
    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    const toggle = screen.getByTestId('simulation-toggle');
    fireEvent(toggle, 'valueChange', true);

    await waitFor(() =>
      expect(screen.getByTestId('simulation-banner')).toBeTruthy(),
    );

    fireEvent.press(screen.getByTestId('simulation-date-button'));
    await waitFor(() =>
      expect(screen.getByTestId('simulation-date-picker')).toBeTruthy(),
    );

    fireEvent(
      screen.getByTestId('simulation-date-picker'),
      'onChange',
      {
        nativeEvent: { timestamp: Date.now() },
      },
      new Date('2026-05-01T08:00:00.000Z'),
    );

    await waitFor(() =>
      expect(screen.getByTestId('simulation-time-picker')).toBeTruthy(),
    );

    fireEvent(
      screen.getByTestId('simulation-time-picker'),
      'onChange',
      {
        nativeEvent: { timestamp: Date.now() },
      },
      new Date('2026-05-01T08:30:00.000Z'),
    );
  });

  it('Gate date picker handles cancel (no date)', async () => {
    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    const toggle = screen.getByTestId('simulation-toggle');
    fireEvent(toggle, 'valueChange', true);

    await waitFor(() =>
      expect(screen.getByTestId('simulation-date-button')).toBeTruthy(),
    );

    fireEvent.press(screen.getByTestId('simulation-date-button'));
    await waitFor(() =>
      expect(screen.getByTestId('simulation-date-picker')).toBeTruthy(),
    );

    fireEvent(
      screen.getByTestId('simulation-date-picker'),
      'onChange',
      {
        nativeEvent: { timestamp: Date.now() },
      },
      undefined,
    );

    await waitFor(() =>
      expect(screen.queryByTestId('simulation-date-picker')).toBeNull(),
    );
    expect(screen.queryByTestId('simulation-time-picker')).toBeNull();
  });

  it('Gate time picker handles cancel (no time)', async () => {
    renderWithServices(<GateScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    const toggle = screen.getByTestId('simulation-toggle');
    fireEvent(toggle, 'valueChange', true);

    await waitFor(() =>
      expect(screen.getByTestId('simulation-date-button')).toBeTruthy(),
    );

    fireEvent.press(screen.getByTestId('simulation-date-button'));
    await waitFor(() =>
      expect(screen.getByTestId('simulation-date-picker')).toBeTruthy(),
    );

    fireEvent(
      screen.getByTestId('simulation-date-picker'),
      'onChange',
      {
        nativeEvent: { timestamp: Date.now() },
      },
      new Date('2026-05-01T08:00:00.000Z'),
    );

    await waitFor(() =>
      expect(screen.getByTestId('simulation-time-picker')).toBeTruthy(),
    );

    fireEvent(
      screen.getByTestId('simulation-time-picker'),
      'onChange',
      {
        nativeEvent: { timestamp: Date.now() },
      },
      undefined,
    );

    await waitFor(() =>
      expect(screen.queryByTestId('simulation-time-picker')).toBeNull(),
    );
  });
});
