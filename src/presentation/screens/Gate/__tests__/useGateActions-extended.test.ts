import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useGateActions } from '../useGateActions';
import { useAppStore } from '../../../stores/app-store';
import type { GateServices } from '../../../context/service-context';

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

describe('useGateActions – extended branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('handles NFC availability check failure silently', async () => {
    (
      mockServices.checkNfcAvailabilityUseCase.execute as jest.Mock
    ).mockRejectedValueOnce(new Error('NFC unavailable'));

    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );
    expect(result.current.busy).toBe(false);
  });

  it('handles non-Error thrown in handleCheckIn', async () => {
    (
      mockServices.checkInActivityUseCase.execute as jest.Mock
    ).mockRejectedValueOnce('string error');

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

  it('does not update error state after dismiss when check-in throws', async () => {
    let rejectCheckIn: (e: unknown) => void;
    (
      mockServices.checkInActivityUseCase.execute as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise((_r, rej) => {
          rejectCheckIn = rej;
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
      rejectCheckIn!(new Error('Tag lost'));
      await promise!;
    });

    // After dismiss, error should not update the sheet
    expect(result.current.nfcSheet.phase).toBe('idle');
  });
});
