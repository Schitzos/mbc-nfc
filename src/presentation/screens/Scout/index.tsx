import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, Text, View } from 'react-native';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { RadarZone } from '@presentation/components/RadarZone';
import { useAppStore } from '@presentation/stores/app-store';
import { useScoutServices } from '@presentation/context/service-context';
import { useScoutActions } from './useScoutActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { ScoutErrorCard } from './fragments/MemberCardError';
import { MemberCardInfo } from './fragments/MemberCardInfo';
import { LatestLogsCard } from './fragments/LatestLogsCard';

export function ScoutScreen(): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useScoutServices();
  const actions = useScoutActions(services);

  const resultOpacity = useRef(new Animated.Value(0)).current;
  const resultTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    setSelectedRole('scout');
  }, [setSelectedRole]);

  useEffect(() => {
    if (actions.latestResult) {
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

      <View className="-mt-3 rounded-t-3xl bg-[#F0F2F5] flex-1 overflow-hidden">
        <View className="flex-1">
          <View className="absolute inset-0">
            <RadarZone
              color="#00B4D8"
              label="Inspect"
              busyLabel="Scanning..."
              disabled={actions.busy}
              onPress={() => {
                void actions.handleInspect();
              }}
            />
          </View>

          <ScrollView
            className="flex-1 z-10"
            contentContainerClassName="flex-grow justify-end px-5 pb-4"
            pointerEvents="box-none"
          >
            <Text
              className={`text-center text-sm ${actions.busy ? 'text-[#00B4D8] font-semibold' : 'text-[#8BA3C7]'} mt-6`}
              accessibilityLiveRegion="polite"
            >
              {statusText}
            </Text>

            {actions.latestResult && (
              <Animated.View
                className="mt-8 gap-3"
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
          </ScrollView>
        </View>

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
