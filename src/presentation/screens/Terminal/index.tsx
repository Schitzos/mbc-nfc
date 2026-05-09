import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { RadarZone } from '@presentation/components/RadarZone';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useTerminalServices } from '@presentation/context/service-context';
import { useTerminalActions } from './useTerminalActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { CheckoutSummaryCard } from './fragments/CheckoutSummaryCard';
import { TariffPreviewCard } from './fragments/TariffPreviewCard';
import { InsufficientBalanceCard } from './fragments/InsufficientBalanceCard';

export function TerminalScreen(): React.JSX.Element {
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
          <View className="flex-1">
            {!actions.insufficient && (
              <View className="absolute inset-0 justify-center items-center z-0">
                <RadarZone
                  color="#D97706"
                  label="Tap Card to Check Out"
                  busyLabel="Processing..."
                  disabled={actions.busy}
                  onPress={() => {
                    void actions.handleCheckout();
                  }}
                />
              </View>
            )}
            <View className="z-10">
              {!actions.insufficient && <TariffPreviewCard />}
            </View>
            <View className="mt-auto z-10">
              {actions.success && actions.latestResult ? (
                <CheckoutSummaryCard
                  latestResult={actions.latestResult}
                  checkoutTime={actions.checkoutTime}
                />
              ) : null}

              {actions.insufficient && actions.latestResult ? (
                <InsufficientBalanceCard
                  latestResult={actions.latestResult}
                  onRetry={() => {
                    void actions.handleCheckout();
                  }}
                />
              ) : null}

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
            </View>
          </View>
          <View className="mt-auto">
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
