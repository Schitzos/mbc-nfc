import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTerminalActions } from '../useTerminalActions';
import { useAppStore } from '@presentation/stores/app-store';
import type { TerminalServices } from '@presentation/context/service-context';

const mockServices: TerminalServices = {
  checkNfcAvailabilityUseCase: {
    execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
  } as never,
  checkOutActivityUseCase: {
    execute: jest.fn().mockResolvedValue({
      success: true,
      role: 'TERMINAL',
      message: 'Checked out.',
      chargedHours: 2,
      chargedAmount: 4000,
      durationMs: 7200000,
      card: { balance: 46000 },
    }),
  } as never,
};

describe('useTerminalActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('initializes and checks NFC availability', async () => {
    const { result } = renderHook(() => useTerminalActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );
    expect(result.current.busy).toBe(false);
    expect(result.current.latestResult).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.insufficient).toBe(false);
    expect(result.current.genericFailure).toBe(false);
  });

  it('handleCheckout sets success state and checkoutTime', async () => {
    const { result } = renderHook(() => useTerminalActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(mockServices.checkOutActivityUseCase.execute).toHaveBeenCalled();
    expect(result.current.success).toBe(true);
    expect(result.current.checkoutTime).not.toBe('');
    expect(result.current.nfcSheet.phase).toBe('success');
  });

  it('handleCheckout detects insufficient balance', async () => {
    (
      mockServices.checkOutActivityUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'TERMINAL',
      message: 'Insufficient balance for checkout.',
    });

    const { result } = renderHook(() => useTerminalActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(result.current.insufficient).toBe(true);
    expect(result.current.genericFailure).toBe(false);
    expect(result.current.nfcSheet.phase).toBe('error');
  });

  it('handleCheckout detects generic failure', async () => {
    (
      mockServices.checkOutActivityUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'TERMINAL',
      message: 'Card tampered.',
    });

    const { result } = renderHook(() => useTerminalActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(result.current.genericFailure).toBe(true);
    expect(result.current.insufficient).toBe(false);
  });

  it('handleCheckout handles thrown error', async () => {
    (
      mockServices.checkOutActivityUseCase.execute as jest.Mock
    ).mockRejectedValueOnce(new Error('NFC lost'));

    const { result } = renderHook(() => useTerminalActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(result.current.nfcSheet.phase).toBe('error');
  });

  it('handleDismissSheet resets state', async () => {
    const { result } = renderHook(() => useTerminalActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    act(() => {
      result.current.handleDismissSheet();
    });

    expect(result.current.nfcSheet.phase).toBe('idle');
    expect(result.current.busy).toBe(false);
  });

  it('does not update state after dismiss during checkout', async () => {
    let resolveCheckout: (v: unknown) => void;
    (
      mockServices.checkOutActivityUseCase.execute as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise(r => {
          resolveCheckout = r;
        }),
    );

    const { result } = renderHook(() => useTerminalActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    let checkoutPromise: Promise<void>;
    act(() => {
      checkoutPromise = result.current.handleCheckout();
    });

    act(() => {
      result.current.handleDismissSheet();
    });

    await act(async () => {
      resolveCheckout!({ success: true, role: 'TERMINAL', message: 'Done.' });
      await checkoutPromise!;
    });

    expect(result.current.latestResult).toBeNull();
  });
});
