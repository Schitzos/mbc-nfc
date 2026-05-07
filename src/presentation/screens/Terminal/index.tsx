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
import { useTerminalServices } from '../../context/service-context';
import { TerminalHeader } from './fragments/TerminalHeader';
import { useTerminalActions } from './useTerminalActions';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'terminal'>>;

export function TerminalScreen({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useTerminalServices();
  const actions = useTerminalActions(services);
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
    setSelectedRole('terminal');
  }, [setSelectedRole]);

  let subtitle = 'Activity checkout';
  if (actions.success) {
    subtitle = 'Checkout completed';
  } else if (actions.insufficient) {
    subtitle = 'Balance not enough';
  }

  return (
    <View className="flex-1 bg-background">
      <BackgroundDecor variant="terminal" />
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={contentContainerStyle.container}
      >
        <View className="gap-4">
          <TerminalHeader
            subtitle={subtitle}
            onBack={() => navigation.goBack()}
          />

          <View className="rounded-2xl border border-[#FFE2B8] bg-[#FFF8ED] p-4">
            <Text className="text-xs font-semibold uppercase text-[#8A5B00]">
              Terminal Flow
            </Text>
            <Text className="mt-1 text-sm text-muted">
              Calculate fee, deduct balance, and close active parking session.
            </Text>
          </View>

          {actions.latestResult === null && (
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
            label={actions.busy ? 'Processing...' : 'Tap Card to Check Out'}
            disabled={actions.busy}
            onPress={() => {
              actions.handleCheckout().catch(() => undefined);
            }}
          />

          {actions.success && actions.latestResult ? (
            <View className="rounded-xl border border-green-400 bg-[#EAFBF2] p-3">
              <Text className="text-xs font-semibold uppercase text-green-700">
                Success
              </Text>
              <View className="mt-2 rounded-xl border border-green-400 bg-white p-3">
                <Text className="text-xs text-muted">Tap out</Text>
                <Text className="text-base font-bold text-foreground">
                  {actions.checkoutTime}
                </Text>
                <Text className="mt-2 text-xs text-muted">Duration</Text>
                <Text className="text-xl font-bold text-foreground">
                  {(() => {
                    const ms = actions.latestResult.durationMs ?? 0;
                    const totalSec = Math.floor(ms / 1000);
                    const h = Math.floor(totalSec / 3600);
                    const m = Math.floor((totalSec % 3600) / 60);
                    const s = totalSec % 60;
                    return `${h}h ${m}m ${s}s`;
                  })()}
                </Text>
                <Text className="mt-2 text-xs text-muted">Fee</Text>
                <Text className="text-xl font-bold text-foreground">
                  Rp{' '}
                  {actions.latestResult.chargedAmount?.toLocaleString(
                    LOCALE_ID,
                  ) ?? '0'}
                </Text>
                <Text className="mt-2 text-xs text-muted">Current balance</Text>
                <Text className="text-xl font-bold text-foreground">
                  Rp{' '}
                  {actions.latestResult.card?.balance.toLocaleString(
                    LOCALE_ID,
                  ) ?? '0'}
                </Text>
              </View>
            </View>
          ) : null}

          {actions.insufficient && actions.latestResult ? (
            <View className="gap-3">
              <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3">
                <Text className="text-xs font-semibold uppercase text-red-700">
                  Blocked
                </Text>
                <Text className="mt-1 text-sm font-semibold text-red-900">
                  Insufficient balance
                </Text>
                <Text className="mt-1 text-xs text-red-800">
                  {actions.latestResult.message}
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

          {actions.genericFailure && actions.latestResult ? (
            <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3">
              <Text className="text-xs font-semibold uppercase text-red-700">
                Card cannot be processed
              </Text>
              <Text className="mt-1 text-sm font-semibold text-red-900">
                {actions.latestResult.message}
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
          state={actions.nfcSheet}
          onDismiss={() => actions.handleDismissSheet()}
        />
      </ScrollView>
    </View>
  );
}
