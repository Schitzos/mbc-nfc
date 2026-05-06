import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appContainer } from '../../../app/container';
import type { RootStackParamList } from '../../../app/navigation';
import type { CheckNfcAvailabilityResultDto } from '../../../application/dto/check-nfc-availability-result-dto';
import type { RoleActionResultDto } from '../../../application/dto/role-action-result-dto';
import type { StationLedgerSummaryDto } from '../../../application/dto/station-ledger-summary-dto';
import { SignalButton } from '../../components/SignalButton';
import { NfcLogPanel } from '../../components/NfcLogPanel';
import { NfcActionSheet } from '../../components/NfcActionSheet';
import type { NfcActionState } from '../../components/NfcActionSheet';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { useAppStore } from '../../stores/app-store';
import { StationHeader } from './fragments/StationHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'station'>;

const emptySummary: StationLedgerSummaryDto = {
  topUpTotal: 0,
  checkoutTotal: 0,
  registerCount: 0,
  topUpCount: 0,
  checkoutCount: 0,
  latestEntries: [],
};

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
function formatResultDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = MONTHS[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mmm}-${yyyy} ${hh}:${mm}`;
}

export function StationScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const appendNfcLog = useAppStore(state => state.appendNfcLog);
  const services = useMemo(() => appContainer.getStationServices(), []);
  const [nfcStatus, setNfcStatus] =
    useState<CheckNfcAvailabilityResultDto | null>(null);
  const [summary, setSummary] = useState<StationLedgerSummaryDto>(emptySummary);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [resultTime, setResultTime] = useState<Date | null>(null);
  const [topUpAmount, setTopUpAmount] = useState('50000');
  const [registerMode, setRegisterMode] = useState(true);
  const [busyAction, setBusyAction] = useState<'register' | 'topup' | null>(
    null,
  );
  const [ledgerExpanded, setLedgerExpanded] = useState(false);
  const [nfcSheet, setNfcSheet] = useState<NfcActionState>({ phase: 'idle' });

  const refreshSummary = useCallback(async () => {
    const nextSummary = await services.getStationLedgerSummaryUseCase.execute();
    setSummary(nextSummary);
  }, [services]);

  useEffect(() => {
    setSelectedRole('station');
  }, [setSelectedRole]);

  useEffect(() => {
    const loadInitialState = async () => {
      appendNfcLog('[NFC] Checking device NFC availability');
      const status = await services.checkNfcAvailabilityUseCase.execute();
      setNfcStatus(status);
      appendNfcLog(`[NFC] Availability result: ${status.status}`);
      await refreshSummary();
    };
    loadInitialState().catch(() => undefined);
  }, [appendNfcLog, refreshSummary, services]);

  const handleWipeAndRegister = async () => {
    setBusyAction('register');
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold the same card to wipe and re-register',
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
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
    } finally {
      setBusyAction(null);
    }
  };

  const handleRegister = async () => {
    setBusyAction('register');
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to register',
    });
    try {
      appendNfcLog('[NFC] Register flow started');
      const result = await services.registerMemberCardUseCase.execute();
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
            handleWipeAndRegister().catch(() => undefined);
          },
        });
        appendNfcLog('[NFC] Card already registered — awaiting user decision');
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
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Register error: ${msg}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleTopUp = async () => {
    setBusyAction('topup');
    setNfcSheet({ phase: 'scanning', message: 'Hold your NFC card to top up' });
    try {
      appendNfcLog('[NFC] Top-up flow started');
      const result = await services.topUpMemberCardUseCase.execute({
        amount: Number(topUpAmount),
      });
      setLatestResult(result);
      setResultTime(new Date());
      if (result.success) {
        setNfcSheet({
          phase: 'success',
          title: 'Top-Up Complete',
          message: result.message,
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
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Top-up error: ${msg}`);
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <BackgroundDecor variant="station" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="gap-4">
          <StationHeader
            modeLabel={
              registerMode ? 'Register member card' : 'Top up member card'
            }
            onBack={() => navigation.goBack()}
          />

          <View className="rounded-2xl bg-[#EAF4FF] p-4">
            <Text className="text-xs font-semibold uppercase text-[#0050AE]">
              Real NFC mode
            </Text>
            <Text className="mt-1 text-xs text-muted">
              {nfcStatus?.title ?? 'Checking device NFC'}
            </Text>
          </View>

          <View className="rounded-2xl bg-white p-4 shadow-sm">
            {!registerMode && (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-foreground">
                  Top-up amount
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[10000, 20000, 50000, 100000].map(amount => (
                    <Pressable
                      key={amount}
                      onPress={() => setTopUpAmount(String(amount))}
                      className={`rounded-xl border px-4 py-3 ${
                        topUpAmount === String(amount)
                          ? 'border-[#0050AE] bg-[#EAF4FF]'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          topUpAmount === String(amount)
                            ? 'text-[#0050AE]'
                            : 'text-foreground'
                        }`}
                      >
                        Rp {amount.toLocaleString('id-ID')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <SignalButton
              label={
                registerMode
                  ? busyAction === 'register'
                    ? 'Registering...'
                    : 'Tap NFC Card to Register'
                  : busyAction === 'topup'
                    ? 'Processing...'
                    : 'Tap NFC Card to Top Up'
              }
              disabled={busyAction !== null}
              onPress={() => {
                if (registerMode) {
                  handleRegister().catch(() => undefined);
                } else {
                  handleTopUp().catch(() => undefined);
                }
              }}
            />

            <View className="mt-3">
              <SignalButton
                label={registerMode ? 'Switch to Top Up' : 'Switch to Register'}
                variant="secondary"
                onPress={() => setRegisterMode(prev => !prev)}
              />
            </View>
          </View>

          {latestResult && (
            <View
              className={`rounded-2xl p-4 ${
                latestResult.success
                  ? 'border border-green-400 bg-[#EAFBF2]'
                  : 'border border-red-400 bg-[#FFECEC]'
              }`}
            >
              <Text className="text-xl font-bold text-foreground">
                Latest result
              </Text>
              <Text
                className={`mt-2 text-sm font-semibold ${
                  latestResult.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {latestResult.success ? 'Success' : 'Unable to complete'}
              </Text>
              <Text className="mt-1 text-sm text-muted">
                {latestResult.message}
              </Text>
              <Text className="mt-1 text-xs text-muted">
                {resultTime ? formatResultDate(resultTime) : ''}
              </Text>
            </View>
          )}

          <View className="rounded-2xl bg-white p-4 shadow-sm">
            <Pressable
              onPress={() => setLedgerExpanded(prev => !prev)}
              className="flex-row items-center justify-between"
            >
              <Text className="text-xl font-bold text-foreground">
                Local Station ledger
              </Text>
              <Text className="text-sm text-muted">
                {ledgerExpanded ? '▲' : '▼'}
              </Text>
            </Pressable>
            {ledgerExpanded && (
              <View className="mt-3">
                <Text className="text-sm text-muted">
                  Top-up: Rp {summary.topUpTotal.toLocaleString('id-ID')} •
                  Checkout: Rp {summary.checkoutTotal.toLocaleString('id-ID')}
                </Text>
                <Text className="mt-1 text-sm text-muted">
                  Registers: {summary.registerCount} • Top-ups:{' '}
                  {summary.topUpCount} • Checkouts: {summary.checkoutCount}
                </Text>
                <View className="mt-2">
                  <SignalButton
                    label="Refresh"
                    variant="secondary"
                    size="small"
                    onPress={() => {
                      refreshSummary().catch(() => undefined);
                    }}
                  />
                </View>
              </View>
            )}
          </View>

          <NfcLogPanel />
        </View>

        <NfcActionSheet
          state={nfcSheet}
          onDismiss={() => setNfcSheet({ phase: 'idle' })}
        />
      </ScrollView>
    </View>
  );
}
