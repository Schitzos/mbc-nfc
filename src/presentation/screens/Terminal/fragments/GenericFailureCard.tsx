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
    <View className="rounded-[20px] p-4 w-full bg-white/40 border border-[rgba(255,82,82,0.4)]">
      <Text className="text-xs font-semibold uppercase text-red-700">
        Card cannot be processed
      </Text>
      <Text className="mt-1 text-sm font-semibold text-[#111827]">
        {latestResult.message}
      </Text>
      {onReset && (
        <Pressable
          testID="terminal-scan-another"
          className="mt-4 items-center justify-center h-10 rounded-full bg-[#FF0025]"
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
