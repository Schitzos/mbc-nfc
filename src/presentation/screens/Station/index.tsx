import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../../../app/navigation';
import { SignalButton } from '../../components/SignalButton';
import { NfcLogPanel } from '../../components/NfcLogPanel';
import { NfcActionSheet } from '../../components/NfcActionSheet';
import { BackgroundDecor } from '../../components/BackgroundDecor';
import { useAppStore } from '../../stores/app-store';
import { LOCALE_ID } from '../../../shared/constants';
import { useStationServices } from '../../context/service-context';
import { StationHeader } from './fragments/StationHeader';
import { useStationActions } from './useStationActions';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'station'>>;

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
function formatResultDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mmm = MONTHS[d.getMonth()];
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${dd}-${mmm}-${yyyy} ${hh}:${mm}`;
}

function getStationButtonLabel(
  registerMode: boolean,
  busyAction: string | null,
): string {
  if (registerMode) {
    return busyAction === 'register'
      ? 'Registering...'
      : 'Tap NFC Card to Register';
  }
  return busyAction === 'topup' ? 'Processing...' : 'Tap NFC Card to Top Up';
}

export function StationScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useStationServices();
  const actions = useStationActions(services);
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
  const [ledgerExpanded, setLedgerExpanded] = React.useState(false);

  useEffect(() => {
    setSelectedRole('station');
  }, [setSelectedRole]);

  return (
    <View className="flex-1 bg-background">
      <BackgroundDecor variant="station" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={contentContainerStyle.container}
      >
        <View className="gap-4">
          <StationHeader
            modeLabel={
              actions.registerMode
                ? 'Register member card'
                : 'Top up member card'
            }
            onBack={() => navigation.goBack()}
          />

          <View className="rounded-2xl border border-[#BFD7FF] bg-[#F4F9FF] p-4">
            <Text className="text-xs font-semibold uppercase text-[#0050AE]">
              Station Ops
            </Text>
            <Text className="mt-1 text-sm text-muted">
              Register new cards and top up member balance with real NFC scan.
            </Text>
          </View>

          <View className="rounded-2xl bg-white p-4 shadow-sm">
            {actions.registerMode === false && (
              <View className="mb-4">
                <Text className="mb-2 text-sm font-semibold text-foreground">
                  Top-up amount
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {[10000, 20000, 50000, 100000].map(amount => (
                    <Pressable
                      key={amount}
                      onPress={() => actions.setTopUpAmount(String(amount))}
                      className={`rounded-xl border px-4 py-3 ${
                        actions.topUpAmount === String(amount)
                          ? 'border-[#0050AE] bg-[#EAF4FF]'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          actions.topUpAmount === String(amount)
                            ? 'text-[#0050AE]'
                            : 'text-foreground'
                        }`}
                      >
                        Rp {amount.toLocaleString(LOCALE_ID)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            <SignalButton
              label={getStationButtonLabel(
                actions.registerMode,
                actions.busyAction,
              )}
              disabled={actions.busyAction !== null}
              onPress={() => {
                if (actions.registerMode) {
                  actions.handleRegister().catch(() => undefined);
                } else {
                  actions.handleTopUp().catch(() => undefined);
                }
              }}
            />

            <View className="mt-3">
              <SignalButton
                label={
                  actions.registerMode
                    ? 'Switch to Top Up'
                    : 'Switch to Register'
                }
                variant="secondary"
                onPress={() => actions.setRegisterMode(prev => !prev)}
              />
            </View>

            <View className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <Text className="text-xs text-muted">
                Member ID is generated automatically and never typed by
                operator.
              </Text>
            </View>
          </View>

          {actions.latestResult && (
            <View
              className={`rounded-2xl p-4 ${
                actions.latestResult.success
                  ? 'border border-green-400 bg-[#EAFBF2]'
                  : 'border border-red-400 bg-[#FFECEC]'
              }`}
            >
              <Text className="text-xl font-bold text-foreground">
                Latest result
              </Text>
              <Text
                className={`mt-2 text-sm font-semibold ${
                  actions.latestResult.success
                    ? 'text-green-700'
                    : 'text-red-700'
                }`}
              >
                {actions.latestResult.success
                  ? 'Success'
                  : 'Unable to complete'}
              </Text>
              <Text className="mt-1 text-sm text-muted">
                {actions.latestResult.message}
              </Text>
              <Text className="mt-1 text-xs text-muted">
                {actions.resultTime ? formatResultDate(actions.resultTime) : ''}
              </Text>
            </View>
          )}

          <View className="rounded-2xl bg-white p-4 shadow-sm">
            <Pressable
              onPress={() => setLedgerExpanded(prev => !prev)}
              className="flex-row items-center justify-between"
            >
              <Text className="text-xl font-bold text-foreground">
                Local Station ledger
              </Text>
              <View className="flex-row items-center gap-3">
                <Pressable
                  onPress={() => {
                    actions.refreshSummary().catch(() => undefined);
                  }}
                >
                  <Text className="text-sm font-semibold text-[#0050AE]">
                    Refresh
                  </Text>
                </Pressable>
                <Text className="text-sm text-muted">
                  {ledgerExpanded ? '▲' : '▼'}
                </Text>
              </View>
            </Pressable>
            {ledgerExpanded && (
              <View className="mt-3">
                <Text className="text-sm text-muted">
                  Top-up: Rp{' '}
                  {actions.summary.topUpTotal.toLocaleString(LOCALE_ID)} •
                  Checkout: Rp{' '}
                  {actions.summary.checkoutTotal.toLocaleString(LOCALE_ID)}
                </Text>
                <Text className="mt-1 text-sm text-muted">
                  Registers: {actions.summary.registerCount} • Top-ups:{' '}
                  {actions.summary.topUpCount} • Checkouts:{' '}
                  {actions.summary.checkoutCount}
                </Text>
              </View>
            )}
          </View>

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
