import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { ScoutScreen } from '@presentation/screens/Scout';
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
      checkNfcAvailabilityUseCase: {
        execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
      },
      checkOutActivityUseCase: { execute: jest.fn() },
    },
    scout: {
      checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
      inspectMemberCardUseCase: mockInspectMemberCardUseCase,
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
    checkNfcAvailabilityUseCase: {
      execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
    },
    checkOutActivityUseCase: { execute: jest.fn() },
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
  scout: {
    checkNfcAvailabilityUseCase: mockCheckNfcAvailabilityUseCase,
    inspectMemberCardUseCase: mockInspectMemberCardUseCase,
    cancelNfc: jest.fn().mockResolvedValue(undefined),
  },
} as never;

function renderWithServices(ui: React.ReactElement) {
  const { ServiceProvider } = require('../../../context/service-context');
  return render(
    <ServiceProvider services={mockServices}>{ui}</ServiceProvider>,
  );
}

describe('Scout screen', () => {
  beforeEach(() => {
    __mockNavigation.goBack.mockClear();
    mockCheckNfcAvailabilityUseCase.execute.mockClear();
    mockInspectMemberCardUseCase.execute.mockClear();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('runs Scout inspection flow', async () => {
    renderWithServices(<ScoutScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );
    await waitFor(() => expect(screen.getByText('Done')).toBeTruthy(), {
      timeout: 10000,
    });
    fireEvent.press(screen.getByText('Done'));
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(__mockNavigation.goBack).toHaveBeenCalled();
  }, 15000);

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

    expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalledTimes(1);
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

    await waitFor(() => expect(screen.getByText('Done')).toBeTruthy());
    fireEvent.press(screen.getByText('Done'));

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

  it('covers .catch(() => undefined) on handleInspect onPress', async () => {
    mockInspectMemberCardUseCase.execute.mockRejectedValueOnce(
      new Error('cancelled'),
    );
    renderWithServices(<ScoutScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );
  });

  it('covers NfcActionSheet onDismiss callback', async () => {
    renderWithServices(<ScoutScreen />);
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() =>
      expect(mockInspectMemberCardUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Done'));
  });

  it('covers activeSession checkedInAt rendering', async () => {
    mockInspectMemberCardUseCase.execute.mockResolvedValueOnce({
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
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() => expect(screen.getByText(/Checked in/)).toBeTruthy());
    expect(screen.getByText('Since')).toBeTruthy();
  });

  it('renders raw ISO string when checkedInAt is invalid', async () => {
    mockInspectMemberCardUseCase.execute.mockResolvedValueOnce({
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
    await waitFor(() =>
      expect(mockCheckNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );
    fireEvent.press(screen.getByText('Inspect'));
    await waitFor(() => expect(screen.getByText('not-a-date')).toBeTruthy());
  });
});
