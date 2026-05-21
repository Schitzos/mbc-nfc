import React from 'react';
import { Pressable, Text, View } from 'react-native';
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
      <View className="rounded-2xl bg-white p-5 shadow-sm w-full">
        <View className="items-center">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Text className="text-2xl text-green-600">✓</Text>
          </View>
          <Text className="mt-3 text-lg font-bold text-green-700">
            Check-in Successful
          </Text>
        </View>
        {latestResult.card && (
          <View className="mt-4 gap-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Activity</Text>
              <Text className="text-xs font-semibold text-foreground">
                Parking
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Balance</Text>
              <Text className="text-xs font-semibold text-foreground">
                Rp {latestResult.card.balance.toLocaleString('id-ID')}
              </Text>
            </View>
            {latestResult.card.activeSession?.checkedInAt && (
              <View className="flex-row justify-between">
                <Text className="text-xs text-muted">Checked in at:</Text>
                <Text className="text-xs font-semibold text-foreground">
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

  return (
    <View className="rounded-2xl border border-red-400 bg-[#FFECEC] p-4 w-full">
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
