import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { ScreenHeader } from '@presentation/components/ScreenHeader';
import { SignalButton } from '@presentation/components/SignalButton';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { RadarZone } from '@presentation/components/RadarZone';
import { useAppStore } from '@presentation/stores/app-store';
import { useScoutServices } from '@presentation/context/service-context';
import { useScoutActions } from './useScoutActions';
import { signalColorTokens } from '@presentation/theme/colors';
import { ScoutErrorCard } from './fragments/MemberCardError';
import { MemberCardInfo } from './fragments/MemberCardInfo';
import { LatestLogsCard } from './fragments/LatestLogsCard';

const bgImage = require('@presentation/assets/bg-role-switcher.png');

export function ScoutScreen(): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useScoutServices();
  const actions = useScoutActions(services);
  const [showResult, setShowResult] = useState(false);

  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    setSelectedRole('scout');
  }, [setSelectedRole]);

  useEffect(() => {
    if (actions.latestResult) {
      setShowResult(true);
      Animated.parallel([
        Animated.timing(resultOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(resultTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      resultOpacity.setValue(0);
      resultTranslateY.setValue(30);
    }
  }, [actions.latestResult, resultOpacity, resultTranslateY]);

  const handleScanAgain = useCallback(() => {
    setShowResult(false);
  }, []);

  const statusText = actions.busy
    ? 'Reading card data...'
    : 'Tap to inspect member card';

  return (
    <ImageBackground
      source={bgImage}
      className="flex-1"
      resizeMode="cover"
      blurRadius={15}
    >
      <ScreenHeader
        title="The Scout"
        subtitle="Card Inspection and Member Info"
        badgeLabel="Scout"
        badgeIcon="search"
        badgeColor={signalColorTokens.brand.primary}
      />

      <View className="flex-1 px-4">
        {!showResult ? (
          <View className="flex-1">
            <View className="absolute inset-0 justify-center items-center z-0">
              <RadarZone
                color={signalColorTokens.brand.primary}
                label="Inspect"
                busyLabel="Scanning..."
                disabled={actions.busy}
                onPress={() => {
                  void actions.handleInspect();
                }}
              />
            </View>

            <View className="z-10 pointer-events-none">
              <Text
                className={`text-center text-sm ${actions.busy ? 'text-scout font-semibold' : 'text-muted'} mt-6`}
                accessibilityLiveRegion="polite"
              >
                {statusText}
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="pt-2 pb-4 gap-4"
          >
            {actions.latestResult && (
              <Animated.View
                className="gap-3"
                style={{
                  opacity: resultOpacity,
                  transform: [{ translateY: resultTranslateY }],
                }}
              >
                {actions.latestResult.success === false && (
                  <ScoutErrorCard message={actions.latestResult.message} />
                )}
                {actions.latestResult.card && (
                  <MemberCardInfo card={actions.latestResult.card} />
                )}
                {actions.latestResult.card && (
                  <LatestLogsCard
                    logs={actions.latestResult.card.transactionLogs}
                  />
                )}
              </Animated.View>
            )}

            <SignalButton
              label="Scan Another Card"
              onPress={handleScanAgain}
              accessibilityLabel="Scan another card"
            />
          </ScrollView>
        )}

        <View className="pb-4 pt-2">
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
