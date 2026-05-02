import React from 'react';
import { Text, View } from 'react-native';
import type { RoleActionResultDto } from '../../../../application/dto/role-action-result-dto';

type Props = {
  latestResult: RoleActionResultDto | null;
};

export function GateResultState({ latestResult }: Props): React.JSX.Element {
  if (!latestResult) {
    return (
      <View className="rounded-xl border border-slate-200 bg-white p-3">
        <Text className="text-sm font-semibold text-foreground">
          Expected card state
        </Text>
        <Text className="mt-1 text-xs text-muted">
          NOT_CHECKED_IN. Double check-in must be blocked.
        </Text>
      </View>
    );
  }

  if (latestResult.success) {
    return (
      <View className="rounded-xl border border-green-400 bg-[#EAFBF2] p-3">
        <Text className="text-xs font-semibold uppercase text-green-700">
          Check-in result
        </Text>
        <Text className="mt-1 text-sm font-semibold text-green-900">
          {latestResult.message}
        </Text>
        <Text className="mt-1 text-xs text-green-800">
          After success, card status becomes CHECKED_IN with activity and entry
          timestamp.
        </Text>
      </View>
    );
  }

  const isDoubleCheckIn = latestResult.message
    .toLowerCase()
    .includes('already checked in');

  return (
    <View className="gap-3">
      <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3">
        <Text className="text-xs font-semibold uppercase text-red-700">
          {isDoubleCheckIn ? 'Blocked' : 'Card cannot be processed'}
        </Text>
        <Text className="mt-1 text-sm font-semibold text-red-900">
          {latestResult.message}
        </Text>
        {isDoubleCheckIn ? (
          <Text className="mt-1 text-xs text-red-800">
            Do not overwrite entry time. Send member to Terminal for check-out
            if needed.
          </Text>
        ) : null}
      </View>
      <View className="rounded-xl border border-amber-400 bg-[#FFF7DB] p-3">
        <Text className="text-sm font-semibold text-amber-900">
          Recovery guidance
        </Text>
        <Text className="mt-1 text-xs text-amber-800">
          Send member to Terminal for check-out. If card is lost/replaced, use
          Station manual recovery.
        </Text>
      </View>
    </View>
  );
}
