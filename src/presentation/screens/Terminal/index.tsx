import React, { useEffect } from 'react';
import { ImageBackground, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ScreenHeader } from '@presentation/components/ScreenHeader';
import { RadarZone } from '@presentation/components/RadarZone';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useTerminalServices } from '@presentation/context/service-context';
import { useTerminalActions } from './useTerminalActions';
import { CheckoutSummaryCard } from './fragments/CheckoutSummaryCard';
import { TariffPreviewCard } from './fragments/TariffPreviewCard';
import { InsufficientBalanceCard } from './fragments/InsufficientBalanceCard';
import { GenericFailureCard } from './fragments/GenericFailureCard';
import { signalColorTokens } from '@presentation/theme/colors';

const bgImage = require('@presentation/assets/bg-role-switcher.png');

export function TerminalScreen(): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useTerminalServices();
  const actions = useTerminalActions(services);

  const badgeOpacity = useSharedValue(1);

  useEffect(() => {
    setSelectedRole('terminal');
  }, [setSelectedRole]);

  useEffect(() => {
    if (actions.latestResult?.isSimulation && actions.success) {
      badgeOpacity.value = withRepeat(
        withTiming(0.5, { duration: 1000 }),
        -1,
        true,
      );
    } else {
      badgeOpacity.value = 1;
    }
  }, [actions.latestResult?.isSimulation, actions.success, badgeOpacity]);

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
  }));

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1"
      resizeMode="cover"
      blurRadius={15}
    >
      <ScreenHeader
        title="The Terminal"
        subtitle="Checking out for Parking"
        badgeLabel="Terminal"
        badgeIcon="settings"
        badgeColor="#FF0025"
      />

      <View className="flex-1 px-4">
        {actions.latestResult?.isSimulation && actions.success && (
          <Animated.View
            testID="terminal-simulation-banner"
            className="self-center bg-[#F59E0B] rounded-full px-3 py-1 mb-2"
            style={badgeStyle}
          >
            <Text className="text-xs font-bold text-white">⚠️ SIMULATION</Text>
          </Animated.View>
        )}

        <View className="flex-1 justify-center items-center">
          {!actions.latestResult && (
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
          )}
          {actions.latestResult && actions.success && (
            <CheckoutSummaryCard
              latestResult={actions.latestResult}
              checkoutTime={actions.checkoutTime}
              isSimulation={actions.latestResult.isSimulation}
              onReset={actions.resetResult}
            />
          )}
          {actions.latestResult && actions.insufficient && (
            <InsufficientBalanceCard
              latestResult={actions.latestResult}
              onRetry={() => {
                void actions.handleCheckout();
              }}
            />
          )}
          {actions.latestResult &&
            !actions.success &&
            !actions.insufficient && (
              <GenericFailureCard
                latestResult={actions.latestResult}
                onReset={actions.resetResult}
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
