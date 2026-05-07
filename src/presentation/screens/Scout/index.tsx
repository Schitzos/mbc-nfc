import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../../app/navigation';
import { SignalButton } from '../../components/SignalButton';
import { NfcLogPanel } from '../../components/NfcLogPanel';
import { NfcActionSheet } from '../../components/NfcActionSheet';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { useAppStore } from '../../stores/app-store';
import { LOCALE_ID } from '../../../shared/constants';
import { useScoutServices } from '../../context/service-context';
import { ScoutHeader } from './fragments/ScoutHeader';
import { useScoutActions } from './useScoutActions';

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
  if (Number.isNaN(d.getTime())) {
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
  const services = useScoutServices();
  const actions = useScoutActions(services);
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

  useEffect(() => {
    setSelectedRole('scout');
  }, [setSelectedRole]);

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
            label={actions.busy ? 'Inspecting...' : 'Tap Card to Inspect'}
            disabled={actions.busy}
            onPress={() => {
              void actions.handleInspect();
            }}
          />

          {actions.latestResult && actions.latestResult.success === false ? (
            <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3">
              <Text className="text-xs font-semibold uppercase text-red-700">
                Card cannot be processed
              </Text>
              <Text className="mt-1 text-sm font-semibold text-red-900">
                {actions.latestResult.message}
              </Text>
            </View>
          ) : null}

          {actions.latestResult?.card ? (
            <View className="rounded-xl border border-[#2A8BFF] bg-[#EAF4FF] p-3">
              <Text className="text-base font-bold text-foreground">
                Member card
              </Text>
              <View className="mt-2 flex-row gap-2">
                <View className="flex-1 rounded-lg border border-[#2A8BFF] bg-[#DCEBFA] p-2">
                  <Text className="text-xs text-muted">Card ref</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    {actions.latestResult.card.maskedMemberReference ??
                      'MBC-***'}
                  </Text>
                </View>
                <View className="flex-1 rounded-lg border border-green-400 bg-[#E9F8EF] p-2">
                  <Text className="text-xs text-muted">Balance</Text>
                  <Text className="text-2xl font-bold text-foreground">
                    Rp{' '}
                    {actions.latestResult.card.balance.toLocaleString(
                      LOCALE_ID,
                    )}
                  </Text>
                </View>
              </View>
              <View className="mt-2 rounded-lg border border-[#2A8BFF] bg-[#DCEBFA] p-2">
                <Text className="text-xs text-muted">Status</Text>
                <Text className="text-2xl font-bold text-foreground">
                  {actions.latestResult.card.visitStatus === 'CHECKED_IN'
                    ? 'Checked in'
                    : 'Not checked in'}
                </Text>
              </View>
            </View>
          ) : null}

          {actions.latestResult?.card ? (
            <View className="rounded-xl border border-slate-200 bg-white p-3">
              <Text className="text-base font-bold text-foreground">
                Latest five logs
              </Text>
              {actions.latestResult.card.transactionLogs.length ? (
                actions.latestResult.card.transactionLogs
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
          state={actions.nfcSheet}
          onDismiss={() => actions.handleDismissSheet()}
        />
      </ScrollView>
    </View>
  );
}
