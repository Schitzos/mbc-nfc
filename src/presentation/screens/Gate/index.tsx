import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { RadarZone } from '@presentation/components/RadarZone';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useGateServices } from '@presentation/context/service-context';
import { GateResultState } from './fragments/GateResultState';
import { SimulationModePanel } from './fragments/SimulationModePanel';
import { useGateActions } from './useGateActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { signalColorTokens } from '@presentation/theme/colors';

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
          statusIndicator={actions.simulationEnabled ? 'simulation' : undefined}
          rightIcon={
            <View className="bg-blue-700 px-4 py-1 rounded-full">
              <Text className="text-white">Gate</Text>
            </View>
          }
        />
        <View className="-mt-3 rounded-t-2xl bg-[#F5F6FA] px-5 pt-4 pb-4 flex-1">
          <SimulationModePanel
            enabled={actions.simulationEnabled}
            onToggle={actions.setSimulationEnabled}
            simulatedDate={actions.simulatedDate}
            onDateChange={actions.setSimulatedDate}
          />

          <View className="flex-1 justify-center items-center">
            {actions.latestResult ? (
              <GateResultState
                latestResult={actions.latestResult}
                onReset={actions.resetResult}
              />
            ) : (
              <RadarZone
                color={signalColorTokens.brand.primary}
                label="Tap Card to Check In"
                busyLabel="Processing..."
                disabled={actions.busy}
                onPress={() => {
                  void actions.handleCheckIn();
                }}
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
