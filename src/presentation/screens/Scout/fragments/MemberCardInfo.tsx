import React from 'react';
import { Text, View } from 'react-native';
import dayjs from 'dayjs';
import { LOCALE_ID } from '@shared/constants';

interface CardData {
  maskedMemberReference?: string;
  balance: number;
  visitStatus: string;
  activeSession?: { checkedInAt: string; isSimulation?: boolean };
}

interface MemberCardInfoProps {
  card: CardData;
}

function formatLogTime(iso: string): string {
  const d = dayjs(iso);
  return d.isValid() ? d.format('DD-MMM-YYYY HH:mm') : iso;
}

export function MemberCardInfo({
  card,
}: Readonly<MemberCardInfoProps>): React.JSX.Element {
  const activitySuffix = card.activeSession ? ' - Parking' : '';
  const isCheckedIn = card.visitStatus === 'CHECKED_IN';
  const simSuffix = card.activeSession?.isSimulation ? ' (S)' : '';
  const statusLabel = isCheckedIn
    ? `Checked in${simSuffix}${activitySuffix}`
    : 'Not checked in';

  return (
    <View className="rounded-[20px] p-4 bg-white/55 border border-white/70">
      <Text className="text-sm font-bold text-[#111827]">
        Member Card Information
      </Text>
      <View className="mt-3 gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-[#6B7280]">ID</Text>
          <Text className="text-xs font-semibold text-[#111827]">
            {card.maskedMemberReference ?? 'MBC-***'}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-[#6B7280]">Balance</Text>
          <Text
            className={`text-lg font-extrabold ${card.balance > 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}
          >
            Rp {card.balance.toLocaleString(LOCALE_ID)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-[#6B7280]">Status</Text>
          <View
            className={`px-2.5 py-0.5 rounded-xl ${isCheckedIn ? 'bg-[rgba(5,150,105,0.15)]' : 'bg-[rgba(107,114,128,0.1)]'}`}
          >
            <Text
              className={`text-xs font-semibold ${isCheckedIn ? 'text-[#059669]' : 'text-[#6B7280]'}`}
            >
              {statusLabel}
            </Text>
          </View>
        </View>
        {!!card.activeSession?.checkedInAt && (
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-[#6B7280]">Since</Text>
            <Text className="text-xs font-semibold text-[#111827]">
              {formatLogTime(card.activeSession.checkedInAt)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
