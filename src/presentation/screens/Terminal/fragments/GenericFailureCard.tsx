import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';

interface GenericFailureCardProps {
  latestResult: RoleActionResultDto;
  onReset?: () => void;
}

export function GenericFailureCard({
  latestResult,
  onReset,
}: Readonly<GenericFailureCardProps>): React.JSX.Element {
  return (
    <View className="rounded-2xl border border-red-400 bg-[#FFECEC] p-4 w-full">
      <Text className="text-xs font-semibold uppercase text-red-700">
        Card cannot be processed
      </Text>
      <Text className="mt-1 text-sm font-semibold text-red-900">
        {latestResult.message}
      </Text>
      {onReset && (
        <Pressable
          testID="terminal-scan-another"
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
