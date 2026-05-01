import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appContainer } from '../../app/container';
import type { RootStackParamList } from '../../app/navigation';
import type { CheckNfcAvailabilityResultDto } from '../../application/dto/check-nfc-availability-result-dto';
import type { RoleActionResultDto } from '../../application/dto/role-action-result-dto';
import type { MockCardScenario } from '../../infrastructure/nfc/mock-mbc-card.repository';
import { SignalButton } from '../components/SignalButton';
import { useAppStore } from '../stores/app-store';

type Props = NativeStackScreenProps<RootStackParamList, 'scout'>;

const mockScenarios: Array<{ key: MockCardScenario; label: string }> = [
  { key: 'normal', label: 'Normal card' },
  { key: 'checked-in', label: 'Checked-in parking card' },
  { key: 'checked-in-generic', label: 'Checked-in co-working card' },
  { key: 'low-balance', label: 'Low balance' },
  { key: 'unregistered', label: 'Unregistered' },
  { key: 'tampered', label: 'Tampered' },
];

export function ScoutScreen({ navigation }: Props): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useMemo(() => appContainer.getScoutServices(), []);
  const [nfcStatus, setNfcStatus] =
    useState<CheckNfcAvailabilityResultDto | null>(null);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [selectedScenario, setSelectedScenario] = useState<MockCardScenario>(
    services.mockRepository.getScenario(),
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSelectedRole('scout');
  }, [setSelectedRole]);

  useEffect(() => {
    services.mockRepository.setScenario(selectedScenario);
  }, [selectedScenario, services]);

  useEffect(() => {
    services.checkNfcAvailabilityUseCase
      .execute()
      .then(setNfcStatus)
      .catch(() => undefined);
  }, [services]);

  const handleInspect = async () => {
    setBusy(true);

    try {
      const result = await services.inspectMemberCardUseCase.execute();
      setLatestResult(result);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 py-6">
      <View className="gap-4">
        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">Scout</Text>
              <Text className="mt-2 text-base leading-6 text-muted">
                Inspect a member card with one tap, show balance and status
                clearly, and keep the entire flow read-only.
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
        </View>

        <View className="rounded-3xl border border-blue-200 bg-blue-50 p-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Real NFC status
          </Text>
          <Text className="mt-2 text-2xl font-bold text-foreground">
            {nfcStatus?.title ?? 'Checking device NFC'}
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            {nfcStatus?.message ??
              'The app is checking whether the current device can support real card operations.'}
          </Text>
          <View className="mt-3 gap-2">
            {(nfcStatus?.guidance ?? []).map(item => (
              <Text key={item} className="text-sm leading-5 text-muted">
                • {item}
              </Text>
            ))}
          </View>
        </View>

        <View className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-amber-700">
            Mock demo mode
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Scout uses the same mock card repository as the other roles, but it
            only reads card state and never writes it.
          </Text>
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
                  onPress={() => {
                    services.mockRepository.setScenario(option.key);
                    setSelectedScenario(option.key);
                    setLatestResult(null);
                  }}
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
        </View>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Inspect member card
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            This action reads card state only. It does not top up, check in,
            check out, or change any stored value.
          </Text>
          <View className="mt-4">
            <SignalButton
              label={busy ? 'Inspecting...' : 'Tap Mock Card to Inspect'}
              disabled={busy}
              onPress={() => {
                handleInspect().catch(() => undefined);
              }}
            />
          </View>
        </View>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Latest inspection
          </Text>
          {latestResult ? (
            <View className="mt-4 gap-3">
              <Text
                className={`text-sm font-semibold ${
                  latestResult.success ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {latestResult.success
                  ? 'Inspection complete'
                  : 'Unable to read'}
              </Text>
              <Text className="text-base leading-6 text-muted">
                {latestResult.message}
              </Text>
              {latestResult.card ? (
                <>
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
                      Visit status
                    </Text>
                    <Text className="mt-1 text-xl font-bold text-foreground">
                      {latestResult.card.visitStatus === 'CHECKED_IN'
                        ? 'Checked in'
                        : 'Not checked in'}
                    </Text>
                    <Text className="mt-3 text-sm font-semibold text-muted">
                      Active activity
                    </Text>
                    <Text className="mt-1 text-xl font-bold text-foreground">
                      {latestResult.card.activeSession?.activityType ?? 'None'}
                    </Text>
                  </View>

                  <View className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <Text className="text-lg font-bold text-foreground">
                      Latest five logs
                    </Text>
                    <View className="mt-3 gap-3">
                      {latestResult.card.transactionLogs.length === 0 ? (
                        <Text className="text-sm leading-5 text-muted">
                          No transaction logs are stored on this card yet.
                        </Text>
                      ) : (
                        latestResult.card.transactionLogs.map(log => (
                          <View
                            key={log.id}
                            className="rounded-2xl border border-slate-200 bg-white p-4"
                          >
                            <Text className="text-sm font-semibold text-foreground">
                              {log.activity}
                              {log.nominal
                                ? ` • Rp ${log.nominal.toLocaleString('id-ID')}`
                                : ''}
                            </Text>
                            <Text className="mt-1 text-sm text-muted">
                              {new Date(log.occurredAt).toLocaleString('id-ID')}
                            </Text>
                          </View>
                        ))
                      )}
                    </View>
                  </View>
                </>
              ) : null}
            </View>
          ) : (
            <Text className="mt-4 text-base leading-6 text-muted">
              Scout will show balance, visit status, and the latest five logs
              after the card is inspected.
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
