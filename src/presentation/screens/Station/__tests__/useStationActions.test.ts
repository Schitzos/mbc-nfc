import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useStationActions } from '../useStationActions';
import { useAppStore } from '../../../stores/app-store';
import type { StationServices } from '../../../context/service-context';

const mockServices: StationServices = {
  checkNfcAvailabilityUseCase: {
    execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
  } as never,
  registerMemberCardUseCase: {
    execute: jest.fn().mockResolvedValue({
      success: true,
      role: 'STATION',
      message: 'Registered.',
      card: { balance: 0 },
    }),
    executeWithReset: jest.fn().mockResolvedValue({
      success: true,
      role: 'STATION',
      message: 'Re-registered.',
    }),
  } as never,
  topUpMemberCardUseCase: {
    execute: jest.fn().mockResolvedValue({
      success: true,
      role: 'STATION',
      message: 'Top-up done.',
      card: { balance: 50000 },
    }),
  } as never,
  getStationLedgerSummaryUseCase: {
    execute: jest.fn().mockResolvedValue({
      topUpTotal: 0,
      checkoutTotal: 0,
      registerCount: 0,
      topUpCount: 0,
      checkoutCount: 0,
      latestEntries: [],
    }),
  } as never,
};

describe('useStationActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('initializes with default state and checks NFC availability', async () => {
    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );
    expect(result.current.registerMode).toBe(true);
    expect(result.current.topUpAmount).toBe('50000');
    expect(result.current.busyAction).toBeNull();
  });

  it('handleRegister calls execute and sets success state', async () => {
    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(mockServices.registerMemberCardUseCase.execute).toHaveBeenCalled();
    expect(result.current.latestResult?.success).toBe(true);
    expect(result.current.nfcSheet.phase).toBe('success');
  });

  it('handleRegister shows confirm sheet when card already registered', async () => {
    (
      mockServices.registerMemberCardUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'This card is already registered.',
    });

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(result.current.nfcSheet.phase).toBe('confirm');
  });

  it('handleRegister shows error on non-registration failure', async () => {
    (
      mockServices.registerMemberCardUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'NFC write failed.',
    });

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(result.current.nfcSheet.phase).toBe('error');
    expect(result.current.latestResult?.success).toBe(false);
  });

  it('handleRegister handles thrown error', async () => {
    (
      mockServices.registerMemberCardUseCase.execute as jest.Mock
    ).mockRejectedValueOnce(new Error('NFC timeout'));

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleRegister();
    });

    expect(result.current.nfcSheet.phase).toBe('error');
  });

  it('handleTopUp calls execute with selected amount', async () => {
    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    act(() => {
      result.current.setTopUpAmount('100000');
    });

    await act(async () => {
      await result.current.handleTopUp();
    });

    expect(mockServices.topUpMemberCardUseCase.execute).toHaveBeenCalledWith({
      amount: 100000,
    });
    expect(result.current.latestResult?.success).toBe(true);
    expect(result.current.nfcSheet.phase).toBe('success');
  });

  it('handleTopUp shows error on failure', async () => {
    (
      mockServices.topUpMemberCardUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'Card tampered.',
    });

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleTopUp();
    });

    expect(result.current.nfcSheet.phase).toBe('error');
  });

  it('handleTopUp handles thrown error', async () => {
    (
      mockServices.topUpMemberCardUseCase.execute as jest.Mock
    ).mockRejectedValueOnce(new Error('Connection lost'));

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleTopUp();
    });

    expect(result.current.nfcSheet.phase).toBe('error');
  });

  it('handleDismissSheet resets sheet and busy state', async () => {
    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    act(() => {
      result.current.handleDismissSheet();
    });

    expect(result.current.nfcSheet.phase).toBe('idle');
    expect(result.current.busyAction).toBeNull();
  });

  it('setRegisterMode clears latestResult', async () => {
    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleRegister();
    });
    expect(result.current.latestResult).not.toBeNull();

    act(() => {
      result.current.setRegisterMode(false);
    });
    expect(result.current.registerMode).toBe(false);
    expect(result.current.latestResult).toBeNull();
  });

  it('refreshSummary updates summary state', async () => {
    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.getStationLedgerSummaryUseCase.execute,
      ).toHaveBeenCalled(),
    );

    (
      mockServices.getStationLedgerSummaryUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      topUpTotal: 100000,
      checkoutTotal: 4000,
      registerCount: 2,
      topUpCount: 3,
      checkoutCount: 1,
      latestEntries: [],
    });

    await act(async () => {
      await result.current.refreshSummary();
    });

    expect(result.current.summary.topUpTotal).toBe(100000);
  });

  it('does not update state after dismiss during register', async () => {
    let resolveRegister: (v: unknown) => void;
    (
      mockServices.registerMemberCardUseCase.execute as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise(r => {
          resolveRegister = r;
        }),
    );

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    let registerPromise: Promise<void>;
    act(() => {
      registerPromise = result.current.handleRegister();
    });

    act(() => {
      result.current.handleDismissSheet();
    });

    await act(async () => {
      resolveRegister!({
        success: true,
        role: 'STATION',
        message: 'Done.',
      });
      await registerPromise!;
    });

    // After dismiss, latestResult should not be updated
    expect(result.current.latestResult).toBeNull();
  });
});
