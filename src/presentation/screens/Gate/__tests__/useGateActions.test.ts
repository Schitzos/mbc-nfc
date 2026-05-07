import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGateActions } from '../useGateActions';
import { useAppStore } from '@presentation/stores/app-store';
import type { GateServices } from '@presentation/context/service-context';

const mockServices: GateServices = {
  checkNfcAvailabilityUseCase: {
    execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
  } as never,
  checkInActivityUseCase: {
    execute: jest.fn().mockResolvedValue({
      success: true,
      role: 'GATE',
      message: 'Checked in.',
      card: { balance: 50000 },
    }),
  } as never,
};

describe('useGateActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('initializes and checks NFC availability', async () => {
    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );
    expect(result.current.busy).toBe(false);
    expect(result.current.latestResult).toBeNull();
  });

  it('handleCheckIn sets success state', async () => {
    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckIn();
    });

    expect(mockServices.checkInActivityUseCase.execute).toHaveBeenCalled();
    expect(result.current.latestResult?.success).toBe(true);
    expect(result.current.nfcSheet.phase).toBe('success');
  });

  it('handleCheckIn shows error on failure', async () => {
    (
      mockServices.checkInActivityUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'GATE',
      message: 'Already checked in.',
    });

    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckIn();
    });

    expect(result.current.nfcSheet.phase).toBe('error');
    expect(result.current.latestResult?.success).toBe(false);
  });

  it('handleCheckIn handles thrown error', async () => {
    (
      mockServices.checkInActivityUseCase.execute as jest.Mock
    ).mockRejectedValueOnce(new Error('Tag lost'));

    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckIn();
    });

    expect(result.current.nfcSheet.phase).toBe('error');
  });

  it('handleDismissSheet resets state', async () => {
    const { result } = renderHook(() => useGateActions(mockServices));
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

  it('does not update state after dismiss during check-in', async () => {
    let resolveCheckIn: (v: unknown) => void;
    (
      mockServices.checkInActivityUseCase.execute as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise(r => {
          resolveCheckIn = r;
        }),
    );

    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    let promise: Promise<void>;
    act(() => {
      promise = result.current.handleCheckIn();
    });

    act(() => {
      result.current.handleDismissSheet();
    });

    await act(async () => {
      resolveCheckIn!({ success: true, role: 'GATE', message: 'Done.' });
      await promise!;
    });

    expect(result.current.latestResult).toBeNull();
  });
});
