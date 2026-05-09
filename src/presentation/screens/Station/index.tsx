import React, { useEffect } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { RadarZone } from '@presentation/components/RadarZone';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useStationServices } from '@presentation/context/service-context';
import { useStationActions } from './useStationActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { LatestResultCard } from './fragments/LatestResultCard';
import { LocalStationLedgerCard } from './fragments/LocalStationLedgerCard';
import { LOCALE_ID } from '@shared/constants';

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
    <View className="flex-1 bg-[#001A41]">
      <View className="flex-1">
        <AppHeaderCard
          title="The Station"
          subTitle="Register & Top Up Cards"
          hasBackButton={true}
          rightIcon={
            <View className="bg-green-700 px-4 py-1 rounded-full">
              <Text className="text-white">Station</Text>
            </View>
          }
        />
        <View className="-mt-3 rounded-t-3xl bg-[#F0F2F5] px-5 pt-5 pb-6 flex-1">
          <View className="flex-1">
            {/* RadarZone centered */}
            <View className="absolute inset-0 justify-center items-center z-0">
              <RadarZone
                color="#16A34A"
                label={radarLabel}
                busyLabel={busyLabel}
                disabled={isBusy}
                onPress={handlePress}
              />
            </View>

            {/* Top overlay: mode selector + top-up amount */}
            <View className="z-10">
              {/* Segmented Control */}
              <View className="flex-row bg-white rounded-full p-1 border border-slate-200">
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: actions.registerMode }}
                  onPress={() => actions.setRegisterMode(true)}
                  className={`flex-1 py-2 rounded-full items-center ${actions.registerMode ? 'bg-[#16A34A]' : ''}`}
                >
                  <Text className={`text-sm font-semibold ${actions.registerMode ? 'text-white' : 'text-[#4E5764]'}`}>
                    Register
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: !actions.registerMode }}
                  onPress={() => actions.setRegisterMode(false)}
                  className={`flex-1 py-2 rounded-full items-center ${!actions.registerMode ? 'bg-[#16A34A]' : ''}`}
                >
                  <Text className={`text-sm font-semibold ${!actions.registerMode ? 'text-white' : 'text-[#4E5764]'}`}>
                    Top Up
                  </Text>
                </Pressable>
              </View>

              {/* Top-Up Amount Card */}
              {!actions.registerMode && (
                <View className="mt-3 rounded-xl bg-white p-3 shadow-sm">
                  <Text className="text-xs font-semibold text-[#4E5764]">Top Up Amount</Text>
                  <View className="mt-1 flex-row items-center">
                    <Text className="text-2xl font-bold text-[#1A1A1A]">Rp </Text>
                    <TextInput
                      className="flex-1 text-2xl font-bold text-[#1A1A1A] p-0"
                      keyboardType="numeric"
                      value={Number(actions.topUpAmount).toLocaleString(LOCALE_ID)}
                      onChangeText={text => {
                        const numeric = text.replaceAll(/\D/g, '');
                        actions.setTopUpAmount(numeric || '0');
                      }}
                    />
                  </View>
                  <View className="mt-2 flex-row gap-2">
                    {[10000, 20000, 50000, 100000].map(amount => (
                      <Pressable
                        key={amount}
                        onPress={() => actions.setTopUpAmount(String(amount))}
                        className={`rounded-full border px-3 py-1.5 ${
                          actions.topUpAmount === String(amount)
                            ? 'border-[#16A34A] bg-[#16A34A]'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            actions.topUpAmount === String(amount)
                              ? 'text-white'
                              : 'text-[#4E5764]'
                          }`}
                        >
                          {(amount / 1000)}k
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>

            {/* Bottom overlay: results + ledger */}
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

          <View className="mt-auto">
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
