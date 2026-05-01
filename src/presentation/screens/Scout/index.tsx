import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appContainer } from '../../../app/container';
import type { RootStackParamList } from '../../../app/navigation';
import type { CheckNfcAvailabilityResultDto } from '../../../application/dto/check-nfc-availability-result-dto';
import type { RoleActionResultDto } from '../../../application/dto/role-action-result-dto';
import type { MockCardScenario } from '../../../infrastructure/nfc/mock-mbc-card.repository';
import { SignalButton } from '../../components/SignalButton';
import { useAppStore } from '../../stores/app-store';
import { ScoutHeader } from './fragments/ScoutHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'scout'>;

const mockScenarios: Array<{ key: MockCardScenario; label: string }> = [
  { key: 'normal', label: 'Normal card' },
  { key: 'checked-in', label: 'Checked-in parking card' },
  { key: 'checked-in-generic', label: 'Checked-in generic card' },
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
        <ScoutHeader onBack={() => navigation.goBack()} />

        <View className="self-start rounded-full border border-[#2A8BFF] bg-[#EAF4FF] px-3 py-1">
          <Text className="text-xs font-semibold uppercase text-[#0050AE]">
            Read only
          </Text>
        </View>

        <SignalButton
          label={busy ? 'Inspecting...' : 'Tap Card to Inspect'}
          variant="secondary"
          disabled={busy}
          onPress={() => {
            handleInspect().catch(() => undefined);
          }}
        />

        {latestResult?.card ? (
          <View className="rounded-xl border border-[#2A8BFF] bg-[#EAF4FF] p-3">
            <Text className="text-base font-bold text-foreground">
              Member card
            </Text>
            <View className="mt-2 flex-row gap-2">
              <View className="flex-1 rounded-lg border border-[#2A8BFF] bg-[#DCEBFA] p-2">
                <Text className="text-xs text-muted">Card ref</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {latestResult.card.maskedMemberReference ?? 'MBC-***'}
                </Text>
              </View>
              <View className="flex-1 rounded-lg border border-green-400 bg-[#E9F8EF] p-2">
                <Text className="text-xs text-muted">Balance</Text>
                <Text className="text-2xl font-bold text-foreground">
                  Rp {latestResult.card.balance.toLocaleString('id-ID')}
                </Text>
              </View>
            </View>
            <View className="mt-2 rounded-lg border border-[#2A8BFF] bg-[#DCEBFA] p-2">
              <Text className="text-xs text-muted">Status</Text>
              <Text className="text-2xl font-bold text-foreground">
                {latestResult.card.visitStatus === 'CHECKED_IN'
                  ? 'Checked in'
                  : 'Not checked in'}
              </Text>
            </View>
          </View>
        ) : null}

        <View className="rounded-xl border border-slate-200 bg-white p-3">
          <Text className="text-base font-bold text-foreground">
            Latest five logs
          </Text>
          {latestResult?.card?.transactionLogs.length ? (
            latestResult.card.transactionLogs.slice(0, 5).map((log, index) => (
              <Text key={log.id} className="mt-1 text-xs text-muted">
                {index + 1}. {log.activity}
                {log.nominal
                  ? ` - Rp ${log.nominal.toLocaleString('id-ID')}`
                  : ''}
              </Text>
            ))
          ) : (
            <Text className="mt-1 text-xs text-muted">No logs yet.</Text>
          )}
        </View>

        <View className="rounded-xl border border-slate-200 bg-white p-3">
          <Text className="text-xs font-semibold text-muted">
            Mock scenario
          </Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {mockScenarios.map(option => (
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

        <View className="rounded-xl border border-slate-200 bg-white p-3">
          <Text className="text-xs text-muted">
            {nfcStatus?.title ?? 'Checking device NFC'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
