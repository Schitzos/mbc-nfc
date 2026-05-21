import React, { useEffect } from 'react';
import { ImageBackground, View } from 'react-native';
import { ScreenHeader } from '@presentation/components/ScreenHeader';
import { RadarZone } from '@presentation/components/RadarZone';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useStationServices } from '@presentation/context/service-context';
import { useStationActions } from './useStationActions';
import { LatestResultCard } from './fragments/LatestResultCard';
import { LocalStationLedgerCard } from './fragments/LocalStationLedgerCard';
import { SegmentedControl } from './fragments/SegmentedControl';
import { AmountInput } from './fragments/AmountInput';
import { signalColorTokens } from '@presentation/theme/colors';

const bgImage = require('@presentation/assets/bg-role-switcher.png');

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
    <ImageBackground
      source={bgImage}
      className="flex-1"
      resizeMode="cover"
      blurRadius={15}
    >
      <ScreenHeader
        title="The Station"
        subtitle="Register & Top Up Cards"
        badgeLabel="Station"
        badgeIcon="add-circle-outline"
        badgeColor={signalColorTokens.brand.primary}
      />

      <View className="flex-1 px-4">
        <View className="flex-1">
          <View className="absolute inset-0 justify-center items-center z-0">
            <RadarZone
              color={signalColorTokens.brand.primary}
              label={radarLabel}
              busyLabel={busyLabel}
              disabled={isBusy}
              onPress={handlePress}
            />
          </View>

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
