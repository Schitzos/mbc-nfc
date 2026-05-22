import { useCallback, useRef, useState } from 'react';
import type { NfcActionState } from '@presentation/components/NfcActionSheet';

export function useNfcSheet(cancelNfc: () => Promise<void>) {
  const [nfcSheet, setNfcSheet] = useState<NfcActionState>({ phase: 'idle' });
  const dismissedRef = useRef(false);

  const handleDismissSheet = useCallback(() => {
    dismissedRef.current = true;
    setNfcSheet({ phase: 'idle' });
    cancelNfc().catch(() => {});
  }, [cancelNfc]);

  const resetDismissed = useCallback(() => {
    dismissedRef.current = false;
  }, []);

  return {
    nfcSheet,
    setNfcSheet,
    dismissedRef,
    handleDismissSheet,
    resetDismissed,
  };
}
