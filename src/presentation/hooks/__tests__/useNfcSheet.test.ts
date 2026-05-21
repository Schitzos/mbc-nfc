import { renderHook, act } from '@testing-library/react-native';
import { useNfcSheet } from '../useNfcSheet';

describe('useNfcSheet', () => {
  it('resetDismissed resets the dismissed ref', () => {
    const cancelNfc = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useNfcSheet(cancelNfc));

    act(() => {
      result.current.handleDismissSheet();
    });
    expect(result.current.dismissedRef.current).toBe(true);
    expect(result.current.nfcSheet.phase).toBe('idle');

    act(() => {
      result.current.resetDismissed();
    });
    expect(result.current.dismissedRef.current).toBe(false);
  });

  it('setNfcSheet updates the sheet state', () => {
    const cancelNfc = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useNfcSheet(cancelNfc));

    act(() => {
      result.current.setNfcSheet({ phase: 'scanning', message: 'Hold card' });
    });
    expect(result.current.nfcSheet.phase).toBe('scanning');
  });

  it('swallows cancelNfc rejection in handleDismissSheet', async () => {
    const cancelNfc = jest.fn().mockRejectedValue(new Error('cancel failed'));
    const { result } = renderHook(() => useNfcSheet(cancelNfc));

    act(() => {
      result.current.handleDismissSheet();
    });

    // Wait for the rejected promise to be caught
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });

    expect(cancelNfc).toHaveBeenCalled();
    expect(result.current.nfcSheet.phase).toBe('idle');
  });
});
