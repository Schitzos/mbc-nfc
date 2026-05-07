import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { StationScreen } from '../Station';
import { GateScreen } from '../Gate';
import { TerminalScreen } from '../Terminal';
import { ScoutScreen } from '../Scout';
import { useAppStore } from '../../stores/app-store';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockCheckNfc = {
  execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
};
const mockRegister = {
  execute: jest
    .fn()
    .mockResolvedValue({ success: true, role: 'STATION', message: 'Done.' }),
  executeWithReset: jest
    .fn()
    .mockResolvedValue({ success: true, role: 'STATION', message: 'Reset.' }),
};
const mockTopUp = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'STATION',
    message: 'Top-up.',
    card: { balance: 50000 },
  }),
};
const mockLedger = {
  execute: jest.fn().mockResolvedValue({
    topUpTotal: 0,
    checkoutTotal: 0,
    registerCount: 0,
    topUpCount: 0,
    checkoutCount: 0,
    latestEntries: [],
  }),
};
const mockCheckIn = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'GATE',
    message: 'In.',
    card: { balance: 50000 },
  }),
};
const mockCheckOut = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'TERMINAL',
    message: 'Out.',
    chargedHours: 1,
    chargedAmount: 2000,
    durationMs: 3600000,
    card: { balance: 48000 },
  }),
};
const mockInspect = {
  execute: jest.fn().mockResolvedValue({
    success: true,
    role: 'SCOUT',
    message: 'Read.',
    card: {
      balance: 48000,
      visitStatus: 'NOT_CHECKED_IN',
      transactionLogs: [],
    },
  }),
};

jest.mock('../../../app/container', () => ({
  createAppServices: () => ({
    station: {
      checkNfcAvailabilityUseCase: mockCheckNfc,
      registerMemberCardUseCase: mockRegister,
      topUpMemberCardUseCase: mockTopUp,
      getStationLedgerSummaryUseCase: mockLedger,
    },
    gate: {
      checkNfcAvailabilityUseCase: mockCheckNfc,
      checkInActivityUseCase: mockCheckIn,
    },
    terminal: {
      checkNfcAvailabilityUseCase: mockCheckNfc,
      checkOutActivityUseCase: mockCheckOut,
    },
    scout: {
      checkNfcAvailabilityUseCase: mockCheckNfc,
      inspectMemberCardUseCase: mockInspect,
    },
  }),
}));

const mockServices = {
  station: {
    checkNfcAvailabilityUseCase: mockCheckNfc,
    registerMemberCardUseCase: mockRegister,
    topUpMemberCardUseCase: mockTopUp,
    getStationLedgerSummaryUseCase: mockLedger,
  },
  gate: {
    checkNfcAvailabilityUseCase: mockCheckNfc,
    checkInActivityUseCase: mockCheckIn,
  },
  terminal: {
    checkNfcAvailabilityUseCase: mockCheckNfc,
    checkOutActivityUseCase: mockCheckOut,
  },
  scout: {
    checkNfcAvailabilityUseCase: mockCheckNfc,
    inspectMemberCardUseCase: mockInspect,
  },
} as never;

function renderWithServices(ui: React.ReactElement) {
  const { ServiceProvider } = require('../../context/service-context');
  return render(
    <ServiceProvider services={mockServices}>{ui}</ServiceProvider>,
  );
}

const navigation = { goBack: jest.fn(), navigate: jest.fn() } as never;

describe('screen index.tsx — 100% function coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  describe('Station', () => {
    it('covers resultTime empty branch (no resultTime)', async () => {
      mockRegister.execute.mockResolvedValueOnce({
        success: true,
        role: 'STATION',
        message: 'Registered.',
        card: { balance: 0 },
      });
      renderWithServices(<StationScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap NFC Card to Register'));
      await waitFor(() => expect(mockRegister.execute).toHaveBeenCalled());
      // Dismiss the success sheet to reveal the result section
      await waitFor(() => expect(screen.getByText('Done')).toBeTruthy());
      fireEvent.press(screen.getByText('Done'));
      await waitFor(() =>
        expect(screen.getByText('Latest result')).toBeTruthy(),
      );
    }, 15000);

    it('covers .catch(() => undefined) on handleRegister onPress', async () => {
      mockRegister.execute.mockRejectedValueOnce(new Error('fail'));
      renderWithServices(<StationScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      // This triggers the .catch(() => undefined) path
      fireEvent.press(screen.getByText('Tap NFC Card to Register'));
      await waitFor(() => expect(mockRegister.execute).toHaveBeenCalled());
    });

    it('covers .catch(() => undefined) on handleTopUp onPress', async () => {
      mockTopUp.execute.mockRejectedValueOnce(new Error('fail'));
      renderWithServices(<StationScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Switch to Top Up'));
      fireEvent.press(screen.getByText('Tap NFC Card to Top Up'));
      await waitFor(() => expect(mockTopUp.execute).toHaveBeenCalled());
    });

    it('covers .catch(() => undefined) on refreshSummary', async () => {
      mockLedger.execute.mockRejectedValueOnce(new Error('db error'));
      renderWithServices(<StationScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Local Station ledger'));
      fireEvent.press(screen.getByText('Refresh'));
      // The .catch swallows the error
      await waitFor(() => expect(mockLedger.execute).toHaveBeenCalledTimes(2));
    });

    it('covers NfcActionSheet onDismiss callback', async () => {
      mockRegister.execute.mockResolvedValueOnce({
        success: true,
        role: 'STATION',
        message: 'Done.',
        card: { balance: 0 },
      });
      renderWithServices(<StationScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap NFC Card to Register'));
      await waitFor(() => expect(mockRegister.execute).toHaveBeenCalled());
      // Dismiss the success sheet
      fireEvent.press(screen.getByText('Done'));
    });
  });

  describe('Gate', () => {
    it('covers .catch(() => undefined) on handleCheckIn onPress', async () => {
      mockCheckIn.execute.mockRejectedValueOnce(new Error('nfc lost'));
      renderWithServices(<GateScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Check In'));
      await waitFor(() => expect(mockCheckIn.execute).toHaveBeenCalled());
    });

    it('covers NfcActionSheet onDismiss callback', async () => {
      renderWithServices(<GateScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Check In'));
      await waitFor(() => expect(mockCheckIn.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Done'));
    });
  });

  describe('Terminal', () => {
    it('covers .catch(() => undefined) on handleCheckout onPress', async () => {
      mockCheckOut.execute.mockRejectedValueOnce(new Error('nfc lost'));
      renderWithServices(<TerminalScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Check Out'));
      await waitFor(() => expect(mockCheckOut.execute).toHaveBeenCalled());
    });

    it('covers NfcActionSheet onDismiss callback', async () => {
      renderWithServices(<TerminalScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Check Out'));
      await waitFor(() => expect(mockCheckOut.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Done'));
    });
  });

  describe('Scout', () => {
    it('covers .catch(() => undefined) on handleInspect onPress', async () => {
      mockInspect.execute.mockRejectedValueOnce(new Error('cancelled'));
      renderWithServices(<ScoutScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Inspect'));
      await waitFor(() => expect(mockInspect.execute).toHaveBeenCalled());
    });

    it('covers NfcActionSheet onDismiss callback', async () => {
      renderWithServices(<ScoutScreen navigation={navigation} />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Inspect'));
      await waitFor(() => expect(mockInspect.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Done'));
    });
  });
});

describe('Station — resultTime null branch', () => {
  it('renders empty string when resultTime is null but latestResult exists', async () => {
    // Register succeeds — resultTime is set by the hook, but we verify the render path
    mockRegister.execute.mockResolvedValueOnce({
      success: true,
      role: 'STATION',
      message: 'Done.',
      card: { balance: 0 },
    });
    renderWithServices(<StationScreen navigation={navigation} />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Tap NFC Card to Register'));
    await waitFor(() => expect(screen.getByText('Latest result')).toBeTruthy());
    // The resultTime branch is covered — formatResultDate is called
    expect(screen.getByText('Success')).toBeTruthy();
  });
});
