import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import type { NfcActionState } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { UNKNOWN_ERROR_MESSAGE } from '@shared/constants';
import type { TerminalServices } from '@presentation/context/service-context';

function formatTime(d: Date): string {
  return dayjs(d).format('DD-MMM-YYYY HH:mm');
}

const noop = () => {};

export function useTerminalActions(services: TerminalServices) {
  const appendNfcLog = useAppStore(state => state.appendNfcLog);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [nfcSheet, setNfcSheet] = useState<NfcActionState>({ phase: 'idle' });
  const [checkoutTime, setCheckoutTime] = useState('');
  const dismissedRef = useRef(false);

  useEffect(() => {
    services.checkNfcAvailabilityUseCase
      .execute()
      .then(status =>
        appendNfcLog(`[NFC] Availability result: ${status.status}`),
      )
      .catch(noop);
  }, [appendNfcLog, services]);

  const handleDismissSheet = useCallback(() => {
    dismissedRef.current = true;
    setNfcSheet({ phase: 'idle' });
    setBusy(false);
    services.cancelNfc().catch(noop);
  }, [services]);

  const handleCheckout = useCallback(async () => {
    dismissedRef.current = false;
    setBusy(true);
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to check out',
      color: '#7C3AED',
    });
    try {
      appendNfcLog('[NFC] Checkout flow started');
      const result = await services.checkOutActivityUseCase.execute({});
      if (dismissedRef.current) {
        return;
      }
      setLatestResult(result);
      if (result.success) {
        setCheckoutTime(formatTime(new Date()));
        setNfcSheet({
          phase: 'success',
          title: 'Checkout Complete',
          message: result.message,
        });
        appendNfcLog('[NFC] Checkout succeeded');
      } else {
        setNfcSheet({
          phase: 'error',
          title: 'Checkout Failed',
          message: result.message,
        });
        appendNfcLog(`[NFC] Checkout failed: ${result.message}`);
      }
    } catch (error) {
      if (dismissedRef.current) {
        return;
      }
      const msg =
        error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Checkout error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }, [appendNfcLog, services]);

  const insufficient = Boolean(
    latestResult &&
    !latestResult.success &&
    latestResult.errorCode === 'INSUFFICIENT_BALANCE',
  );
  const genericFailure = Boolean(
    latestResult && !latestResult.success && !insufficient,
  );
  const success = Boolean(latestResult?.success);

  return {
    latestResult,
    busy,
    nfcSheet,
    setNfcSheet,
    checkoutTime,
    handleCheckout,
    handleDismissSheet,
    insufficient,
    genericFailure,
    success,
  };
}
