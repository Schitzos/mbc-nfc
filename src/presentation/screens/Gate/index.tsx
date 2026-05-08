import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { SignalButton } from '@presentation/components/SignalButton';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useGateServices } from '@presentation/context/service-context';
import { GateResultState } from './fragments/GateResultState';
import { SelectedActivityCard } from './fragments/SelectedActivityCard';
import { useGateActions } from './useGateActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';

export function GateScreen(): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useGateServices();
  const actions = useGateActions(services);

  useEffect(() => {
    setSelectedRole('gate');
  }, [setSelectedRole]);

  return (
    <View className="flex-1 bg-[#001A41]">
      <View className="flex-1">
        <AppHeaderCard
          title="The Gate"
          subTitle="Checking in for Parking"
          hasBackButton={true}
          rightIcon={
            <View className="bg-blue-700 px-4 py-1 rounded-full">
              <Text className="text-white">Gate</Text>
            </View>
          }
        />
        <View
          className="-mt-3 rounded-t-3xl bg-[#F0F2F5] px-5 pt-5 pb-6 flex-1"
        >
          <View className="gap-4">
            <SelectedActivityCard />

            <SignalButton
              label={actions.busy ? 'Processing...' : 'Tap Card to Check In'}
              disabled={actions.busy}
              onPress={() => {
                void actions.handleCheckIn();
              }}
            />

            <GateResultState latestResult={actions.latestResult} />

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
