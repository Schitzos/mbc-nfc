import React, { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { RadarZone } from '@presentation/components/RadarZone';
import { NfcLogPanel } from '@presentation/components/NfcLogPanel';
import { NfcActionSheet } from '@presentation/components/NfcActionSheet';
import { useAppStore } from '@presentation/stores/app-store';
import { useGateServices } from '@presentation/context/service-context';
import { GateResultState } from './fragments/GateResultState';
import { SelectedActivityCard } from './fragments/SelectedActivityCard';
import { useGateActions } from './useGateActions';
import { AppHeaderCard } from '@presentation/components/AppHeaderCard';
import { signalColorTokens } from '@presentation/theme/colors';

export function GateScreen(): React.JSX.Element {
  const setSelectedRole = useAppStore(state => state.setSelectedRole);
  const services = useGateServices();
  const actions = useGateActions(services);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

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
        <View className="-mt-3 rounded-t-2xl bg-[#F0F2F5] px-5 pt-5 pb-6 flex-1">
          {__DEV__ && (
            <>
              {actions.simulationEnabled && (
                <View
                  testID="simulation-banner"
                  className="bg-red-600 rounded-lg px-4 py-3 mb-3 border-2 border-red-800"
                >
                  <Text className="text-white font-bold text-center text-base">
                    ⚠️ SIMULATION MODE ACTIVE
                  </Text>
                  <Text className="text-red-100 text-center text-xs mt-1">
                    Balance will NOT be deducted on checkout
                  </Text>
                </View>
              )}
              <View
                className={`flex-row items-center justify-between mb-3 px-4 py-3 rounded-xl ${actions.simulationEnabled ? 'bg-red-100 border-2 border-red-400' : 'bg-white border border-gray-200'}`}
              >
                <View>
                  <Text
                    className={`font-bold text-base ${actions.simulationEnabled ? 'text-red-700' : 'text-gray-800'}`}
                  >
                    🧪 Simulation Mode
                  </Text>
                  <Text className="text-xs text-gray-500 mt-0.5">
                    Set custom check-in time for demo
                  </Text>
                </View>
                <Switch
                  testID="simulation-toggle"
                  value={actions.simulationEnabled}
                  onValueChange={actions.setSimulationEnabled}
                  trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
                  thumbColor={actions.simulationEnabled ? '#FFFFFF' : '#F9FAFB'}
                />
              </View>
              {actions.simulationEnabled && (
                <View className="mb-3 bg-white rounded-xl px-4 py-3 border border-gray-200">
                  <Text className="text-xs font-semibold text-gray-600 mb-2">
                    Simulated Check-in Time
                  </Text>
                  <Pressable
                    testID="simulation-date-button"
                    className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-300"
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text className="text-sm text-gray-800 text-center font-medium">
                      {dayjs(actions.simulatedDate).format(
                        'DD MMM YYYY — HH:mm',
                      )}
                    </Text>
                  </Pressable>
                  {showDatePicker && (
                    <DateTimePicker
                      testID="simulation-date-picker"
                      value={actions.simulatedDate}
                      mode="date"
                      minimumDate={
                        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                      }
                      maximumDate={new Date()}
                      onChange={(_event, date) => {
                        setShowDatePicker(false);
                        if (date) {
                          actions.setSimulatedDate(date);
                          setShowTimePicker(true);
                        }
                      }}
                    />
                  )}
                  {showTimePicker && (
                    <DateTimePicker
                      testID="simulation-time-picker"
                      value={actions.simulatedDate}
                      mode="time"
                      onChange={(_event, time) => {
                        setShowTimePicker(false);
                        if (time) {
                          actions.setSimulatedDate(time);
                        }
                      }}
                    />
                  )}
                </View>
              )}
            </>
          )}
          <View className="flex-1">
            <View className="absolute inset-0 justify-center items-center z-0">
              <RadarZone
                color={signalColorTokens.brand.primary}
                label="Tap Card to Check In"
                busyLabel="Processing..."
                disabled={actions.busy}
                onPress={() => {
                  void actions.handleCheckIn();
                }}
              />
            </View>
            <View className="z-10">
              <SelectedActivityCard />
            </View>
            <View className="mt-auto z-10">
              <GateResultState latestResult={actions.latestResult} />
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
