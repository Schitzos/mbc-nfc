import React from 'react';
import { Pressable, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import dayjs from 'dayjs';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';

interface GateResultStateProps {
  latestResult: RoleActionResultDto | null;
  onReset?: () => void;
}

function formatCheckinDate(iso: string): string {
  const d = dayjs(iso);
  return d.isValid() ? d.format('DD-MMM-YYYY HH:mm') : iso;
}

export function GateResultState({
  latestResult,
  onReset,
}: Readonly<GateResultStateProps>): React.JSX.Element | null {
  if (!latestResult) {
    return null;
  }

  if (latestResult.success) {
    return (
      <LinearGradient
        colors={['#059669', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 20,
          width: '100%',
          shadowColor: '#10B981',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="items-center">
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Text className="text-2xl text-white">✓</Text>
          </View>
          <Text className="mt-3 text-lg font-bold text-white">
            Check-in Successful
          </Text>
        </View>
        {latestResult.card && (
          <View className="mt-4 gap-2">
            <View className="flex-row justify-between">
              <Text
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Activity
              </Text>
              <Text className="text-xs font-semibold text-white">Parking</Text>
            </View>
            <View className="flex-row justify-between">
              <Text
                className="text-xs"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Balance
              </Text>
              <Text className="text-xs font-semibold text-white">
                Rp {latestResult.card.balance.toLocaleString('id-ID')}
              </Text>
            </View>
            {latestResult.card.activeSession?.checkedInAt && (
              <View className="flex-row justify-between">
                <Text
                  className="text-xs"
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Checked in at:
                </Text>
                <Text className="text-xs font-semibold text-white">
                  {formatCheckinDate(
                    latestResult.card.activeSession.checkedInAt,
                  )}
                </Text>
              </View>
            )}
          </View>
        )}
        {onReset && (
          <Pressable
            testID="gate-scan-another"
            className="mt-4 items-center justify-center h-10 rounded-full border border-white"
            onPress={onReset}
          >
            <Text className="text-sm font-semibold text-white">
              Scan Another Card
            </Text>
          </Pressable>
        )}
      </LinearGradient>
    );
  }

  return (
    <View
      className="rounded-2xl bg-white p-4 w-full"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: '#FF0025',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <Text className="text-xs font-semibold uppercase text-red-700">
        {latestResult.errorCode === 'ALREADY_CHECKED_IN'
          ? 'Blocked'
          : 'Card cannot be processed'}
      </Text>
      <Text className="mt-1 text-sm font-semibold text-red-900">
        {latestResult.message}
      </Text>
      {onReset && (
        <Pressable
          testID="gate-scan-another"
          className="mt-4 items-center justify-center h-10 rounded-full border border-[#FF0025]"
          onPress={onReset}
        >
          <Text className="text-sm font-semibold text-[#FF0025]">
            Scan Another Card
          </Text>
        </Pressable>
      )}
    </View>
  );
}
