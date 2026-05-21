import { useCallback, useEffect, useState } from 'react';
import type { CheckNfcAvailabilityResultDto } from '@application/dto/check-nfc-availability-result-dto';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import type { StationLedgerSummaryDto } from '@application/dto/station-ledger-summary-dto';
import { useAppStore } from '@presentation/stores/app-store';
import { UNKNOWN_ERROR_MESSAGE } from '@shared/constants';
import type { StationServices } from '@presentation/context/service-context';
import { useNfcSheet } from '@presentation/hooks/useNfcSheet';
import { signalColorTokens } from '@presentation/theme/colors';

const noop = () => {};

const emptySummary: StationLedgerSummaryDto = {
  topUpTotal: 0,
  checkoutTotal: 0,
  registerCount: 0,
  topUpCount: 0,
  checkoutCount: 0,
  latestEntries: [],
};

export function useStationActions(services: StationServices) {
  const appendNfcLog = useAppStore(state => state.appendNfcLog);
  const [nfcStatus, setNfcStatus] =
    useState<CheckNfcAvailabilityResultDto | null>(null);
  const [summary, setSummary] = useState<StationLedgerSummaryDto>(emptySummary);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [resultTime, setResultTime] = useState<Date | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('50000');
  const [registerMode, setRegisterMode] = useState(true);

  const handleSetRegisterMode = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setRegisterMode(value);
      setLatestResult(null);
      setResultTime(null);
    },
    [],
  );
  const [busyAction, setBusyAction] = useState<'register' | 'topup' | null>(
    null,
  );

  const {
    nfcSheet,
    setNfcSheet,
    dismissedRef,
    handleDismissSheet: rawDismiss,
    resetDismissed,
  } = useNfcSheet(services.cancelNfc);

  const handleDismissSheet = useCallback(() => {
    rawDismiss();
    setBusyAction(null);
  }, [rawDismiss]);

  const refreshSummary = useCallback(async () => {
    const next = await services.getStationLedgerSummaryUseCase.execute();
    setSummary(next);
  }, [services]);

  useEffect(() => {
    const load = async () => {
      appendNfcLog('[NFC] Checking device NFC availability');
      const status = await services.checkNfcAvailabilityUseCase.execute();
      setNfcStatus(status);
      appendNfcLog(`[NFC] Availability result: ${status.status}`);
      await refreshSummary();
    };
    load().catch(noop);
  }, [appendNfcLog, refreshSummary, services]);

  const handleWipeAndRegister = useCallback(async () => {
    setBusyAction('register');
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold the same card to wipe and re-register',
      color: signalColorTokens.brand.primary,
    });
    try {
      appendNfcLog('[NFC] Wipe & re-register flow started');
      const result =
        await services.registerMemberCardUseCase.executeWithReset();
      setLatestResult(result);
      setResultTime(new Date());
      if (result.success) {
        setNfcSheet({
          phase: 'success',
          title: 'Card Re-registered',
          message: result.message,
        });
        appendNfcLog('[NFC] Wipe & re-register succeeded');
      } else {
        setNfcSheet({
          phase: 'error',
          title: 'Failed',
          message: result.message,
        });
      }
      await refreshSummary();
    } catch (error) {
      if (dismissedRef.current) {
        return;
      }
      const msg =
        error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
    } finally {
      setBusyAction(null);
    }
  }, [appendNfcLog, dismissedRef, refreshSummary, services, setNfcSheet]);

  const handleRegister = useCallback(async () => {
    resetDismissed();
    setBusyAction('register');
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to register',
      color: signalColorTokens.brand.primary,
    });
    try {
      appendNfcLog('[NFC] Register flow started');
      const result = await services.registerMemberCardUseCase.execute();
      if (dismissedRef.current) {
        return;
      }
      setLatestResult(result);
      setResultTime(new Date());
      if (result.success) {
        setNfcSheet({
          phase: 'success',
          title: 'Card Registered',
          message: result.message,
        });
        appendNfcLog('[NFC] Register succeeded');
      } else if (result.message.toLowerCase().includes('already registered')) {
        setNfcSheet({
          phase: 'confirm',
          title: 'Card Already Registered',
          message:
            'This card has existing data. Wipe and register as a new member?',
          confirmLabel: 'Wipe & Re-register',
          onConfirm: () => {
            handleWipeAndRegister().catch(noop);
          },
        });
        appendNfcLog('[NFC] Card already registered — awaiting user decision');
        setBusyAction(null);
        return;
      } else if (result.message.toLowerCase().includes('existing data')) {
        setNfcSheet({
          phase: 'confirm',
          title: 'Card Has Existing Data',
          message:
            'This card contains data from another application. Wipe and register as a new member?',
          confirmLabel: 'Wipe & Re-register',
          onConfirm: () => {
            handleWipeAndRegister().catch(noop);
          },
        });
        appendNfcLog('[NFC] Card has foreign data — awaiting user decision');
        setBusyAction(null);
        return;
      } else {
        setNfcSheet({
          phase: 'error',
          title: 'Registration Failed',
          message: result.message,
        });
        appendNfcLog(`[NFC] Register failed: ${result.message}`);
      }
      await refreshSummary();
    } catch (error) {
      if (dismissedRef.current) {
        return;
      }
      const msg =
        error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Register error: ${msg}`);
    } finally {
      setBusyAction(null);
    }
  }, [
    appendNfcLog,
    dismissedRef,
    handleWipeAndRegister,
    refreshSummary,
    resetDismissed,
    services,
    setNfcSheet,
  ]);

  const handleTopUp = useCallback(async () => {
    resetDismissed();
    setBusyAction('topup');
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to top up',
      color: signalColorTokens.brand.primary,
    });
    try {
      appendNfcLog('[NFC] Top-up flow started');
      const result = await services.topUpMemberCardUseCase.execute({
        amount: Number(topUpAmount),
      });
      if (dismissedRef.current) {
        return;
      }
      setLatestResult(result);
      setResultTime(new Date());
      if (result.success) {
        setNfcSheet({
          phase: 'success',
          title: 'Top-Up Complete',
          message: `${result.message}\nBalance: Rp ${result.card?.balance?.toLocaleString('id-ID') ?? '0'}`,
        });
        appendNfcLog('[NFC] Top-up succeeded');
      } else {
        setNfcSheet({
          phase: 'error',
          title: 'Top-Up Failed',
          message: result.message,
        });
        appendNfcLog(`[NFC] Top-up failed: ${result.message}`);
      }
      await refreshSummary();
    } catch (error) {
      if (dismissedRef.current) {
        return;
      }
      const msg =
        error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Top-up error: ${msg}`);
    } finally {
      setBusyAction(null);
    }
  }, [
    appendNfcLog,
    dismissedRef,
    refreshSummary,
    resetDismissed,
    services,
    setNfcSheet,
    topUpAmount,
  ]);

  return {
    nfcStatus,
    summary,
    latestResult,
    resultTime,
    topUpAmount,
    setTopUpAmount,
    registerMode,
    setRegisterMode: handleSetRegisterMode,
    busyAction,
    nfcSheet,
    setNfcSheet,
    refreshSummary,
    handleRegister,
    handleTopUp,
    handleDismissSheet,
  };
}
