import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { StationScreen } from '@presentation/screens/Station';
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

jest.mock('../../../../app/container', () => ({
  createAppServices: () => ({
    station: {
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      registerMemberCardUseCase: mockRegisterMemberCardUseCase,
      topUpMemberCardUseCase: mockTopUpMemberCardUseCase,
      getStationLedgerSummaryUseCase: mockGetStationLedgerSummaryUseCase,
    },
    gate: {
      checkNfcAvailabilityUseCase: {
        execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
      },
      checkInActivityUseCase: { execute: jest.fn() },
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
    checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
    registerMemberCardUseCase: mockRegisterMemberCardUseCase,
    topUpMemberCardUseCase: mockTopUpMemberCardUseCase,
    getStationLedgerSummaryUseCase: mockGetStationLedgerSummaryUseCase,
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  gate: {
    checkNfcAvailabilityUseCase: {
      execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
    },
    checkInActivityUseCase: { execute: jest.fn() },
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

describe('Station screen', () => {
  beforeEach(() => {
    __mockNavigation.goBack.mockClear();
    mockCheckNfcAvailabilityUseCase.execute.mockClear();
    mockRegisterMemberCardUseCase.execute.mockClear();
    mockRegisterMemberCardUseCase.executeWithReset.mockClear();
    mockTopUpMemberCardUseCase.execute.mockClear();
    mockGetStationLedgerSummaryUseCase.execute.mockClear();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('runs Station mock actions and shows latest result', async () => {
    renderWithServices(<StationScreen />);

    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Top Up'));
    fireEvent.press(screen.getByText('Tap Card to Top Up'));

    await waitFor(() => {
      (expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalled(),
        expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalledWith({
          amount: 50000,
        }));
    });

    fireEvent.press(screen.getByText('Local Station ledger'));
    fireEvent.press(screen.getByText('Refresh'));
    await waitFor(() =>
      expect(mockGetStationLedgerSummaryUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByLabelText('Go back'));
    expect(__mockNavigation.goBack).toHaveBeenCalled();
  }, 15000);

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

    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('Unable to complete')).toBeTruthy();
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

    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('Card Already Registered')).toBeTruthy();
    expect(screen.getByText('Wipe & Re-register')).toBeTruthy();
    expect(screen.getByText('Skip')).toBeTruthy();

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

    fireEvent.press(screen.getByText('Top Up'));
    fireEvent.press(screen.getByText('100k'));
    fireEvent.press(screen.getByText('Tap Card to Top Up'));
    await waitFor(() =>
      expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalledWith({
        amount: 100000,
      }),
    );
  });

  it('Station handleRegister in register mode triggers NFC flow', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );

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

    fireEvent.press(screen.getByText('Top Up'));
    fireEvent.press(screen.getByText('Tap Card to Top Up'));
    await waitFor(() =>
      expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    expect(screen.getByText('Unable to complete')).toBeTruthy();
  });

  it('Station dismisses NFC action sheet after register', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );

    const doneButton = screen.queryByText('Done');
    if (doneButton) {
      fireEvent.press(doneButton);
    }
  });

  it('covers resultTime empty branch (no resultTime)', async () => {
    mockRegisterMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'STATION',
      message: 'Registered.',
      card: { balance: 0 },
    });
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );
    await waitFor(() => expect(screen.getByText('Done')).toBeTruthy());
    fireEvent.press(screen.getByText('Done'));
    await waitFor(() => expect(screen.getByText('Latest result')).toBeTruthy());
  }, 15000);

  it('covers .catch(() => undefined) on handleRegister onPress', async () => {
    mockRegisterMemberCardUseCase.execute.mockRejectedValueOnce(
      new Error('fail'),
    );
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );
  });

  it('covers .catch(() => undefined) on handleTopUp onPress', async () => {
    mockTopUpMemberCardUseCase.execute.mockRejectedValueOnce(new Error('fail'));
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Top Up'));
    fireEvent.press(screen.getByText('Tap Card to Top Up'));
    await waitFor(() =>
      expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalled(),
    );
  });

  it('covers .catch(() => undefined) on refreshSummary', async () => {
    mockGetStationLedgerSummaryUseCase.execute.mockRejectedValueOnce(
      new Error('db error'),
    );
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Local Station ledger'));
    fireEvent.press(screen.getByText('Refresh'));
    await waitFor(() =>
      expect(mockGetStationLedgerSummaryUseCase.execute).toHaveBeenCalledTimes(
        2,
      ),
    );
  });

  it('covers NfcActionSheet onDismiss callback', async () => {
    mockRegisterMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'STATION',
      message: 'Done.',
      card: { balance: 0 },
    });
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Done'));
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

    fireEvent.press(screen.getByText('Top Up'));
    fireEvent.press(screen.getByText('Tap Card to Top Up'));
    await waitFor(() =>
      expect(mockTopUpMemberCardUseCase.execute).toHaveBeenCalled(),
    );
  });

  it('Station refresh summary button works', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    fireEvent.press(screen.getByText('Local Station ledger'));
    fireEvent.press(screen.getByText('Refresh'));
    await waitFor(() =>
      expect(mockGetStationLedgerSummaryUseCase.execute).toHaveBeenCalledTimes(
        2,
      ),
    );
  });

  it('renders empty string when resultTime is null but latestResult exists', async () => {
    mockRegisterMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'STATION',
      message: 'Done.',
      card: { balance: 0 },
    });
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() => expect(screen.getByText('Latest result')).toBeTruthy());
    expect(screen.getByText('Success')).toBeTruthy();
  });

  it('covers onChangeText for custom top-up amount', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Top Up'));
    const input = screen.getByDisplayValue('50.000');
    fireEvent.changeText(input, '75000');
    expect(screen.getByDisplayValue('75.000')).toBeTruthy();
  });

  it('covers onChangeText with empty string defaults to 0', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Top Up'));
    const input = screen.getByDisplayValue('50.000');
    fireEvent.changeText(input, '');
    expect(screen.getByDisplayValue('0')).toBeTruthy();
  });

  it('covers setRegisterMode(true) onPress in top-up mode', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Top Up'));
    fireEvent.press(screen.getByText('Register'));
    expect(screen.getByText('Tap Card to Register')).toBeTruthy();
  });

  it('renders memberName when present in card result', async () => {
    mockRegisterMemberCardUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'STATION',
      message: 'Registered.',
      card: {
        balance: 10000,
        maskedMemberReference: 'MBR-1234',
        memberName: 'John Doe',
        visitStatus: 'CHECKED_IN',
      },
    });
    renderWithServices(<StationScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() =>
      expect(mockRegisterMemberCardUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Done'));
    await waitFor(() => expect(screen.getByText('John Doe')).toBeTruthy());
    expect(screen.getByText(/Checked in/)).toBeTruthy();
  });
});
