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
      <View className="rounded-[20px] p-5 w-full bg-white/40 border border-white/40">
        <View className="items-center">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
            <Text className="text-3xl text-[#059669]">✓</Text>
          </View>
          <Text className="mt-3 text-lg font-bold text-[#111827]">
            Check-in Successful
          </Text>
        </View>
        {latestResult.card && (
          <View className="mt-4 gap-4">
            <View className="flex-row justify-between border-white border-t-2 border-b-2 pb-4 pt-4">
              <Text className="text-xs text-[#6B7280]">Activity</Text>
              <Text className="text-xs font-semibold text-[#111827]">
                Parking
              </Text>
            </View>
            <View className="flex-row justify-between border-white border-b-2 pb-4">
              <Text className="text-xs text-[#6B7280]">Balance</Text>
              <Text className="text-xs font-semibold text-[#111827]">
                Rp {latestResult.card.balance.toLocaleString('id-ID')}
              </Text>
            </View>
            {latestResult.card.activeSession?.checkedInAt && (
              <View className="flex-row justify-between border-white border-b-2 pb-4">
                <Text className="text-xs text-[#6B7280]">Checked in at:</Text>
                <Text className="text-xs font-semibold text-[#111827]">
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
            className="mt-4 items-center justify-center h-10 rounded-full bg-brand"
            onPress={onReset}
          >
            <Text className="text-sm font-semibold text-white">
              Scan Another Card
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View className="rounded-[20px] p-4 w-full bg-white/40 border border-[rgba(255,82,82,0.4)]">
      <Text className="text-xs font-semibold uppercase text-red-700">
        {latestResult.errorCode === 'ALREADY_CHECKED_IN'
          ? 'Blocked'
          : 'Card cannot be processed'}
      </Text>
      <Text className="mt-1 text-sm font-semibold text-[#111827]">
        {latestResult.message}
      </Text>
      {onReset && (
        <Pressable
          testID="gate-scan-another"
          className="mt-4 items-center justify-center h-10 rounded-full bg-brand"
          onPress={onReset}
        >
          <Text className="text-sm font-semibold text-white">
            Scan Another Card
          </Text>
        </Pressable>
      )}
    </View>
  );
}
