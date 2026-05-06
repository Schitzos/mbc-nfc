import React from 'react';
import { Text, View } from 'react-native';
import type { RoleActionResultDto } from '../../../../application/dto/role-action-result-dto';

interface GateResultStateProps {
  latestResult: RoleActionResultDto | null;
}

export function GateResultState({
  latestResult,
}: GateResultStateProps): React.JSX.Element | null {
  if (!latestResult) {
    return null;
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
        {latestResult.card && (
          <View className="mt-2 gap-1">
            <Text className="text-xs text-green-800">
              Balance: Rp {latestResult.card.balance.toLocaleString('id-ID')}
            </Text>
            {latestResult.card.activeSession?.checkedInAt && (
              <Text className="text-xs text-green-800">
                Checked in at:{' '}
                {new Date(
                  latestResult.card.activeSession.checkedInAt,
                ).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  }

  const isDoubleCheckIn = latestResult.message
    .toLowerCase()
    .includes('already checked in');

  return (
    <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3">
      <Text className="text-xs font-semibold uppercase text-red-700">
        {isDoubleCheckIn ? 'Blocked' : 'Card cannot be processed'}
      </Text>
      <Text className="mt-1 text-sm font-semibold text-red-900">
        {latestResult.message}
      </Text>
    </View>
  );
}
