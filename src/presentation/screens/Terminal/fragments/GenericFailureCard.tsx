import React from 'react';
import { Text, View } from 'react-native';
import { SignalButton } from '@presentation/components/SignalButton';
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
    <View className="rounded-[20px] p-4 w-full bg-white/40 border border-[rgba(255,82,82,0.4)] gap-2">
      <Text className="text-xs font-semibold uppercase text-red-700">
        Card cannot be processed
      </Text>
      <Text className="text-sm font-semibold text-foreground">
        {latestResult.message}
      </Text>
      {onReset && (
        <SignalButton
          testID="terminal-scan-another"
          label="Scan Another Card"
          onPress={onReset}
        />
      )}
    </View>
  );
}
