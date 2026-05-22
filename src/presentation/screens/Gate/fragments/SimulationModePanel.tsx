import React, { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
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
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    if (enabled) {
      dotOpacity.value = withRepeat(
        withTiming(0.4, { duration: 1000 }),
        -1,
        true,
      );
    } else {
      dotOpacity.value = 1;
    }
  }, [enabled, dotOpacity]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  /* istanbul ignore next -- __DEV__ is always true in test env */
  if (!__DEV__) {
    return null;
  }

  return (
    <View className="mb-2">
      <View
        testID="simulation-banner"
        className={`flex-row items-center justify-between rounded-xl px-3 py-2 bg-white/40 border-[1.5px] ${enabled ? 'border-[rgba(245,158,11,0.5)]' : 'border-white'}`}
      >
        <View className="flex-row items-center">
          {enabled && (
            <Animated.View
              testID="simulation-pulse-dot"
              className="w-2 h-2 rounded-full mr-1 bg-simulation"
              style={dotStyle}
            />
          )}
          <Text className="text-xs font-semibold text-[#F00]">
            {enabled ? '' : '🧪'} Simulation
          </Text>
        </View>
        {enabled && (
          <Pressable
            testID="simulation-date-button"
            className="rounded-full px-3 py-1 bg-simulation"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-xs font-medium text-white">
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
