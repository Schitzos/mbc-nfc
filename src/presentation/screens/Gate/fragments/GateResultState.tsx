import React from 'react';
import { Image, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { SignalButton } from '@presentation/components/SignalButton';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';

const cardErrorIcon = require('@presentation/assets/icon-card-error.png');

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
      <View className="rounded-[20px] p-5 w-full bg-white/40 border border-white/40 gap-2">
        <View className="items-center">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
            <Text className="text-3xl text-success">✓</Text>
          </View>
          <Text className="mt-3 text-lg font-bold text-foreground">
            Check-in Successful
          </Text>
        </View>
        {latestResult.card && (
          <View className="mt-4 gap-4">
            <View className="flex-row justify-between border-white border-t-2 border-b-2 pb-4 pt-4">
              <Text className="text-xs text-muted">Activity</Text>
              <Text className="text-xs font-semibold text-foreground">
                Parking
              </Text>
            </View>
            <View className="flex-row justify-between border-white border-b-2 pb-4">
              <Text className="text-xs text-muted">Balance</Text>
              <Text className="text-xs font-semibold text-foreground">
                Rp {latestResult.card.balance.toLocaleString('id-ID')}
              </Text>
            </View>
            {latestResult.card.activeSession?.checkedInAt && (
              <View className="flex-row justify-between border-white border-b-2 pb-4">
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
          <SignalButton
            testID="gate-scan-another"
            label="Scan Another Card"
            onPress={onReset}
          />
        )}
      </View>
    );
  }

  return (
    <View className="rounded-[20px] p-5 w-full bg-white/60 border border-pink-light gap-4">
      <View className="flex-row items-center gap-4">
        <Image
          source={cardErrorIcon}
          className="w-[120px] h-[120px]"
          resizeMode="contain"
        />
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase text-brand">
            {latestResult.errorCode === 'ALREADY_CHECKED_IN'
              ? 'ALREADY CHECKED IN'
              : 'CARD CANNOT BE PROCESSED'}
          </Text>
          <Text className="mt-1 text-sm font-semibold text-foreground">
            {latestResult.message}
          </Text>
        </View>
      </View>
      {onReset && (
        <SignalButton
          testID="gate-scan-another"
          label="Scan Another Card"
          onPress={onReset}
        />
      )}
    </View>
  );
}
