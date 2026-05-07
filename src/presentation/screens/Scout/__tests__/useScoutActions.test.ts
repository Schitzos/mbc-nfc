import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useScoutActions } from '../useScoutActions';
import { useAppStore } from '../../../stores/app-store';
import type { ScoutServices } from '../../../context/service-context';

const mockServices: ScoutServices = {
  checkNfcAvailabilityUseCase: {
    execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
  } as never,
  inspectMemberCardUseCase: {
    execute: jest.fn().mockResolvedValue({
      success: true,
      role: 'SCOUT',
      message: 'Inspected.',
      card: {
        balance: 46000,
        visitStatus: 'NOT_CHECKED_IN',
        transactionLogs: [],
      },
    }),
  } as never,
};

describe('useScoutActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('initializes and checks NFC availability', async () => {
    const { result } = renderHook(() => useScoutActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );
    expect(result.current.busy).toBe(false);
    expect(result.current.latestResult).toBeNull();
  });

  it('handleInspect sets success state', async () => {
    const { result } = renderHook(() => useScoutActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleInspect();
    });

    expect(mockServices.inspectMemberCardUseCase.execute).toHaveBeenCalled();
    expect(result.current.latestResult?.success).toBe(true);
    expect(result.current.nfcSheet.phase).toBe('success');
  });

  it('handleInspect shows error on failure', async () => {
    (
      mockServices.inspectMemberCardUseCase.execute as jest.Mock
    ).mockResolvedValueOnce({
      success: false,
      role: 'SCOUT',
      message: 'Card tampered.',
    });

    const { result } = renderHook(() => useScoutActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleInspect();
    });

    expect(result.current.nfcSheet.phase).toBe('error');
    expect(result.current.latestResult?.success).toBe(false);
  });

  it('handleInspect handles thrown error', async () => {
    (
      mockServices.inspectMemberCardUseCase.execute as jest.Mock
    ).mockRejectedValueOnce(new Error('Scan cancelled'));

    const { result } = renderHook(() => useScoutActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleInspect();
    });

    expect(result.current.nfcSheet.phase).toBe('error');
  });

  it('handleDismissSheet resets state', async () => {
    const { result } = renderHook(() => useScoutActions(mockServices));
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

  it('does not update state after dismiss during inspect', async () => {
    let resolveInspect: (v: unknown) => void;
    (
      mockServices.inspectMemberCardUseCase.execute as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise(r => {
          resolveInspect = r;
        }),
    );

    const { result } = renderHook(() => useScoutActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    let promise: Promise<void>;
    act(() => {
      promise = result.current.handleInspect();
    });

    act(() => {
      result.current.handleDismissSheet();
    });

    await act(async () => {
      resolveInspect!({ success: true, role: 'SCOUT', message: 'Done.' });
      await promise!;
    });

    expect(result.current.latestResult).toBeNull();
  });
});
