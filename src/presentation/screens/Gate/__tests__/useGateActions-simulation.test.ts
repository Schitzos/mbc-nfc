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
  cancelNfc: jest.fn().mockResolvedValue(undefined),
};

describe('useGateActions simulation mode', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('initializes with simulation disabled', async () => {
    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    expect(result.current.simulationEnabled).toBe(false);
    expect(result.current.simulatedDate).toBeInstanceOf(Date);
  });

  it('can toggle simulation mode on and off', async () => {
    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    act(() => {
      result.current.setSimulationEnabled(true);
    });
    expect(result.current.simulationEnabled).toBe(true);

    act(() => {
      result.current.setSimulationEnabled(false);
    });
    expect(result.current.simulationEnabled).toBe(false);
  });

  it('passes checkedInAt and isSimulation when simulation is enabled', async () => {
    const simDate = new Date('2026-05-01T08:00:00.000Z');
    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    act(() => {
      result.current.setSimulationEnabled(true);
      result.current.setSimulatedDate(simDate);
    });

    await act(async () => {
      await result.current.handleCheckIn();
    });

    expect(mockServices.checkInActivityUseCase.execute).toHaveBeenCalledWith({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
      checkedInAt: simDate.toISOString(),
      isSimulation: true,
    });
  });

  it('does not pass simulation params when simulation is disabled', async () => {
    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckIn();
    });

    expect(mockServices.checkInActivityUseCase.execute).toHaveBeenCalledWith({
      activityId: 'parking-main-gate',
      activityType: 'PARKING',
    });
  });

  it('shows (Simulation) in success title when simulation is enabled', async () => {
    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    act(() => {
      result.current.setSimulationEnabled(true);
    });

    await act(async () => {
      await result.current.handleCheckIn();
    });

    expect(result.current.nfcSheet.phase).toBe('success');
    expect((result.current.nfcSheet as any).title).toBe(
      'Checked In (Simulation)',
    );
  });

  it('does not show (Simulation) in success title when simulation is disabled', async () => {
    const { result } = renderHook(() => useGateActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckIn();
    });

    expect(result.current.nfcSheet.phase).toBe('success');
    expect((result.current.nfcSheet as any).title).toBe('Checked In');
  });
});
