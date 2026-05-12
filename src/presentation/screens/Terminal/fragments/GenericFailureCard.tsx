import React from 'react';
import { Text, View } from 'react-native';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';

interface GenericFailureCardProps {
  latestResult: RoleActionResultDto;
}

export function GenericFailureCard({
  latestResult,
}: Readonly<GenericFailureCardProps>): React.JSX.Element {
  return (
    <View className="rounded-xl border border-red-400 bg-[#FFECEC] p-3 mb-4">
      <Text className="text-xs font-semibold uppercase text-red-700">
        Card cannot be processed
      </Text>
      <Text className="mt-1 text-sm font-semibold text-red-900">
        {latestResult.message}
      </Text>
    </View>
  );
}
