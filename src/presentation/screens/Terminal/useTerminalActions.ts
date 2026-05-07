import { useCallback, useEffect, useRef, useState } from 'react';
import type { RoleActionResultDto } from '../../../application/dto/role-action-result-dto';
import type { NfcActionState } from '../../components/NfcActionSheet';
import { useAppStore } from '../../stores/app-store';
import { UNKNOWN_ERROR_MESSAGE } from '../../../shared/constants';
import type { TerminalServices } from '../../context/service-context';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function formatTime(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = MONTHS[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mmm}-${yyyy} ${hh}:${mm}`;
}

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
      .catch(() => undefined);
  }, [appendNfcLog, services]);

  const handleDismissSheet = useCallback(() => {
    dismissedRef.current = true;
    setNfcSheet({ phase: 'idle' });
    setBusy(false);
  }, []);

  const handleCheckout = useCallback(async () => {
    dismissedRef.current = false;
    setBusy(true);
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to check out',
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
    latestResult.message.toLowerCase().includes('insufficient'),
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
