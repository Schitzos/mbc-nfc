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
        className="flex-row items-center justify-between rounded-xl px-3 py-2"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderColor: enabled
            ? 'rgba(245, 158, 11, 0.5)'
            : 'rgba(255, 255, 255, 0.4)',
          borderWidth: 1.5,
          ...(enabled && {
            shadowColor: '#F59E0B',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 6,
          }),
        }}
      >
        <View className="flex-row items-center">
          {enabled && (
            <Animated.View
              testID="simulation-pulse-dot"
              style={[
                {
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#F59E0B',
                  marginRight: 4,
                },
                dotStyle,
              ]}
            />
          )}
          <Text className="text-xs font-semibold text-[#D9801F]">🧪 Sim</Text>
        </View>
        {enabled && (
          <Pressable
            testID="simulation-date-button"
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: '#F59E0B' }}
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
