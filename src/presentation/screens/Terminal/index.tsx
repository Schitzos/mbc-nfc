import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@app/navigation';
import { SignalButton } from '@presentation/components/SignalButton';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { LOCALE_ID } from '@shared/constants';
import { useTerminalServices } from '@presentation/context/service-context';
import { useTerminalActions } from './useTerminalActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { CheckoutSummaryCard } from './fragments/CheckoutSummaryCard';
import { TariffPreviewCard } from './fragments/TariffPreviewCard';

type Props = Readonly<NativeStackScreenProps<RootStackParamList, 'terminal'>>;

export function TerminalScreen({ navigation }: Props): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useTerminalServices();
  const actions = useTerminalActions(services);

  useEffect(() => {
    setSelectedRole('terminal');
  }, [setSelectedRole]);

  return (
    <View className="flex-1 bg-[#001A41]">
      <View className="flex-1">
        <AppHeaderCard
          title="The Terminal"
          subTitle="Checking out for Parking"
          hasBackButton={true}
          rightIcon={
            <View className="bg-yellow-700 px-4 py-1 rounded-full">
              <Text className="text-white">Terminal</Text>
            </View>
          }
        />
        <View className="-mt-3 rounded-t-3xl bg-[#F0F2F5] px-5 pt-5 pb-6 flex-1">
          <View className="gap-4">
            {/* Tariff Preview */}
            {!actions.insufficient && <TariffPreviewCard />}

            {/* Checkout Button */}
            {!actions.insufficient && (
              <SignalButton
                label={actions.busy ? 'Processing...' : 'Tap Card to Check Out'}
                disabled={actions.busy}
                onPress={() => {
                  void actions.handleCheckout();
                }}
              />
            )}

            {/* Checkout Summary (success) */}
            {actions.success && actions.latestResult ? (
              <CheckoutSummaryCard
                latestResult={actions.latestResult}
                checkoutTime={actions.checkoutTime}
              />
            ) : null}

            {/* Insufficient Balance */}
            {actions.insufficient && actions.latestResult ? (
              <View className="gap-4">
                <View className="rounded-2xl border border-red-400 bg-white p-4">
                  <Text className="text-base font-bold text-red-700">
                    Insufficient balance
                  </Text>
                  <Text className="mt-1 text-xs text-muted">
                    Balance not enough to cover checkout fee.
                  </Text>
                  <View className="mt-3 flex-row gap-3">
                    <View className="flex-1 rounded-xl border border-red-200 bg-red-50 p-3">
                      <Text className="text-xs text-muted">Required Fee</Text>
                      <Text className="text-lg font-bold text-foreground">
                        Rp{' '}
                        {actions.latestResult.chargedAmount?.toLocaleString(
                          LOCALE_ID,
                        ) ?? '2.000'}
                      </Text>
                    </View>
                    <View className="flex-1 rounded-xl border border-red-200 bg-red-50 p-3">
                      <Text className="text-xs text-muted">
                        Available Balance
                      </Text>
                      <Text className="text-lg font-bold text-red-600">
                        Rp{' '}
                        {actions.latestResult.card?.balance.toLocaleString(
                          LOCALE_ID,
                        ) ?? '0'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View className="rounded-2xl bg-white p-4 shadow-sm">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-amber-500">⚠</Text>
                    <Text className="text-sm font-bold text-foreground">
                      What you can do
                    </Text>
                  </View>
                  <Text className="mt-1 text-xs text-muted">
                    Please go to a Station to top up your balance and try again.
                  </Text>
                </View>

                <SignalButton
                  label="Go to Station Top Up"
                  onPress={() => navigation.navigate('station')}
                />
                <SignalButton
                  label="Retry Checkout"
                  variant="secondary"
                  onPress={() => {
                    void actions.handleCheckout();
                  }}
                />
              </View>
            ) : null}

            {/* Generic Failure */}
            {actions.genericFailure && actions.latestResult ? (
              <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3">
                <Text className="text-xs font-semibold uppercase text-red-700">
                  Card cannot be processed
                </Text>
                <Text className="mt-1 text-sm font-semibold text-red-900">
                  {actions.latestResult.message}
                </Text>
              </View>
            ) : null}

            <NfcLogPanel />
          </View>
        </View>

        <NfcActionSheet
          state={actions.nfcSheet}
          onDismiss={() => actions.handleDismissSheet()}
        />
      </View>
    </View>
  );
}
