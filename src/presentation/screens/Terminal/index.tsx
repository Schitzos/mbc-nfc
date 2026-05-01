import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appContainer } from '../../../app/container';
import type { RootStackParamList } from '../../../app/navigation';
import type { CheckNfcAvailabilityResultDto } from '../../../application/dto/check-nfc-availability-result-dto';
import type { RoleActionResultDto } from '../../../application/dto/role-action-result-dto';
import type {
  ActivityTariffRule,
  BenefitActivityType,
} from '../../../domain/entities/mbc-card';
import type { MockCardScenario } from '../../../infrastructure/nfc/mock-mbc-card.repository';
import { SignalButton } from '../../components/SignalButton';
import { useAppStore } from '../../stores/app-store';
import { TerminalHeader } from './fragments/TerminalHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'terminal'>;

const terminalScenarios: Array<{ key: MockCardScenario; label: string }> = [
  { key: 'checked-in', label: 'Checked-in parking card' },
  { key: 'checked-in-generic', label: 'Checked-in generic card' },
  { key: 'checked-in-low-balance', label: 'Checked-in low-balance card' },
  { key: 'normal', label: 'Not checked in' },
  { key: 'unregistered', label: 'Unregistered' },
  { key: 'tampered', label: 'Tampered' },
];

const tariffRulesByType: Record<BenefitActivityType, ActivityTariffRule> = {
  PARKING: {
    activityType: 'PARKING',
    feePerStartedHour: 2000,
    currency: 'IDR',
  },
  GENERIC: {
    activityType: 'GENERIC',
    feePerStartedHour: 3000,
    currency: 'IDR',
  },
};

export function TerminalScreen({ navigation }: Props): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useMemo(() => appContainer.getTerminalServices(), []);
  const [nfcStatus, setNfcStatus] =
    useState<CheckNfcAvailabilityResultDto | null>(null);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [selectedScenario, setSelectedScenario] =
    useState<MockCardScenario>('checked-in');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSelectedRole('terminal');
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

  const handleCheckout = async () => {
    setBusy(true);
    try {
      const currentCard = await services.mockRepository.readCard();
      const activityType = currentCard.activeSession?.activityType ?? 'PARKING';
      const tariffRule = tariffRulesByType[activityType];
      const result = await services.checkOutActivityUseCase.execute({
        tariffRule,
      });
      setLatestResult(result);
    } catch (error) {
      if (error instanceof Error) {
        setLatestResult({
          success: false,
          role: 'TERMINAL',
          message: error.message,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const insufficient = Boolean(
    latestResult &&
    !latestResult.success &&
    latestResult.message.toLowerCase().includes('insufficient'),
  );
  const success = Boolean(latestResult?.success);
  const subtitle = success
    ? 'Checkout completed'
    : insufficient
      ? 'Balance not enough'
      : 'Activity checkout';

  return (
    <ScrollView className="flex-1 bg-background px-6 py-6">
      <View className="gap-4">
        <TerminalHeader
          subtitle={subtitle}
          onBack={() => navigation.goBack()}
        />

        <View className="rounded-2xl bg-white p-4">
          <Text className="text-xl font-bold text-foreground">
            Checkout action
          </Text>
          <View className="mt-3 rounded-xl border border-amber-300 bg-[#FFF7DB] p-3">
            <Text className="text-sm font-semibold text-amber-900">
              Required card state
            </Text>
            <Text className="text-sm font-bold text-foreground">
              CHECKED_IN with active activity
            </Text>
          </View>

          <View className="mt-3 flex-row flex-wrap gap-2">
            {terminalScenarios.map(option => {
              const active = option.key === selectedScenario;
              return (
                <SignalButton
                  key={option.key}
                  label={option.label}
                  variant={active ? 'primary' : 'secondary'}
                  size="small"
                  fullWidth={false}
                  onPress={() => {
                    services.mockRepository.setScenario(option.key);
                    setSelectedScenario(option.key);
                    setLatestResult(null);
                  }}
                />
              );
            })}
          </View>
        </View>

        <SignalButton
          label={busy ? 'Processing...' : 'Tap Card to Check Out'}
          disabled={busy}
          onPress={() => {
            handleCheckout().catch(() => undefined);
          }}
        />

        {success && latestResult ? (
          <View className="rounded-xl border border-green-400 bg-[#EAFBF2] p-3">
            <Text className="text-xs font-semibold uppercase text-green-700">
              Success
            </Text>
            <View className="mt-2 rounded-xl border border-green-400 bg-white p-3">
              <Text className="text-xs text-muted">Duration</Text>
              <Text className="text-xl font-bold text-foreground">
                {latestResult.chargedHours ?? 0}h
              </Text>
              <Text className="mt-2 text-xs text-muted">Fee</Text>
              <Text className="text-xl font-bold text-foreground">
                Rp {latestResult.chargedAmount?.toLocaleString('id-ID') ?? '0'}
              </Text>
              <Text className="mt-2 text-xs text-muted">After</Text>
              <Text className="text-xl font-bold text-foreground">
                Rp {latestResult.card?.balance.toLocaleString('id-ID') ?? '0'}
              </Text>
            </View>
          </View>
        ) : null}

        {insufficient && latestResult ? (
          <View className="gap-3">
            <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3">
              <Text className="text-xs font-semibold uppercase text-red-700">
                Blocked
              </Text>
              <Text className="mt-1 text-sm font-semibold text-red-900">
                Insufficient balance
              </Text>
              <Text className="mt-1 text-xs text-red-800">
                {latestResult.message}
              </Text>
            </View>
            <View className="rounded-xl border border-amber-300 bg-[#FFF7DB] p-3">
              <Text className="text-sm font-semibold text-amber-900">
                System behavior
              </Text>
              <Text className="mt-1 text-xs text-amber-800">
                Do not deduct partial balance. Do not clear CHECKED_IN status.
              </Text>
            </View>
            <SignalButton
              label="Go to Station Top Up"
              onPress={() => navigation.navigate('station')}
            />
          </View>
        ) : null}

        {!latestResult ? (
          <View className="rounded-xl border border-slate-200 bg-white p-3">
            <Text className="text-sm font-semibold text-foreground">
              Calculation preview
            </Text>
            <Text className="mt-1 text-xs text-muted">
              Show duration, charged hours, fee, before balance, and after
              balance before final success.
            </Text>
          </View>
        ) : null}

        <View className="rounded-xl border border-slate-200 bg-white p-3">
          <Text className="text-xs text-muted">
            {nfcStatus?.title ?? 'Checking device NFC'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
