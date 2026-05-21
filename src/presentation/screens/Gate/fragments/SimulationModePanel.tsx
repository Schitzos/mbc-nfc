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
    <View className="mb-2">
      <View
        testID="simulation-banner"
        className="flex-row items-center justify-between bg-white rounded-xl px-3 py-2 border border-[#EDECF0]"
      >
        <Text className="text-xs font-semibold text-[#D9801F]">🧪 Sim</Text>
        {enabled && (
          <Pressable
            testID="simulation-date-button"
            className="bg-[#FEF3D4] rounded-full px-3 py-1"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-xs font-medium text-[#D9801F]">
              {dayjs(simulatedDate).format('DD MMM HH:mm')}
            </Text>
          </Pressable>
        )}
        <Switch
          testID="simulation-toggle"
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ false: '#D1D5DB', true: '#FDA22B' }}
          thumbColor="#FFFFFF"
        />
      </View>
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
  );
}
