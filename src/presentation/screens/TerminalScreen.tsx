import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { appContainer } from '../../app/container';
import type { RootStackParamList } from '../../app/navigation';
import type { CheckNfcAvailabilityResultDto } from '../../application/dto/check-nfc-availability-result-dto';
import type { RoleActionResultDto } from '../../application/dto/role-action-result-dto';
import type {
  ActivityTariffRule,
  BenefitActivityType,
} from '../../domain/entities/mbc-card';
import type { MockCardScenario } from '../../infrastructure/nfc/mock-mbc-card.repository';
import { SignalButton } from '../components/SignalButton';
import { SignalStatusBanner } from '../components/SignalStatusBanner';
import { SignalSurfaceCard } from '../components/SignalSurfaceCard';
import { SignalTextField } from '../components/SignalTextField';
import { useAppStore } from '../stores/app-store';

type Props = NativeStackScreenProps<RootStackParamList, 'terminal'>;

const terminalScenarios: Array<{ key: MockCardScenario; label: string }> = [
  { key: 'checked-in', label: 'Checked-in parking card' },
  { key: 'checked-in-generic', label: 'Checked-in co-working card' },
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
  const [checkedOutAt, setCheckedOutAt] = useState('');
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
        checkedOutAt: checkedOutAt || undefined,
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

  const selectedTariffRule =
    selectedScenario === 'checked-in-generic'
      ? tariffRulesByType.GENERIC
      : tariffRulesByType.PARKING;

  return (
    <ScrollView className="flex-1 bg-background px-6 py-6">
      <View className="gap-4">
        <SignalSurfaceCard>
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">
                Terminal
              </Text>
              <Text className="mt-2 text-base leading-6 text-muted">
                Check members out safely, show fee details clearly, and block
                insufficient-balance exits without mutating card state.
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
          title="Fixture-backed Terminal flow"
          body="Choose the checkout fixture you want to exercise. Co-working uses the generic tariff fixture of Rp 3.000 per started hour, while the parking demo uses Rp 2.000."
        >
          <View className="mt-4 flex-row flex-wrap gap-3">
            {terminalScenarios.map(option => {
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
        </SignalStatusBanner>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Active tariff fixture
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            The checkout flow accepts an activity tariff rule instead of
            hardcoding parking everywhere.
          </Text>
          <View className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <Text className="text-sm font-semibold text-muted">
              Activity type
            </Text>
            <Text className="mt-1 text-xl font-bold text-foreground">
              {selectedTariffRule.activityType === 'PARKING'
                ? 'Parking'
                : 'Co-working'}
            </Text>
            <Text className="mt-3 text-sm font-semibold text-muted">
              Fee per started hour
            </Text>
            <Text className="mt-1 text-xl font-bold text-foreground">
              Rp {selectedTariffRule.feePerStartedHour.toLocaleString('id-ID')}
            </Text>
          </View>
        </View>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Simulation time
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            Leave this blank for the real current time, or provide an ISO
            timestamp to simulate checkout for testing duration and pricing.
          </Text>
          <View className="mt-4">
            <SignalTextField
              label="Optional ISO timestamp"
              placeholder="2026-05-01T10:05:01.000Z"
              value={checkedOutAt}
              onChangeText={setCheckedOutAt}
              helperText="Example: 2026-05-01T10:05:01.000Z"
              style={styles.fullWidth}
            />
          </View>
        </View>

        <View className="rounded-3xl bg-white p-5 shadow-sm">
          <Text className="text-2xl font-bold text-foreground">
            Check out member
          </Text>
          <Text className="mt-2 text-base leading-6 text-muted">
            If no card is available, the scan times out, or a member cannot
            complete checkout, direct recovery back to Station.
          </Text>
          <View className="mt-4">
            <SignalButton
              label={busy ? 'Processing...' : 'Tap Mock Card to Check Out'}
              disabled={busy}
              onPress={() => {
                handleCheckout().catch(() => undefined);
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
              {latestResult.success ? (
                <View className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <Text className="text-sm font-semibold text-muted">
                    Charged hours
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-foreground">
                    {latestResult.chargedHours}
                  </Text>
                  <Text className="mt-3 text-sm font-semibold text-muted">
                    Charged amount
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-foreground">
                    Rp {latestResult.chargedAmount?.toLocaleString('id-ID')}
                  </Text>
                  <Text className="mt-3 text-sm font-semibold text-muted">
                    Remaining balance
                  </Text>
                  <Text className="mt-1 text-xl font-bold text-foreground">
                    Rp {latestResult.card?.balance.toLocaleString('id-ID')}
                  </Text>
                </View>
              ) : (
                <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
                  <Text className="text-sm leading-6 text-red-700">
                    If the member cannot check out because of insufficient
                    balance or missing card state, send them back to Station for
                    top-up or manual recovery handling.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text className="mt-4 text-base leading-6 text-muted">
              Terminal actions will show their latest checkout outcome here.
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
