import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appContainer } from '../../../app/container';
import type { RootStackParamList } from '../../../app/navigation';
import type { RoleActionResultDto } from '../../../application/dto/role-action-result-dto';
import { SignalButton } from '../../components/SignalButton';
import { NfcLogPanel } from '../../components/NfcLogPanel';
import { NfcActionSheet } from '../../components/NfcActionSheet';
import type { NfcActionState } from '../../components/NfcActionSheet';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { useAppStore } from '../../stores/app-store';
import { TerminalHeader } from './fragments/TerminalHeader';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'terminal'>>;

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
function formatTime(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = MONTHS[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mmm}-${yyyy} ${hh}:${mm}`;
}

export function TerminalScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const appendNfcLog = useAppStore(state => state.appendNfcLog);
  const services = useMemo(() => appContainer.getTerminalServices(), []);
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [nfcSheet, setNfcSheet] = useState<NfcActionState>({ phase: 'idle' });
  const [checkoutTime, setCheckoutTime] = useState('');

  useEffect(() => {
    setSelectedRole('terminal');
  }, [setSelectedRole]);

  useEffect(() => {
    services.checkNfcAvailabilityUseCase
      .execute()
      .then(status =>
        appendNfcLog(`[NFC] Availability result: ${status.status}`),
      )
      .catch(() => undefined);
  }, [appendNfcLog, services]);

  const handleCheckout = async () => {
    setBusy(true);
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to check out',
    });
    try {
      appendNfcLog('[NFC] Checkout flow started');
      const result = await services.checkOutActivityUseCase.execute({});
      setLatestResult(result);
      if (result.success) {
        setCheckoutTime(formatTime(new Date()));
        setNfcSheet({
          phase: 'success',
          title: 'Checkout Complete',
          message: result.message,
        });
        appendNfcLog('[NFC] Checkout succeeded');
      } else {
        setNfcSheet({
          phase: 'error',
          title: 'Checkout Failed',
          message: result.message,
        });
        appendNfcLog(`[NFC] Checkout failed: ${result.message}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Checkout error: ${msg}`);
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
    latestResult.success === false &&
    latestResult.message.toLowerCase().includes('insufficient'),
  );
  const genericFailure = Boolean(
    latestResult && latestResult.success === false && insufficient === false,
  );
  const success = Boolean(latestResult?.success);

  let subtitle = 'Activity checkout';
  if (success) {
    subtitle = 'Checkout completed';
  } else if (insufficient) {
    subtitle = 'Balance not enough';
  }

  return (
    <View className="flex-1 bg-background">
      <BackgroundDecor variant="terminal" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View className="gap-4">
          <TerminalHeader
            subtitle={subtitle}
            onBack={() => navigation.goBack()}
          />

          {latestResult === null && (
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              <Text className="text-xl font-bold text-foreground">
                Checkout action
              </Text>
              <View className="mt-3 rounded-xl border border-[#2A8BFF] bg-[#EAF4FF] p-3">
                <Text className="text-sm font-semibold text-muted">
                  Fixed tariff
                </Text>
                <Text className="text-lg font-bold text-foreground">
                  Rp 2.000 / started hour
                </Text>
              </View>
            </View>
          )}

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
                <Text className="text-xs text-muted">Tap out</Text>
                <Text className="text-base font-bold text-foreground">
                  {checkoutTime}
                </Text>
                <Text className="mt-2 text-xs text-muted">Duration</Text>
                <Text className="text-xl font-bold text-foreground">
                  {latestResult.chargedHours ?? 0}h
                </Text>
                <Text className="mt-2 text-xs text-muted">Fee</Text>
                <Text className="text-xl font-bold text-foreground">
                  Rp{' '}
                  {latestResult.chargedAmount?.toLocaleString('id-ID') ?? '0'}
                </Text>
                <Text className="mt-2 text-xs text-muted">Current balance</Text>
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

          {genericFailure && latestResult ? (
            <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3">
              <Text className="text-xs font-semibold uppercase text-red-700">
                Card cannot be processed
              </Text>
              <Text className="mt-1 text-sm font-semibold text-red-900">
                {latestResult.message}
              </Text>
              <Text className="mt-1 text-xs text-red-800">
                Use a valid checked-in card or send member to Station for
                recovery support.
              </Text>
            </View>
          ) : null}

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
