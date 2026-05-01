import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appContainer } from '../../app/container';
import type { RootStackParamList } from '../../app/navigation';
import type { CheckNfcAvailabilityResultDto } from '../../application/dto/check-nfc-availability-result-dto';
import type { RoleActionResultDto } from '../../application/dto/role-action-result-dto';
import type { BenefitActivityType } from '../../domain/entities/mbc-card';
import type { MockCardScenario } from '../../infrastructure/nfc/mock-mbc-card.repository';
import { SignalButton } from '../components/SignalButton';
import { SignalTextField } from '../components/SignalTextField';
import { useAppStore } from '../stores/app-store';

type Props = NativeStackScreenProps<RootStackParamList, 'gate'>;

const mockScenarios: Array<{ key: MockCardScenario; label: string }> = [
  { key: 'normal', label: 'Normal card' },
  { key: 'checked-in', label: 'Already checked in' },
  { key: 'unregistered', label: 'Unregistered' },
  { key: 'tampered', label: 'Tampered' },
];

const activityOptions: Array<{
  id: string;
  type: BenefitActivityType;
  label: string;
  description: string;
}> = [
  {
    id: 'parking-main-gate',
    type: 'PARKING',
    label: 'Parking',
    description: 'Default demo activity using the parking tariff path.',
  },
  {
    id: 'coop-event-hall',
    type: 'GENERIC',
    label: 'Generic activity',
    description: 'Reusable cooperative check-in flow beyond parking.',
  },
];

export function GateScreen({ navigation }: Props): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useMemo(() => appContainer.getGateServices(), []);
  const [nfcStatus, setNfcStatus] =
    useState<CheckNfcAvailabilityResultDto | null>(null);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [selectedScenario, setSelectedScenario] = useState<MockCardScenario>(
    services.mockRepository.getScenario(),
  );
  const [selectedActivityId, setSelectedActivityId] = useState(
    activityOptions[0].id,
  );
  const [simulationTimestamp, setSimulationTimestamp] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedActivity =
    activityOptions.find(option => option.id === selectedActivityId) ??
    activityOptions[0];

  useEffect(() => {
    setSelectedRole('gate');
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

  const handleCheckIn = async () => {
    setBusy(true);

    try {
      const result = await services.checkInActivityUseCase.execute({
        activityId: selectedActivity.id,
        activityType: selectedActivity.type,
        simulatedCheckedInAt: simulationTimestamp || undefined,
      });
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
              <Text className="text-3xl font-bold text-foreground">Gate</Text>
              <Text className="mt-2 text-base leading-6 text-muted">
                Check members into the selected cooperative activity while
                keeping the flow reusable beyond the parking demo.
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
            Gate currently runs on the mock card repository so we can validate
            activity sequencing before real NFC read and write integration.
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
            Activity context
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Parking is the default demo activity, but the use case accepts other
            activity context so the flow is not hardcoded to parking only.
          </Text>
          <View className="mt-4 gap-3">
            {activityOptions.map(option => {
              const active = option.id === selectedActivityId;

              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  className={`rounded-3xl border p-4 ${
                    active
                      ? 'border-accent bg-rose-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                  onPress={() => setSelectedActivityId(option.id)}
                >
                  <Text className="text-lg font-bold text-foreground">
                    {option.label}
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-muted">
                    {option.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Simulation time
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Leave this blank for the real current time, or provide an ISO
            timestamp to simulate a past check-in for testing.
          </Text>
          <View className="mt-4">
            <SignalTextField
              label="Optional ISO timestamp"
              placeholder="2026-05-01T08:30:00.000Z"
              value={simulationTimestamp}
              onChangeText={setSimulationTimestamp}
              helperText="Example: 2026-05-01T08:30:00.000Z"
              style={styles.fullWidth}
            />
          </View>
        </View>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Check in member
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Start the selected activity on the card. If the card is already
            checked in, the action is rejected safely without mutating state.
          </Text>
          <View className="mt-4">
            <SignalButton
              label={busy ? 'Processing...' : 'Tap Mock Card to Check In'}
              disabled={busy}
              onPress={() => {
                handleCheckIn().catch(() => undefined);
              }}
            />
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
                    Active activity
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-foreground">
                    {latestResult.card.activeSession?.activityType ?? 'None'}
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
              Gate actions will show their latest card outcome here.
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
