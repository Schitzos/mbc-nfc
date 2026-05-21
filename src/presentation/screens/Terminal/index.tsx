import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
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
        <LinearGradient
          colors={['#0D1B3E', '#F5F6FA']}
          locations={[0, 0.3]}
          style={{
            marginTop: -12,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 16,
            flex: 1,
          }}
        >
          {actions.latestResult?.isSimulation && actions.success && (
            <Animated.View
              testID="terminal-simulation-banner"
              style={[
                {
                  alignSelf: 'center',
                  backgroundColor: '#F59E0B',
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  marginBottom: 8,
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                },
                badgeStyle,
              ]}
            >
              <Text className="text-xs font-bold text-white">⚠️ SIM</Text>
            </Animated.View>
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
        </LinearGradient>

        <NfcActionSheet
          state={actions.nfcSheet}
          onDismiss={() => actions.handleDismissSheet()}
        />
      </View>
    </View>
  );
}
