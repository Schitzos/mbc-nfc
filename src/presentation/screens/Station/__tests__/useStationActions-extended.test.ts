import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useStationActions } from '../useStationActions';
import { useAppStore } from '@presentation/stores/app-store';
import type { StationServices } from '@presentation/context/service-context';

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
  cancelNfc: jest.fn().mockResolvedValue(undefined),
};

describe('useStationActions – extended branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('handles NFC availability check failure silently', async () => {
    (
      mockServices.checkNfcAvailabilityUseCase.execute as jest.Mock
    ).mockRejectedValueOnce(new Error('NFC unavailable'));

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );
    expect(result.current.busyAction).toBeNull();
  });

  it('handles non-Error thrown in handleRegister', async () => {
    (
      mockServices.registerMemberCardUseCase.execute as jest.Mock
    ).mockRejectedValueOnce('string error');

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

  it('handles non-Error thrown in handleTopUp', async () => {
    (
      mockServices.topUpMemberCardUseCase.execute as jest.Mock
    ).mockRejectedValueOnce('string error');

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

  it('handleWipeAndRegister shows error on failure result', async () => {
    (
      mockServices.registerMemberCardUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'This card is already registered.',
    });
    (
      mockServices.registerMemberCardUseCase.executeWithReset as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'Wipe failed.',
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

    // Should be in confirm phase
    expect(result.current.nfcSheet.phase).toBe('confirm');

    // Trigger the onConfirm callback
    const sheet = result.current.nfcSheet as { onConfirm?: () => void };
    await act(async () => {
      sheet.onConfirm?.();
      // Wait for the wipe to complete
      await new Promise(r => setTimeout(r, 10));
    });

    await waitFor(() =>
      expect(
        mockServices.registerMemberCardUseCase.executeWithReset,
      ).toHaveBeenCalled(),
    );
    expect(result.current.nfcSheet.phase).toBe('error');
  });

  it('handleWipeAndRegister handles thrown error', async () => {
    (
      mockServices.registerMemberCardUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'This card is already registered.',
    });
    (
      mockServices.registerMemberCardUseCase.executeWithReset as jest.Mock
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

    const sheet = result.current.nfcSheet as { onConfirm?: () => void };
    await act(async () => {
      sheet.onConfirm?.();
      await new Promise(r => setTimeout(r, 10));
    });

    await waitFor(() => expect(result.current.nfcSheet.phase).toBe('error'));
  });

  it('handleWipeAndRegister handles non-Error thrown', async () => {
    (
      mockServices.registerMemberCardUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'This card is already registered.',
    });
    (
      mockServices.registerMemberCardUseCase.executeWithReset as jest.Mock
    ).mockRejectedValueOnce('string error');

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleRegister();
    });

    const sheet = result.current.nfcSheet as { onConfirm?: () => void };
    await act(async () => {
      sheet.onConfirm?.();
      await new Promise(r => setTimeout(r, 10));
    });

    await waitFor(() => expect(result.current.nfcSheet.phase).toBe('error'));
  });

  it('does not update state after dismiss during top-up', async () => {
    let resolveTopUp: (v: unknown) => void;
    (
      mockServices.topUpMemberCardUseCase.execute as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise(r => {
          resolveTopUp = r;
        }),
    );

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    let topUpPromise: Promise<void>;
    act(() => {
      topUpPromise = result.current.handleTopUp();
    });

    act(() => {
      result.current.handleDismissSheet();
    });

    await act(async () => {
      resolveTopUp!({
        success: true,
        role: 'STATION',
        message: 'Done.',
        card: { balance: 100000 },
      });
      await topUpPromise!;
    });

    expect(result.current.latestResult).toBeNull();
  });

  it('does not update error state after dismiss when register throws', async () => {
    let rejectRegister: (e: unknown) => void;
    (
      mockServices.registerMemberCardUseCase.execute as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise((_r, rej) => {
          rejectRegister = rej;
        }),
    );

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    let promise: Promise<void>;
    act(() => {
      promise = result.current.handleRegister();
    });

    act(() => {
      result.current.handleDismissSheet();
    });

    await act(async () => {
      rejectRegister!(new Error('NFC lost'));
      await promise!;
    });

    expect(result.current.nfcSheet.phase).toBe('idle');
  });

  it('does not update error state after dismiss when top-up throws', async () => {
    let rejectTopUp: (e: unknown) => void;
    (
      mockServices.topUpMemberCardUseCase.execute as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise((_r, rej) => {
          rejectTopUp = rej;
        }),
    );

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    let promise: Promise<void>;
    act(() => {
      promise = result.current.handleTopUp();
    });

    act(() => {
      result.current.handleDismissSheet();
    });

    await act(async () => {
      rejectTopUp!(new Error('NFC lost'));
      await promise!;
    });

    expect(result.current.nfcSheet.phase).toBe('idle');
  });

  it('handleWipeAndRegister catches error after dismiss', async () => {
    (
      mockServices.registerMemberCardUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'STATION',
      message: 'This card is already registered.',
    });

    let rejectWipe: (e: unknown) => void;
    (
      mockServices.registerMemberCardUseCase.executeWithReset as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise((_r, rej) => {
          rejectWipe = rej;
        }),
    );

    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleRegister();
    });

    const sheet = result.current.nfcSheet as { onConfirm?: () => void };
    act(() => {
      sheet.onConfirm?.();
    });

    act(() => {
      result.current.handleDismissSheet();
    });

    await act(async () => {
      rejectWipe!(new Error('NFC lost'));
      await new Promise(r => setTimeout(r, 10));
    });

    // After dismiss, the error in wipe is silently caught (dismissedRef is true)
    expect(result.current.busyAction).toBeNull();
  });

  it('setRegisterMode with function updater', async () => {
    const { result } = renderHook(() => useStationActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    expect(result.current.registerMode).toBe(true);
    act(() => {
      result.current.setRegisterMode((prev: boolean) => !prev);
    });
    expect(result.current.registerMode).toBe(false);
    expect(result.current.latestResult).toBeNull();
  });
});
