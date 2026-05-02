import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appContainer } from '../../../app/container';
import type { RootStackParamList } from '../../../app/navigation';
import type { CheckNfcAvailabilityResultDto } from '../../../application/dto/check-nfc-availability-result-dto';
import type { RoleActionResultDto } from '../../../application/dto/role-action-result-dto';
import type { StationLedgerSummaryDto } from '../../../application/dto/station-ledger-summary-dto';
import type { MockCardScenario } from '../../../infrastructure/nfc/mock-mbc-card.repository';
import { SignalButton } from '../../components/SignalButton';
import { SignalTextField } from '../../components/SignalTextField';
import { useAppStore } from '../../stores/app-store';
import { StationHeader } from './fragments/StationHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'station'>;

const mockScenarios: Array<{ key: MockCardScenario; label: string }> = [
  { key: 'normal', label: 'Normal card' },
  { key: 'low-balance', label: 'Low balance' },
  { key: 'checked-in', label: 'Checked in' },
  { key: 'unregistered', label: 'Unregistered' },
  { key: 'tampered', label: 'Tampered' },
];

const emptySummary: StationLedgerSummaryDto = {
  topUpTotal: 0,
  checkoutTotal: 0,
  registerCount: 0,
  topUpCount: 0,
  checkoutCount: 0,
  latestEntries: [],
};

export function StationScreen({ navigation }: Props): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useMemo(() => appContainer.getStationServices(), []);
  const [nfcStatus, setNfcStatus] =
    useState<CheckNfcAvailabilityResultDto | null>(null);
  const [summary, setSummary] = useState<StationLedgerSummaryDto>(emptySummary);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [selectedScenario, setSelectedScenario] = useState<MockCardScenario>(
    services.mockRepository.getScenario(),
  );
  const [topUpAmount, setTopUpAmount] = useState('50000');
  const [registerMode, setRegisterMode] = useState(true);
  const [busyAction, setBusyAction] = useState<'register' | 'topup' | null>(
    null,
  );

  const refreshSummary = useCallback(async () => {
    const nextSummary = await services.getStationLedgerSummaryUseCase.execute();
    setSummary(nextSummary);
  }, [services]);

  useEffect(() => {
    setSelectedRole('station');
  }, [setSelectedRole]);

  useEffect(() => {
    services.mockRepository.setScenario(selectedScenario);
  }, [selectedScenario, services]);

  useEffect(() => {
    const loadInitialState = async () => {
      setNfcStatus(await services.checkNfcAvailabilityUseCase.execute());
      await refreshSummary();
    };
    loadInitialState().catch(() => undefined);
  }, [refreshSummary, services]);

  const handleRegister = async () => {
    setBusyAction('register');
    try {
      const result = await services.registerMemberCardUseCase.execute();
      setLatestResult(result);
      await refreshSummary();
    } finally {
      setBusyAction(null);
    }
  };

  const handleTopUp = async () => {
    setBusyAction('topup');
    try {
      const result = await services.topUpMemberCardUseCase.execute({
        amount: Number(topUpAmount),
      });
      setLatestResult(result);
      await refreshSummary();
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 py-6">
      <View className="gap-4">
        <StationHeader
          modeLabel={
            registerMode ? 'Register member card' : 'Top up member card'
          }
          onBack={() => navigation.goBack()}
        />

        <View className="rounded-2xl bg-[#FFF6DA] p-4">
          <Text className="text-xs font-semibold uppercase text-amber-700">
            Mock scenario
          </Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {mockScenarios.map(option => {
              const active = option.key === selectedScenario;
              return (
                <Pressable
                  key={option.key}
                  className={`rounded-full border px-3 py-2 ${
                    active
                      ? 'border-[#2A8BFF] bg-[#EAF4FF]'
                      : 'border-amber-300 bg-white'
                  }`}
                  onPress={() => {
                    services.mockRepository.setScenario(option.key);
                    setSelectedScenario(option.key);
                    setLatestResult(null);
                  }}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      active ? 'text-[#0050AE]' : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="mt-3 text-xs text-muted">
            {nfcStatus?.title ?? 'Checking device NFC'}
          </Text>
        </View>

        <View className="rounded-2xl bg-white p-4">
          <Text className="text-2xl font-bold text-foreground">
            Member registration
          </Text>
          <View className="mt-3 gap-3">
            {registerMode ? (
              <SignalTextField
                label="Initial balance"
                value={`Rp ${Number(topUpAmount || 0).toLocaleString('id-ID')}`}
                editable={false}
                style={styles.fullWidth}
              />
            ) : (
              <SignalTextField
                label="Top-up amount"
                placeholder="50000"
                keyboardType="numeric"
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                helperText="Positive IDR amount only."
                style={styles.fullWidth}
              />
            )}
          </View>

          <View className="mt-4">
            {registerMode ? (
              <SignalButton
                label={
                  busyAction === 'register'
                    ? 'Registering...'
                    : 'Tap NFC Card to Register'
                }
                disabled={busyAction !== null}
                onPress={() => {
                  handleRegister().catch(() => undefined);
                }}
              />
            ) : (
              <SignalButton
                label={
                  busyAction === 'topup'
                    ? 'Processing...'
                    : 'Tap NFC Card to Top Up'
                }
                disabled={busyAction !== null}
                onPress={() => {
                  handleTopUp().catch(() => undefined);
                }}
              />
            )}
          </View>

          <View className="mt-3 items-center">
            <SignalButton
              label={registerMode ? 'Switch to Top Up' : 'Switch to Register'}
              variant="secondary"
              size="small"
              fullWidth={false}
              onPress={() => setRegisterMode(prev => !prev)}
            />
          </View>

          <View className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <Text className="text-sm font-bold text-foreground">
              Writes to card
            </Text>
            <Text className="text-xs text-muted">
              Balance, NOT_CHECKED_IN status, register log, protected Silent
              Shield payload.
            </Text>
          </View>
        </View>

        <View className="rounded-2xl bg-white p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-foreground">
              Local Station ledger
            </Text>
            <SignalButton
              label="Refresh"
              variant="secondary"
              size="small"
              fullWidth={false}
              onPress={() => {
                refreshSummary().catch(() => undefined);
              }}
            />
          </View>
          <Text className="mt-2 text-sm text-muted">
            Top-up: Rp {summary.topUpTotal.toLocaleString('id-ID')} • Checkout:
            Rp {summary.checkoutTotal.toLocaleString('id-ID')}
          </Text>
          <Text className="mt-1 text-sm text-muted">
            Registers: {summary.registerCount} • Top-ups: {summary.topUpCount} •
            Checkouts: {summary.checkoutCount}
          </Text>
        </View>

        <View
          className={`rounded-2xl p-4 ${
            latestResult
              ? latestResult.success
                ? 'border border-green-400 bg-[#EAFBF2]'
                : 'border border-red-400 bg-[#FFECEC]'
              : 'bg-white'
          }`}
        >
          <Text className="text-xl font-bold text-foreground">
            Latest result
          </Text>
          {latestResult ? (
            <>
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
            </>
          ) : (
            <Text className="mt-2 text-sm text-muted">
              Station actions will show their latest outcome here.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
});
