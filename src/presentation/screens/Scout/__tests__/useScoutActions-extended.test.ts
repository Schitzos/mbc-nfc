import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useScoutActions } from '../useScoutActions';
import { useAppStore } from '@presentation/stores/app-store';
import type { ScoutServices } from '@presentation/context/service-context';

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
  cancelNfc: jest.fn().mockResolvedValue(undefined),
};

describe('useScoutActions – extended branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('handles NFC availability check failure silently', async () => {
    (
      mockServices.checkNfcAvailabilityUseCase.execute as jest.Mock
    ).mockRejectedValueOnce(new Error('NFC unavailable'));

    const { result } = renderHook(() => useScoutActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );
    expect(result.current.busy).toBe(false);
  });

  it('handles non-Error thrown in handleInspect', async () => {
    (
      mockServices.inspectMemberCardUseCase.execute as jest.Mock
    ).mockRejectedValueOnce('string error');

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

  it('does not update error state after dismiss when inspect throws', async () => {
    let rejectInspect: (e: unknown) => void;
    (
      mockServices.inspectMemberCardUseCase.execute as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise((_r, rej) => {
          rejectInspect = rej;
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
      rejectInspect!(new Error('Tag lost'));
      await promise!;
    });

    expect(result.current.nfcSheet.phase).toBe('idle');
  });
});
