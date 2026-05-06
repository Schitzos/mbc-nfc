import { useCallback, useEffect, useState } from 'react';
import type { RoleActionResultDto } from '../../../application/dto/role-action-result-dto';
import type { NfcActionState } from '../../components/NfcActionSheet';
import { useAppStore } from '../../stores/app-store';
import { UNKNOWN_ERROR_MESSAGE } from '../../../shared/constants';
import type { GateServices } from '../../context/service-context';

export function useGateActions(services: GateServices) {
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

  const handleCheckIn = useCallback(async () => {
    setBusy(true);
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to check in',
    });
    try {
      appendNfcLog('[NFC] Check-in flow started');
      const result = await services.checkInActivityUseCase.execute({
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
      });
      setLatestResult(result);
      if (result.success) {
        setNfcSheet({
          phase: 'success',
          title: 'Checked In',
          message: result.message,
        });
        appendNfcLog('[NFC] Check-in succeeded');
      } else {
        setNfcSheet({
          phase: 'error',
          title: 'Check-In Failed',
          message: result.message,
        });
        appendNfcLog(`[NFC] Check-in failed: ${result.message}`);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Check-in error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }, [appendNfcLog, services]);

  return { latestResult, busy, nfcSheet, setNfcSheet, handleCheckIn };
}
