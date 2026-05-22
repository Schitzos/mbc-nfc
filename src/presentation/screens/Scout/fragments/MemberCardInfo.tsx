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
      <Text className="text-sm font-bold text-foreground">
        Member Card Information
      </Text>
      <View className="mt-3 gap-2">
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-muted">ID</Text>
          <Text className="text-xs font-semibold text-foreground">
            {card.maskedMemberReference ?? 'MBC-***'}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-muted">Balance</Text>
          <Text
            className={`text-lg font-extrabold ${card.balance > 0 ? 'text-success' : 'text-error'}`}
          >
            Rp {card.balance.toLocaleString(LOCALE_ID)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-muted">Status</Text>
          <View
            className={`px-2.5 py-0.5 rounded-xl ${isCheckedIn ? 'bg-[rgba(5,150,105,0.15)]' : 'bg-[rgba(107,114,128,0.1)]'}`}
          >
            <Text
              className={`text-xs font-semibold ${isCheckedIn ? 'text-success' : 'text-muted'}`}
            >
              {statusLabel}
            </Text>
          </View>
        </View>
        {!!card.activeSession?.checkedInAt && (
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-muted">Since</Text>
            <Text className="text-xs font-semibold text-foreground">
              {formatLogTime(card.activeSession.checkedInAt)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
