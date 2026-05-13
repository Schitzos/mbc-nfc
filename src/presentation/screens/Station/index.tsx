import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { RadarZone } from '@presentation/components/RadarZone';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useStationServices } from '@presentation/context/service-context';
import { useStationActions } from './useStationActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { LatestResultCard } from './fragments/LatestResultCard';
import { LocalStationLedgerCard } from './fragments/LocalStationLedgerCard';
import { SegmentedControl } from './fragments/SegmentedControl';
import { AmountInput } from './fragments/AmountInput';
import { signalColorTokens } from '@presentation/theme/colors';

export function StationScreen(): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useStationServices();
  const actions = useStationActions(services);

  useEffect(() => {
    setSelectedRole('station');
  }, [setSelectedRole]);

  const radarLabel = actions.registerMode
    ? 'Tap Card to Register'
    : 'Tap Card to Top Up';
  const busyLabel = actions.registerMode ? 'Registering...' : 'Processing...';
  const isBusy = actions.busyAction !== null;

  const handlePress = () => {
    if (actions.registerMode) {
      void actions.handleRegister();
    } else {
      void actions.handleTopUp();
    }
  };

  return (
    <View className="flex-1 bg-[#001A41]">
      <View className="flex-1">
        <AppHeaderCard
          title="The Station"
          subTitle="Register & Top Up Cards"
          hasBackButton={true}
          rightIcon={
            <View className="bg-green-700 px-4 py-1 rounded-full">
              <Text className="text-white">Station</Text>
            </View>
          }
        />
        <View className="-mt-3 rounded-t-3xl bg-[#F0F2F5] px-5 pt-5 pb-6 flex-1">
          <View className="flex-1">
            {/* RadarZone centered */}
            <View className="absolute inset-0 justify-center items-center z-0">
              <RadarZone
                color={signalColorTokens.brand.primary}
                label={radarLabel}
                busyLabel={busyLabel}
                disabled={isBusy}
                onPress={handlePress}
              />
            </View>

            {/* Top overlay: mode selector + top-up amount */}
            <View className="z-10">
              <SegmentedControl
                registerMode={actions.registerMode}
                setRegisterMode={actions.setRegisterMode}
              />

              {!actions.registerMode && (
                <AmountInput
                  topUpAmount={actions.topUpAmount}
                  setTopUpAmount={actions.setTopUpAmount}
                />
              )}
            </View>

            {/* Bottom overlay: results + ledger */}
            <View className="mt-auto z-10">
              {actions.latestResult && (
                <LatestResultCard
                  latestResult={actions.latestResult}
                  registerMode={actions.registerMode}
                />
              )}
              <LocalStationLedgerCard
                summary={actions.summary}
                refreshSummary={actions.refreshSummary}
              />
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
