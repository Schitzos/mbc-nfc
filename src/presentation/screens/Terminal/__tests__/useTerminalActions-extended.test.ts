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
  cancelNfc: jest.fn().mockResolvedValue(undefined),
};

describe('useTerminalActions – extended branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('handles NFC availability check failure silently', async () => {
    (
      mockServices.checkNfcAvailabilityUseCase.execute as jest.Mock
    ).mockRejectedValueOnce(new Error('NFC unavailable'));

    const { result } = renderHook(() => useTerminalActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );
    expect(result.current.busy).toBe(false);
  });

  it('handles non-Error thrown in handleCheckout', async () => {
    (
      mockServices.checkOutActivityUseCase.execute as jest.Mock
    ).mockRejectedValueOnce('string error');

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

  it('does not update error state after dismiss when checkout throws', async () => {
    let rejectCheckout: (e: unknown) => void;
    (
      mockServices.checkOutActivityUseCase.execute as jest.Mock
    ).mockImplementationOnce(
      () =>
        new Promise((_r, rej) => {
          rejectCheckout = rej;
        }),
    );

    const { result } = renderHook(() => useTerminalActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    let promise: Promise<void>;
    act(() => {
      promise = result.current.handleCheckout();
    });

    act(() => {
      result.current.handleDismissSheet();
    });

    await act(async () => {
      rejectCheckout!(new Error('Tag lost'));
      await promise!;
    });

    expect(result.current.nfcSheet.phase).toBe('idle');
  });
});

describe('useTerminalActions – resetResult and simulation', () => {
  it('resetResult clears latestResult to null', async () => {
    const {
      renderHook,
      act,
      waitFor,
    } = require('@testing-library/react-native');
    const { useTerminalActions } = require('../useTerminalActions');
    const { useAppStore } = require('@presentation/stores/app-store');
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });

    const services = {
      checkNfcAvailabilityUseCase: {
        execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
      },
      checkOutActivityUseCase: {
        execute: jest.fn().mockResolvedValue({
          success: true,
          role: 'TERMINAL',
          message: 'Out.',
          card: { balance: 46000 },
        }),
      },
      cancelNfc: jest.fn().mockResolvedValue(undefined),
    };

    const { result } = renderHook(() => useTerminalActions(services));
    await waitFor(() =>
      expect(services.checkNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckout();
    });
    expect(result.current.latestResult).not.toBeNull();

    act(() => {
      result.current.resetResult();
    });
    expect(result.current.latestResult).toBeNull();
  });

  it('sets isSimulation success title when result has isSimulation', async () => {
    const {
      renderHook,
      act,
      waitFor,
    } = require('@testing-library/react-native');
    const { useTerminalActions } = require('../useTerminalActions');
    const { useAppStore } = require('@presentation/stores/app-store');
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });

    const services = {
      checkNfcAvailabilityUseCase: {
        execute: jest.fn().mockResolvedValue({ status: 'SUPPORTED' }),
      },
      checkOutActivityUseCase: {
        execute: jest.fn().mockResolvedValue({
          success: true,
          role: 'TERMINAL',
          message: 'Simulated checkout.',
          isSimulation: true,
          card: { balance: 50000 },
        }),
      },
      cancelNfc: jest.fn().mockResolvedValue(undefined),
    };

    const { result } = renderHook(() => useTerminalActions(services));
    await waitFor(() =>
      expect(services.checkNfcAvailabilityUseCase.execute).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(result.current.nfcSheet.phase).toBe('success');
    expect((result.current.nfcSheet as any).title).toContain('Simulation');
  });
});
