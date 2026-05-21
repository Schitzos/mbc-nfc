import { useCallback, useEffect, useRef, useState } from 'react';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import type { NfcActionState } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { UNKNOWN_ERROR_MESSAGE } from '@shared/constants';
import type { GateServices } from '@presentation/context/service-context';

const noop = () => {};

export function useGateActions(services: GateServices) {
  const appendNfcLog = useAppStore(state => state.appendNfcLog);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [nfcSheet, setNfcSheet] = useState<NfcActionState>({ phase: 'idle' });
  const dismissedRef = useRef(false);
  const [simulationEnabled, setSimulationEnabled] = useState(false);
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date());

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

  const handleCheckIn = useCallback(async () => {
    dismissedRef.current = false;
    setBusy(true);
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to check in',
      color: '#FF0025',
    });
    try {
      appendNfcLog('[NFC] Check-in flow started');
      const result = await services.checkInActivityUseCase.execute({
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
        ...(simulationEnabled
          ? { checkedInAt: simulatedDate.toISOString(), isSimulation: true }
          : {}),
      });
      if (dismissedRef.current) {
        return;
      }
      setLatestResult(result);
      if (result.success) {
        const simLabel = simulationEnabled ? ' (Simulation)' : '';
        setNfcSheet({
          phase: 'success',
          title: `Checked In${simLabel}`,
          message: `${result.message}\nBalance: Rp ${result.card?.balance?.toLocaleString('id-ID') ?? '0'}`,
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
      if (dismissedRef.current) {
        return;
      }
      const msg =
        error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Check-in error: ${msg}`);
    } finally {
      setBusy(false);
    }
  }, [appendNfcLog, services, simulationEnabled, simulatedDate]);

  return {
    latestResult,
    busy,
    nfcSheet,
    setNfcSheet,
    handleCheckIn,
    handleDismissSheet,
    simulationEnabled,
    setSimulationEnabled,
    simulatedDate,
    setSimulatedDate,
  };
}
