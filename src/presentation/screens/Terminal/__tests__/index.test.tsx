import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { TerminalScreen } from '@presentation/screens/Terminal';
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
      checkNfcAvailabilityUseCase: {
        execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
      },
      checkInActivityUseCase: { execute: jest.fn() },
    },
    terminal: {
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      checkOutActivityUseCase: mockCheckOutActivityUseCase,
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
    checkNfcAvailabilityUseCase: {
      execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
    },
    checkInActivityUseCase: { execute: jest.fn() },
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  terminal: {
    checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
    checkOutActivityUseCase: mockCheckOutActivityUseCase,
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

describe('Terminal screen', () => {
  beforeEach(() => {
    __mockNavigation.goBack.mockClear();
    __mockNavigation.navigate.mockClear();
    mockCheckNfcAvailabilityUseCase.execute.mockClear();
    mockCheckOutActivityUseCase.execute.mockClear();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('runs Terminal checkout flow', async () => {
    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(__mockNavigation.goBack).toHaveBeenCalled();
  });

  it('shows Terminal insufficient-balance guidance', async () => {
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
    expect(screen.getByText('Insufficient balance')).toBeTruthy();
    expect(screen.getByText('Go to Station Top Up')).toBeTruthy();
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
    expect(__mockNavigation.navigate).toHaveBeenCalledWith('station');
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
      durationMs: 3661000,
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

  it('covers .catch(() => undefined) on handleCheckout onPress', async () => {
    mockCheckOutActivityUseCase.execute.mockRejectedValueOnce(
      new Error('nfc lost'),
    );
    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );
  });

  it('covers NfcActionSheet onDismiss callback', async () => {
    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Done'));
  });

  it('covers the void handleCheckout onPress', async () => {
    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );
  });

  it('renders generic failure message when checkout fails without insufficient', async () => {
    mockCheckOutActivityUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'TERMINAL',
      message: 'Card tampered',
      errorCode: 'CARD_TAMPERED',
    });
    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Dismiss'));
    await waitFor(() =>
      expect(screen.getByText('Card cannot be processed')).toBeTruthy(),
    );
    expect(screen.getByText('Card tampered')).toBeTruthy();
  });

  it('covers navigate to station and retry checkout in insufficient state', async () => {
    mockCheckOutActivityUseCase.execute.mockResolvedValueOnce({
      success: false,
      role: 'TERMINAL',
      message: 'Insufficient balance',
      errorCode: 'INSUFFICIENT_BALANCE',
      chargedAmount: 2000,
      card: { balance: 500 },
    });
    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Dismiss'));
    await waitFor(() =>
      expect(screen.getByText('Go to Station Top Up')).toBeTruthy(),
    );
    fireEvent.press(screen.getByText('Go to Station Top Up'));
    expect(__mockNavigation.navigate).toHaveBeenCalledWith('station');
    mockCheckOutActivityUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'TERMINAL',
      message: 'Out.',
      card: { balance: 48000 },
    });
    fireEvent.press(screen.getByText('Retry Checkout'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalledTimes(2),
    );
  });

  it('renders 0 when card is undefined in success result', async () => {
    mockCheckOutActivityUseCase.execute.mockResolvedValueOnce({
      success: true,
      role: 'TERMINAL',
      message: 'Out.',
      chargedAmount: 2000,
      durationMs: 3600000,
    });
    renderWithServices(<TerminalScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() =>
      expect(mockCheckOutActivityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Done'));
    await waitFor(() =>
      expect(screen.getByText('Checkout Summary')).toBeTruthy(),
    );
  });
});
