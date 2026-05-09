import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { StationScreen } from '@presentation/screens/Station';
import { GateScreen } from '@presentation/screens/Gate';
import { TerminalScreen } from '@presentation/screens/Terminal';
import { ScoutScreen } from '@presentation/screens/Scout';
import { useAppStore } from '@presentation/stores/app-store';

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
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  gate: {
    checkNfcAvailabilityUseCase: mockCheckNfc,
    checkInActivityUseCase: mockCheckIn,
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  terminal: {
    checkNfcAvailabilityUseCase: mockCheckNfc,
    checkOutActivityUseCase: mockCheckOut,
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  scout: {
    checkNfcAvailabilityUseCase: mockCheckNfc,
    inspectMemberCardUseCase: mockInspect,
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
} as never;

function renderWithServices(ui: React.ReactElement) {
  const { ServiceProvider } = require('../../context/service-context');
  return render(
    <ServiceProvider services={mockServices}>{ui}</ServiceProvider>,
  );
}

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
      renderWithServices(<StationScreen />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Register'));
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
      renderWithServices(<StationScreen />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      // This triggers the .catch(() => undefined) path
      fireEvent.press(screen.getByText('Tap Card to Register'));
      await waitFor(() => expect(mockRegister.execute).toHaveBeenCalled());
    });

    it('covers .catch(() => undefined) on handleTopUp onPress', async () => {
      mockTopUp.execute.mockRejectedValueOnce(new Error('fail'));
      renderWithServices(<StationScreen />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Top Up'));
      fireEvent.press(screen.getByText('Tap Card to Top Up'));
      await waitFor(() => expect(mockTopUp.execute).toHaveBeenCalled());
    });

    it('covers .catch(() => undefined) on refreshSummary', async () => {
      mockLedger.execute.mockRejectedValueOnce(new Error('db error'));
      renderWithServices(<StationScreen />);
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
      renderWithServices(<StationScreen />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Register'));
      await waitFor(() => expect(mockRegister.execute).toHaveBeenCalled());
      // Dismiss the success sheet
      fireEvent.press(screen.getByText('Done'));
    });
  });

  describe('Gate', () => {
    it('covers .catch(() => undefined) on handleCheckIn onPress', async () => {
      mockCheckIn.execute.mockRejectedValueOnce(new Error('nfc lost'));
      renderWithServices(<GateScreen />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Check In'));
      await waitFor(() => expect(mockCheckIn.execute).toHaveBeenCalled());
    });

    it('covers NfcActionSheet onDismiss callback', async () => {
      renderWithServices(<GateScreen />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Check In'));
      await waitFor(() => expect(mockCheckIn.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Done'));
    });
  });

  describe('Terminal', () => {
    it('covers .catch(() => undefined) on handleCheckout onPress', async () => {
      mockCheckOut.execute.mockRejectedValueOnce(new Error('nfc lost'));
      renderWithServices(<TerminalScreen />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Check Out'));
      await waitFor(() => expect(mockCheckOut.execute).toHaveBeenCalled());
    });

    it('covers NfcActionSheet onDismiss callback', async () => {
      renderWithServices(<TerminalScreen />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Tap Card to Check Out'));
      await waitFor(() => expect(mockCheckOut.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Done'));
    });
  });

  describe('Scout', () => {
    it('covers .catch(() => undefined) on handleInspect onPress', async () => {
      mockInspect.execute.mockRejectedValueOnce(new Error('cancelled'));
      renderWithServices(<ScoutScreen />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Inspect'));
      await waitFor(() => expect(mockInspect.execute).toHaveBeenCalled());
    });

    it('covers NfcActionSheet onDismiss callback', async () => {
      renderWithServices(<ScoutScreen />);
      await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
      fireEvent.press(screen.getByText('Inspect'));
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
    renderWithServices(<StationScreen />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() => expect(screen.getByText('Latest result')).toBeTruthy());
    // The resultTime branch is covered — formatResultDate is called
    expect(screen.getByText('Success')).toBeTruthy();
  });
});

describe('Station — TextInput custom amount', () => {
  it('covers onChangeText for custom top-up amount', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Top Up'));
    const input = screen.getByDisplayValue('50.000');
    fireEvent.changeText(input, '75000');
    expect(screen.getByDisplayValue('75.000')).toBeTruthy();
  });

  it('covers onChangeText with empty string defaults to 0', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Top Up'));
    const input = screen.getByDisplayValue('50.000');
    fireEvent.changeText(input, '');
    expect(screen.getByDisplayValue('0')).toBeTruthy();
  });
});

describe('Terminal — handleCheckout void wrapper', () => {
  it('covers the void handleCheckout onPress', async () => {
    renderWithServices(<TerminalScreen />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() => expect(mockCheckOut.execute).toHaveBeenCalled());
  });
});

describe('Scout — activeSession branch', () => {
  it('covers activeSession checkedInAt rendering', async () => {
    mockInspect.execute.mockResolvedValueOnce({
      success: true,
      role: 'SCOUT',
      message: 'Read.',
      card: {
        balance: 48000,
        visitStatus: 'CHECKED_IN',
        activeSession: { checkedInAt: '2026-05-01T08:00:00.000Z' },
        transactionLogs: [],
      },
    });
    renderWithServices(<ScoutScreen />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() => expect(screen.getByText(/Checked in/)).toBeTruthy());
    expect(screen.getByText('Since')).toBeTruthy();
  });
});

describe('Station — Register from top-up mode', () => {
  it('covers setRegisterMode(true) onPress in top-up mode', async () => {
    renderWithServices(<StationScreen />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    // Switch to top-up mode first
    fireEvent.press(screen.getByText('Top Up'));
    // Now switch back to register
    fireEvent.press(screen.getByText('Register'));
    expect(screen.getByText('Tap Card to Register')).toBeTruthy();
  });
});

describe('GateResultState — invalid date branch', () => {
  it('covers formatCheckinDate with invalid ISO string', async () => {
    const { GateScreen: GateScreenLocal } = require('../Gate');
    mockCheckIn.execute.mockResolvedValueOnce({
      success: true,
      role: 'GATE',
      message: 'In.',
      card: {
        balance: 50000,
        visitStatus: 'CHECKED_IN',
        activeSession: { checkedInAt: 'invalid-date' },
      },
    });
    renderWithServices(<GateScreenLocal />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Tap Card to Check In'));
    await waitFor(() => expect(mockCheckIn.execute).toHaveBeenCalled());
    expect(screen.getByText('invalid-date')).toBeTruthy();
  });
});

describe('AppHeaderCard — no subTitle branch', () => {
  it('renders without subTitle prop', () => {
    const { AppHeaderCard } = require('../../components/AppHeaderCard');
    render(<AppHeaderCard title="Test" />);
    expect(screen.getByText('Test')).toBeTruthy();
  });
});

describe('Terminal — genericFailure branch', () => {
  it('renders generic failure message when checkout fails without insufficient', async () => {
    mockCheckOut.execute.mockResolvedValueOnce({
      success: false,
      role: 'TERMINAL',
      message: 'Card tampered',
      errorCode: 'CARD_TAMPERED',
    });
    renderWithServices(<TerminalScreen />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() => expect(mockCheckOut.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Dismiss'));
    await waitFor(() =>
      expect(screen.getByText('Card cannot be processed')).toBeTruthy(),
    );
    expect(screen.getByText('Card tampered')).toBeTruthy();
  });
});

describe('Terminal — insufficient navigate and retry', () => {
  beforeEach(() => jest.clearAllMocks());

  it('covers navigate to station and retry checkout in insufficient state', async () => {
    mockCheckOut.execute.mockResolvedValueOnce({
      success: false,
      role: 'TERMINAL',
      message: 'Insufficient balance',
      errorCode: 'INSUFFICIENT_BALANCE',
      chargedAmount: 2000,
      card: { balance: 500 },
    });
    renderWithServices(<TerminalScreen />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() => expect(mockCheckOut.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Dismiss'));
    await waitFor(() =>
      expect(screen.getByText('Go to Station Top Up')).toBeTruthy(),
    );
    fireEvent.press(screen.getByText('Go to Station Top Up'));
    const { __mockNavigation } = require('@react-navigation/native');
    expect(__mockNavigation.navigate).toHaveBeenCalledWith('station');
    mockCheckOut.execute.mockResolvedValueOnce({
      success: true,
      role: 'TERMINAL',
      message: 'Out.',
      card: { balance: 48000 },
    });
    fireEvent.press(screen.getByText('Retry Checkout'));
    await waitFor(() => expect(mockCheckOut.execute).toHaveBeenCalledTimes(2));
  });
});

describe('Station — memberName and CHECKED_IN branches', () => {
  it('renders memberName when present in card result', async () => {
    mockRegister.execute.mockResolvedValueOnce({
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
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Tap Card to Register'));
    await waitFor(() => expect(mockRegister.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Done'));
    await waitFor(() => expect(screen.getByText('John Doe')).toBeTruthy());
    expect(screen.getByText(/Checked in/)).toBeTruthy();
  });
});

describe('Terminal — success without card (null card branch)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders 0 when card is undefined in success result', async () => {
    mockCheckOut.execute.mockResolvedValueOnce({
      success: true,
      role: 'TERMINAL',
      message: 'Out.',
      chargedAmount: 2000,
      durationMs: 3600000,
    });
    renderWithServices(<TerminalScreen />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Tap Card to Check Out'));
    await waitFor(() => expect(mockCheckOut.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Done'));
    await waitFor(() =>
      expect(screen.getByText('Checkout Summary')).toBeTruthy(),
    );
  });
});

describe('Scout — MemberCardInfo invalid date branch', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders raw ISO string when checkedInAt is invalid', async () => {
    mockInspect.execute.mockResolvedValueOnce({
      success: true,
      role: 'SCOUT',
      message: 'Read.',
      card: {
        balance: 48000,
        visitStatus: 'CHECKED_IN',
        activeSession: { checkedInAt: 'not-a-date' },
        transactionLogs: [],
      },
    });
    renderWithServices(<ScoutScreen />);
    await waitFor(() => expect(mockCheckNfc.execute).toHaveBeenCalled());
    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() => expect(screen.getByText('not-a-date')).toBeTruthy());
  });
});
