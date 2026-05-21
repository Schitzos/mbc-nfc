import React, { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

interface SimulationModePanelProps {
  enabled: boolean;
  onToggle: (value: boolean) => void;
  simulatedDate: Date;
  onDateChange: (date: Date) => void;
}

export function SimulationModePanel({
  enabled,
  onToggle,
  simulatedDate,
  onDateChange,
}: Readonly<SimulationModePanelProps>): React.JSX.Element | null {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  /* istanbul ignore next -- __DEV__ is always true in test env */
  if (!__DEV__) {
    return null;
  }

  return (
    <>
      {enabled && (
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
        className={`flex-row items-center justify-between mb-3 px-4 py-3 rounded-xl ${enabled ? 'bg-red-100 border-2 border-red-400' : 'bg-white border border-gray-200'}`}
      >
        <View>
          <Text
            className={`font-bold text-base ${enabled ? 'text-red-700' : 'text-gray-800'}`}
          >
            🧪 Simulation Mode
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            Set custom check-in time for demo
          </Text>
        </View>
        <Switch
          testID="simulation-toggle"
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
          thumbColor={enabled ? '#FFFFFF' : '#F9FAFB'}
        />
      </View>
      {enabled && (
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
              {dayjs(simulatedDate).format('DD MMM YYYY — HH:mm')}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              testID="simulation-date-picker"
              value={simulatedDate}
              mode="date"
              minimumDate={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)}
              maximumDate={new Date()}
              onChange={(_event, date) => {
                setShowDatePicker(false);
                if (date) {
                  onDateChange(date);
                  setShowTimePicker(true);
                }
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              testID="simulation-time-picker"
              value={simulatedDate}
              mode="time"
              onChange={(_event, time) => {
                setShowTimePicker(false);
                if (time) {
                  onDateChange(time);
                }
              }}
            />
          )}
        </View>
      )}
    </>
  );
}
