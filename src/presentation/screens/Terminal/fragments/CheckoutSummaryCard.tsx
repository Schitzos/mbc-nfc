import React from 'react';
import { Pressable, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import dayjs from 'dayjs';
import type { RoleActionResultDto } from '@application/dto/role-action-result-dto';
import { LOCALE_ID } from '@shared/constants';

interface CheckoutSummaryCardProps {
  latestResult: RoleActionResultDto;
  checkoutTime: string;
  isSimulation?: boolean;
  onReset?: () => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

export function CheckoutSummaryCard({
  latestResult,
  checkoutTime,
  isSimulation,
  onReset,
}: Readonly<CheckoutSummaryCardProps>): React.JSX.Element {
  const checkinDisplay = latestResult.checkedInAt
    ? dayjs(latestResult.checkedInAt).format('DD-MMM-YYYY HH:mm')
    : '-';

  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 16,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <View className="items-center">
        <View
          className="h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: '#10B981' }}
        >
          <Text className="text-2xl text-white">✓</Text>
        </View>
        <Text className="mt-2 text-lg font-bold text-white">
          Checkout Summary
        </Text>
        <Text className="mt-1 text-3xl font-extrabold text-white">
          Rp {latestResult.card?.balance.toLocaleString(LOCALE_ID) ?? '0'}
          {isSimulation ? ' (unchanged)' : ''}
        </Text>
      </View>
      <View className="mt-4 gap-2">
        <View className="flex-row justify-between">
          <Text style={{ color: '#94A3B8', fontSize: 12 }}>Tap in at</Text>
          <Text className="text-xs font-semibold text-white">
            {checkinDisplay}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text style={{ color: '#94A3B8', fontSize: 12 }}>Tap out at</Text>
          <Text className="text-xs font-semibold text-white">
            {checkoutTime}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text style={{ color: '#94A3B8', fontSize: 12 }}>Duration</Text>
          <Text className="text-xs font-semibold text-white">
            {formatDuration(latestResult.durationMs ?? 0)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text style={{ color: '#94A3B8', fontSize: 12 }}>Charged Hours</Text>
          <Text className="text-xs font-semibold text-white">
            {latestResult.chargedHours ?? 0}h
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text style={{ color: '#94A3B8', fontSize: 12 }}>Fee</Text>
          <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: '700' }}>
            Rp {latestResult.chargedAmount?.toLocaleString(LOCALE_ID) ?? '0'}
            {isSimulation ? ' (not deducted)' : ''}
          </Text>
        </View>
      </View>
      {onReset && (
        <Pressable
          testID="terminal-scan-another"
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
