import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useStationServices } from '@presentation/context/service-context';
import { useStationActions } from './useStationActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { RegisterActions } from './fragments/RegisterActions';
import { TopUpActions } from './fragments/TopUpActions';
import { LatestResultCard } from './fragments/LatestResultCard';
import { LocalStationLedgerCard } from './fragments/LocalStationLedgerCard';

export function StationScreen(): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useStationServices();
  const actions = useStationActions(services);

  useEffect(() => {
    setSelectedRole('station');
  }, [setSelectedRole]);

  return (
    <View className="flex-1 bg-[#001A41]">
      <View className="flex-1">
        <AppHeaderCard
          title="The Station"
          subTitle="Register or Top Up Ntags"
          hasBackButton={true}
          rightIcon={
            <View className="bg-green-700 px-4 py-1 rounded-full">
              <Text className="text-white">Station</Text>
            </View>
          }
        />
        <View className="-mt-3 rounded-t-3xl bg-[#F0F2F5] px-5 pt-5 pb-6 flex-1">
          <View className="gap-4">
            {actions.registerMode && (
              <RegisterActions
                busyAction={actions.busyAction}
                handleRegister={actions.handleRegister}
                setRegisterMode={actions.setRegisterMode}
              />
            )}
            {!actions.registerMode && (
              <TopUpActions
                busyAction={actions.busyAction}
                topUpAmount={actions.topUpAmount}
                setTopUpAmount={actions.setTopUpAmount}
                handleTopUp={actions.handleTopUp}
                setRegisterMode={actions.setRegisterMode}
              />
            )}

            {/* Latest result */}
            {actions.latestResult && (
              <LatestResultCard
                latestResult={actions.latestResult}
                registerMode={actions.registerMode}
              />
            )}

            {/* Local Station Ledger */}
            <LocalStationLedgerCard
              summary={actions.summary}
              refreshSummary={actions.refreshSummary}
            />

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
