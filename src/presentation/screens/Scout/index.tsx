import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { RadarZone } from '@presentation/components/RadarZone';
import { useAppStore } from '@presentation/stores/app-store';
import { useScoutServices } from '@presentation/context/service-context';
import { useScoutActions } from './useScoutActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { signalColorTokens } from '@presentation/theme/colors';
import { ScoutErrorCard } from './fragments/MemberCardError';
import { MemberCardInfo } from './fragments/MemberCardInfo';
import { LatestLogsCard } from './fragments/LatestLogsCard';

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
    <View className="flex-1">
      <AppHeaderCard
        title="The Scout"
        subTitle="Card Inspection and Member Info"
        hasBackButton={true}
        rightIcon={
          <View className="bg-[#00B4D8] px-4 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">Scout</Text>
          </View>
        }
      />

      <View className="-mt-3 rounded-t-2xl bg-[#F0F2F5] flex-1 overflow-hidden">
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
                className={`text-center text-sm ${actions.busy ? 'text-[#00B4D8] font-semibold' : 'text-[#8BA3C7]'} mt-6`}
                accessibilityLiveRegion="polite"
              >
                {statusText}
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pt-5 pb-4"
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

            <Pressable
              className="mt-4 bg-[#00B4D8] rounded-xl py-3 items-center"
              onPress={handleScanAgain}
              accessibilityRole="button"
              accessibilityLabel="Scan another card"
            >
              <Text className="text-white font-semibold text-sm">
                Scan Another Card
              </Text>
            </Pressable>
          </ScrollView>
        )}

        <View className="px-5 pb-4 pt-2">
          <NfcLogPanel />
        </View>
      </View>

      <NfcActionSheet
        state={actions.nfcSheet}
        onDismiss={() => actions.handleDismissSheet()}
      />
    </View>
  );
}
