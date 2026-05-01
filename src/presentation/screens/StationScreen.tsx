import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appContainer } from '../../app/container';
import type { RootStackParamList } from '../../app/navigation';
import type { CheckNfcAvailabilityResultDto } from '../../application/dto/check-nfc-availability-result-dto';
import type { RoleActionResultDto } from '../../application/dto/role-action-result-dto';
import type { StationLedgerSummaryDto } from '../../application/dto/station-ledger-summary-dto';
import type { MockCardScenario } from '../../infrastructure/nfc/mock-mbc-card.repository';
import { SignalButton } from '../components/SignalButton';
import { SignalStatusBanner } from '../components/SignalStatusBanner';
import { SignalSurfaceCard } from '../components/SignalSurfaceCard';
import { SignalTextField } from '../components/SignalTextField';
import { useAppStore } from '../stores/app-store';

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

  const handleScenarioChange = (scenario: MockCardScenario) => {
    services.mockRepository.setScenario(scenario);
    setSelectedScenario(scenario);
    setLatestResult(null);
  };

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
        <SignalSurfaceCard>
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">
                Station
              </Text>
              <Text className="mt-2 text-base leading-6 text-muted">
                Register mock cards, top up balance, and verify the local
                Station audit summary before real NFC hardware arrives.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              className="rounded-full bg-slate-100 px-4 py-3"
              onPress={() => navigation.goBack()}
            >
              <Text className="text-sm font-semibold text-foreground">
                Back
              </Text>
            </Pressable>
          </View>
        </SignalSurfaceCard>

        <SignalStatusBanner
          tone="info"
          eyebrow="Real NFC status"
          title={nfcStatus?.title ?? 'Checking device NFC'}
          body={
            nfcStatus?.message ??
            'The app is checking whether the current device can support real card operations.'
          }
          items={nfcStatus?.guidance ?? []}
        />

        <SignalStatusBanner
          tone="warning"
          eyebrow="Mock demo mode"
          title="Fixture-backed Station flow"
          body="This Station flow is backed by the mock card repository for now. Real NFC write behavior will be swapped in later without changing the business use cases."
        >
          <View className="mt-4 flex-row flex-wrap gap-3">
            {mockScenarios.map(option => {
              const active = option.key === selectedScenario;

              return (
                <Pressable
                  key={option.key}
                  accessibilityRole="button"
                  className={`rounded-full border px-4 py-3 ${
                    active
                      ? 'border-accent bg-accent'
                      : 'border-amber-200 bg-white'
                  }`}
                  onPress={() => handleScenarioChange(option.key)}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      active ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SignalStatusBanner>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Register member card
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Member ID is generated automatically and hidden from normal Station
            presentation. No human-readable member field is required in this
            first build.
          </Text>
          <View className="mt-4">
            <SignalButton
              label={
                busyAction === 'register'
                  ? 'Registering...'
                  : 'Tap Mock Card to Register'
              }
              disabled={busyAction !== null}
              onPress={() => {
                handleRegister().catch(() => undefined);
              }}
            />
          </View>
        </View>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Top up balance
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Choose a positive amount, then write the updated mock card state and
            local audit entry together.
          </Text>
          <View className="mt-4">
            <SignalTextField
              label="Top-up amount"
              keyboardType="numeric"
              placeholder="50000"
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              helperText="Positive IDR amount only."
              style={styles.fullWidth}
            />
          </View>
          <View className="mt-4">
            <SignalButton
              label={
                busyAction === 'topup'
                  ? 'Processing...'
                  : 'Tap Mock Card to Top Up'
              }
              disabled={busyAction !== null}
              onPress={() => {
                handleTopUp().catch(() => undefined);
              }}
            />
          </View>
        </View>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <View className="flex-row items-center justify-between gap-3">
            <Text className="text-2xl font-bold text-foreground">
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
          <View className="mt-4 flex-row flex-wrap gap-3">
            <View className="min-w-[140px] flex-1 rounded-2xl bg-slate-100 p-4">
              <Text className="text-sm font-semibold text-muted">
                Top-up total
              </Text>
              <Text className="mt-2 text-2xl font-bold text-foreground">
                Rp {summary.topUpTotal.toLocaleString('id-ID')}
              </Text>
            </View>
            <View className="min-w-[140px] flex-1 rounded-2xl bg-slate-100 p-4">
              <Text className="text-sm font-semibold text-muted">
                Checkout total
              </Text>
              <Text className="mt-2 text-2xl font-bold text-foreground">
                Rp {summary.checkoutTotal.toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
          <View className="mt-3 flex-row flex-wrap gap-3">
            <View className="min-w-[110px] flex-1 rounded-2xl bg-green-50 p-4">
              <Text className="text-sm font-semibold text-muted">
                Registers
              </Text>
              <Text className="mt-2 text-2xl font-bold text-foreground">
                {summary.registerCount}
              </Text>
            </View>
            <View className="min-w-[110px] flex-1 rounded-2xl bg-blue-50 p-4">
              <Text className="text-sm font-semibold text-muted">Top-ups</Text>
              <Text className="mt-2 text-2xl font-bold text-foreground">
                {summary.topUpCount}
              </Text>
            </View>
            <View className="min-w-[110px] flex-1 rounded-2xl bg-amber-50 p-4">
              <Text className="text-sm font-semibold text-muted">
                Checkouts
              </Text>
              <Text className="mt-2 text-2xl font-bold text-foreground">
                {summary.checkoutCount}
              </Text>
            </View>
          </View>
          <View className="mt-4 gap-3">
            <Text className="text-lg font-bold text-foreground">
              Latest entries
            </Text>
            {summary.latestEntries.length === 0 ? (
              <Text className="text-sm leading-5 text-muted">
                No local ledger entries yet.
              </Text>
            ) : (
              summary.latestEntries.map(entry => (
                <View
                  key={entry.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <Text className="text-sm font-semibold text-foreground">
                    {entry.action}
                    {entry.amount
                      ? ` • Rp ${entry.amount.toLocaleString('id-ID')}`
                      : ''}
                  </Text>
                  <Text className="mt-1 text-sm text-muted">
                    {entry.maskedMemberReference ?? 'No member reference'} •{' '}
                    {new Date(entry.occurredAt).toLocaleString('id-ID')}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Latest result
          </Text>
          {latestResult ? (
            <View className="mt-4 gap-3">
              <Text
                className={`text-sm font-semibold ${
                  latestResult.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {latestResult.success ? 'Success' : 'Unable to complete'}
              </Text>
              <Text className="text-base leading-6 text-muted">
                {latestResult.message}
              </Text>
              {latestResult.card ? (
                <View className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Text className="text-sm font-semibold text-muted">
                    Member reference
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-foreground">
                    {latestResult.card.maskedMemberReference}
                  </Text>
                  <Text className="mt-3 text-sm font-semibold text-muted">
                    Balance
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-foreground">
                    Rp {latestResult.card.balance.toLocaleString('id-ID')}
                  </Text>
                  <Text className="mt-3 text-sm font-semibold text-muted">
                    Status
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-foreground">
                    {latestResult.card.visitStatus === 'CHECKED_IN'
                      ? 'Checked in'
                      : 'Not checked in'}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text className="mt-4 text-base leading-6 text-muted">
              Station actions will show their latest card outcome here.
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
