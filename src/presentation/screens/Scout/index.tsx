import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { LOCALE_ID, UNKNOWN_ERROR_MESSAGE } from '../../../shared/constants';
import { ScoutHeader } from './fragments/ScoutHeader';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'scout'>>;

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
function formatLogTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    return iso;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = MONTHS[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mmm}-${yyyy} ${hh}:${mm}`;
}

export function ScoutScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const appendNfcLog = useAppStore(state => state.appendNfcLog);
  const services = useMemo(() => appContainer.getScoutServices(), []);
  const contentContainerStyle = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 24,
        },
      }),
    [insets.top, insets.bottom],
  );
  const [latestResult, setLatestResult] = useState<RoleActionResultDto | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [nfcSheet, setNfcSheet] = useState<NfcActionState>({ phase: 'idle' });

  useEffect(() => {
    setSelectedRole('scout');
  }, [setSelectedRole]);

  useEffect(() => {
    services.checkNfcAvailabilityUseCase
      .execute()
      .then(status =>
        appendNfcLog(`[NFC] Availability result: ${status.status}`),
      )
      .catch(() => undefined);
  }, [appendNfcLog, services]);

  const handleInspect = async () => {
    setBusy(true);
    setNfcSheet({
      phase: 'scanning',
      message: 'Hold your NFC card to inspect',
    });
    try {
      appendNfcLog('[NFC] Inspect flow started');
      const result = await services.inspectMemberCardUseCase.execute();
      setLatestResult(result);
      if (result.success) {
        setNfcSheet({
          phase: 'success',
          title: 'Card Read',
          message: result.message,
        });
        appendNfcLog('[NFC] Inspect succeeded');
      } else {
        setNfcSheet({
          phase: 'error',
          title: 'Inspect Failed',
          message: result.message,
        });
        appendNfcLog(`[NFC] Inspect failed: ${result.message}`);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
      setNfcSheet({ phase: 'error', title: 'Error', message: msg });
      appendNfcLog(`[NFC] Inspect error: ${msg}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <BackgroundDecor variant="scout" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={contentContainerStyle.container}
      >
        <View className="gap-4">
          <ScoutHeader onBack={() => navigation.goBack()} />

          <SignalButton
            label={busy ? 'Inspecting...' : 'Tap Card to Inspect'}
            disabled={busy}
            onPress={() => {
              handleInspect().catch(() => undefined);
            }}
          />

          {latestResult && latestResult.success === false ? (
            <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3">
              <Text className="text-xs font-semibold uppercase text-red-700">
                Card cannot be processed
              </Text>
              <Text className="mt-1 text-sm font-semibold text-red-900">
                {latestResult.message}
              </Text>
            </View>
          ) : null}

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
                    Rp {latestResult.card.balance.toLocaleString(LOCALE_ID)}
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

          {latestResult?.card ? (
            <View className="rounded-xl border border-slate-200 bg-white p-3">
              <Text className="text-base font-bold text-foreground">
                Latest five logs
              </Text>
              {latestResult.card.transactionLogs.length ? (
                latestResult.card.transactionLogs
                  .slice(0, 5)
                  .map((log, index) => (
                    <Text key={log.id} className="mt-1 text-xs text-muted">
                      {index + 1}. {log.activity}
                      {log.nominal
                        ? ` — Rp ${log.nominal.toLocaleString(LOCALE_ID)}`
                        : ''}{' '}
                      • {formatLogTime(log.occurredAt)}
                    </Text>
                  ))
              ) : (
                <Text className="mt-1 text-xs text-muted">No logs yet.</Text>
              )}
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
