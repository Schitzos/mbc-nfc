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
import { GenericFailureCard } from './fragments/GenericFailureCard';
import { signalColorTokens } from '@presentation/theme/colors';

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
        <View className="-mt-3 rounded-t-2xl bg-[#F5F6FA] px-5 pt-4 pb-4 flex-1">
          {actions.latestResult?.isSimulation && actions.success && (
            <View
              testID="terminal-simulation-banner"
              className="self-center bg-[#FEF3D4] border border-[#FED27F] rounded-full px-3 py-1 mb-2"
            >
              <Text className="text-xs font-semibold text-[#D9801F]">
                ⚠️ Simulation
              </Text>
            </View>
          )}

          <View className="flex-1 justify-center items-center">
            {!actions.latestResult ? (
              <>
                <View className="absolute top-0 left-0 right-0">
                  <TariffPreviewCard />
                </View>
                <RadarZone
                  color={signalColorTokens.brand.primary}
                  label="Tap Card to Check Out"
                  busyLabel="Processing..."
                  disabled={actions.busy}
                  onPress={() => {
                    void actions.handleCheckout();
                  }}
                />
              </>
            ) : actions.success ? (
              <CheckoutSummaryCard
                latestResult={actions.latestResult}
                checkoutTime={actions.checkoutTime}
                isSimulation={actions.latestResult.isSimulation}
                onReset={actions.resetResult}
              />
            ) : actions.insufficient ? (
              <InsufficientBalanceCard
                latestResult={actions.latestResult}
                onRetry={() => {
                  void actions.handleCheckout();
                }}
              />
            ) : (
              <GenericFailureCard
                latestResult={actions.latestResult}
                onReset={actions.resetResult}
              />
            )}
          </View>

          <NfcLogPanel />
        </View>

        <NfcActionSheet
          state={actions.nfcSheet}
          onDismiss={() => actions.handleDismissSheet()}
        />
      </View>
    </View>
  );
}
