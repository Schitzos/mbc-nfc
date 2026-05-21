import React, { useEffect } from 'react';
import { ImageBackground, View } from 'react-native';
import { ScreenHeader } from '@presentation/components/ScreenHeader';
import { RadarZone } from '@presentation/components/RadarZone';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useGateServices } from '@presentation/context/service-context';
import { GateResultState } from './fragments/GateResultState';
import { SimulationModePanel } from './fragments/SimulationModePanel';
import { useGateActions } from './useGateActions';
import { signalColorTokens } from '@presentation/theme/colors';

const bgImage = require('@presentation/assets/bg-role-switcher.png');

export function GateScreen(): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useGateServices();
  const actions = useGateActions(services);

  useEffect(() => {
    setSelectedRole('gate');
  }, [setSelectedRole]);

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1"
      resizeMode="cover"
      blurRadius={15}
    >
      <ScreenHeader
        title="The Gate"
        subtitle="Checking in for Parking"
        badgeLabel="Gate"
        badgeIcon="sensor-door"
        badgeColor={signalColorTokens.brand.primary}
      />

      <View className="flex-1 px-4">
        <SimulationModePanel
          enabled={actions.simulationEnabled}
          onToggle={actions.setSimulationEnabled}
          simulatedDate={actions.simulatedDate}
          onDateChange={actions.setSimulatedDate}
        />

        <View className="flex-1 mt-4">
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

        <View className="pb-4">
          <NfcLogPanel variant="light" />
        </View>
      </View>

      <NfcActionSheet
        state={actions.nfcSheet}
        onDismiss={() => actions.handleDismissSheet()}
      />
    </ImageBackground>
  );
}
