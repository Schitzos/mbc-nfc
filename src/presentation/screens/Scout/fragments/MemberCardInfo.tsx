import React from 'react';
import { Text, View } from 'react-native';
import dayjs from 'dayjs';
import { LOCALE_ID } from '@shared/constants';

interface CardData {
  maskedMemberReference?: string;
  balance: number;
  visitStatus: string;
  activeSession?: { checkedInAt: string };
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
  const statusLabel =
    card.visitStatus === 'CHECKED_IN'
      ? `Checked in${activitySuffix}`
      : 'Not checked in';

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-sm font-bold text-foreground">
        Member Card Information
      </Text>
      <View className="mt-3 gap-2">
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">ID</Text>
          <Text className="text-xs font-semibold text-foreground">
            {card.maskedMemberReference ?? 'MBC-***'}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Balance</Text>
          <Text className="text-xs font-bold text-foreground">
            Rp {card.balance.toLocaleString(LOCALE_ID)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs text-muted">Status</Text>
          <Text className="text-xs font-semibold text-green-600">
            {statusLabel}
          </Text>
        </View>
        {!!(card.activeSession?.checkedInAt) && (
          <View className="flex-row justify-between">
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
