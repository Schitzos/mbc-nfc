import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTerminalActions } from '../../Terminal/useTerminalActions';
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
      isSimulation: true,
    }),
  } as never,
  cancelNfc: jest.fn().mockResolvedValue(undefined),
};

describe('useTerminalActions – simulation branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ nfcLogEnabled: false, nfcLogs: [] });
  });

  it('shows simulation checkout title and message when isSimulation is true', async () => {
    const { result } = renderHook(() => useTerminalActions(mockServices));
    await waitFor(() =>
      expect(
        mockServices.checkNfcAvailabilityUseCase.execute,
      ).toHaveBeenCalled(),
    );

    await act(async () => {
      await result.current.handleCheckout();
    });

    expect(result.current.nfcSheet.phase).toBe('success');
    const sheet = result.current.nfcSheet as {
      title?: string;
      message?: string;
    };
    expect(sheet.title).toBe('⚠️ Simulation Checkout');
    expect(sheet.message).toContain('Balance NOT deducted');
  });
});
