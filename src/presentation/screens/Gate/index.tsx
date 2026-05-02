import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appContainer } from '../../../app/container';
import type { RootStackParamList } from '../../../app/navigation';
import type { CheckNfcAvailabilityResultDto } from '../../../application/dto/check-nfc-availability-result-dto';
import type { RoleActionResultDto } from '../../../application/dto/role-action-result-dto';
import type { MockCardScenario } from '../../../infrastructure/nfc/mock-mbc-card.repository';
import { SignalButton } from '../../components/SignalButton';
import { useAppStore } from '../../stores/app-store';
import { GateHeader } from './fragments/GateHeader';
import { GateResultState } from './fragments/GateResultState';

type Props = NativeStackScreenProps<RootStackParamList, 'gate'>;

const gateScenarios: Array<{ key: MockCardScenario; label: string }> = [
  { key: 'normal', label: 'Normal card' },
  { key: 'checked-in', label: 'Already checked in' },
  { key: 'unregistered', label: 'Unregistered' },
  { key: 'tampered', label: 'Tampered' },
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
  const [simulationTimestamp, setSimulationTimestamp] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSelectedRole('gate');
  }, [setSelectedRole]);

  useEffect(() => {
    services.checkNfcAvailabilityUseCase
      .execute()
      .then(setNfcStatus)
      .catch(() => undefined);
  }, [services]);

  useEffect(() => {
    services.mockRepository.setScenario(selectedScenario);
  }, [selectedScenario, services]);

  const handleCheckIn = async () => {
    setBusy(true);
    try {
      const result = await services.checkInActivityUseCase.execute({
        activityId: 'parking-main-gate',
        activityType: 'PARKING',
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
        <GateHeader onBack={() => navigation.goBack()} />

        <View className="rounded-2xl bg-white p-4">
          {simulationTimestamp ? (
            <View className="mb-3 self-start rounded-full border border-amber-300 bg-[#FFF7DB] px-3 py-1">
              <Text className="text-xs font-semibold uppercase text-amber-700">
                Simulation active
              </Text>
            </View>
          ) : null}

          <View className="rounded-xl border border-[#2A8BFF] bg-[#EAF4FF] p-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-semibold text-muted">
                  Selected activity
                </Text>
                <Text className="text-2xl font-bold text-foreground">
                  Parking
                </Text>
                <Text className="text-sm text-muted">
                  Rp 2.000 / started hour
                </Text>
              </View>
              <View className="rounded-full border border-[#2A8BFF] px-3 py-1">
                <Text className="text-xs font-semibold text-[#0050AE]">
                  Default demo
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-3 rounded-xl bg-slate-50 p-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-semibold text-muted">
                  Simulation mode
                </Text>
                <Text className="text-2xl font-bold text-foreground">
                  {simulationTimestamp ? 'On' : 'Off'}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                className="rounded-full border border-slate-300 bg-white px-4 py-2"
                onPress={() => {
                  setSimulationTimestamp(current =>
                    current ? '' : '2026-05-01T08:30:00.000Z',
                  );
                }}
              >
                <Text className="text-xs font-semibold text-muted">
                  {simulationTimestamp ? 'Clear' : 'Set past time'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <Text className="text-xs font-semibold uppercase text-muted">
              Mock scenario
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {gateScenarios.map(option => (
                <SignalButton
                  key={option.key}
                  label={option.label}
                  size="small"
                  fullWidth={false}
                  variant={
                    selectedScenario === option.key ? 'primary' : 'secondary'
                  }
                  onPress={() => {
                    services.mockRepository.setScenario(option.key);
                    setSelectedScenario(option.key);
                    setLatestResult(null);
                  }}
                />
              ))}
            </View>
          </View>
        </View>

        <SignalButton
          label={busy ? 'Processing...' : 'Tap Card to Check In'}
          disabled={busy}
          onPress={() => {
            handleCheckIn().catch(() => undefined);
          }}
        />

        <GateResultState latestResult={latestResult} />

        <View className="rounded-xl border border-slate-200 bg-white p-3">
          <Text className="text-xs text-muted">
            {nfcStatus?.title ?? 'Checking device NFC'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
