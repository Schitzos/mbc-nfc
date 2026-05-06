import { useCallback, useEffect, useState } from 'react';
import type { RoleActionResultDto } from '../../../application/dto/role-action-result-dto';
import type { NfcActionState } from '../../components/NfcActionSheet';
import { useAppStore } from '../../stores/app-store';
import { UNKNOWN_ERROR_MESSAGE } from '../../../shared/constants';
import type { ScoutServices } from '../../context/service-context';

export function useScoutActions(services: ScoutServices) {
  const appendNfcLog = useAppStore(state => state.appendNfcLog);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [nfcSheet, setNfcSheet] = useState<NfcActionState>({ phase: 'idle' });

  useEffect(() => {
    services.checkNfcAvailabilityUseCase
      .execute()
      .then(status =>
        appendNfcLog(`[NFC] Availability result: ${status.status}`),
      )
      .catch(() => undefined);
  }, [appendNfcLog, services]);

  const handleInspect = useCallback(async () => {
    setBusy(true);
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to inspect',
    });
    try {
      appendNfcLog('[NFC] Inspect flow started');
      const result = await services.inspectMemberCardUseCase.execute();
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
      const msg =
        error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Inspect error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }, [appendNfcLog, services]);

  return { latestResult, busy, nfcSheet, setNfcSheet, handleInspect };
}
