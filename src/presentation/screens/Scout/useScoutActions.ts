import { useCallback, useEffect, useRef, useState } from 'react';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import type { NfcActionState } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { UNKNOWN_ERROR_MESSAGE } from '@shared/constants';
import type { ScoutServices } from '@presentation/context/service-context';

const noop = () => {};

export function useScoutActions(services: ScoutServices) {
  const appendNfcLog = useAppStore(state => state.appendNfcLog);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [nfcSheet, setNfcSheet] = useState<NfcActionState>({ phase: 'idle' });
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

  const handleInspect = useCallback(async () => {
    dismissedRef.current = false;
    setBusy(true);
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to inspect',
      color: '#FF0025',
    });
    try {
      appendNfcLog('[NFC] Inspect flow started');
      const result = await services.inspectMemberCardUseCase.execute();
      if (dismissedRef.current) {
        return;
      }
      setLatestResult(result);
      if (result.success) {
        setNfcSheet({
          phase: 'success',
          title: 'Card Read',
          message: result.message,
        });
        appendNfcLog('[NFC] Inspect succeeded');
      } else {
        setNfcSheet({
          phase: 'error',
          title: 'Inspect Failed',
          message: result.message,
        });
        appendNfcLog(`[NFC] Inspect failed: ${result.message}`);
      }
    } catch (error) {
      if (dismissedRef.current) {
        return;
      }
      const msg =
        error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Inspect error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }, [appendNfcLog, services]);

  return {
    latestResult,
    busy,
    nfcSheet,
    setNfcSheet,
    handleInspect,
    handleDismissSheet,
  };
}
