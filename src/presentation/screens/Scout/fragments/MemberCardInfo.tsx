import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
    <LinearGradient colors={['#0F172A', '#1E293B']} style={s.card}>
      <Text style={s.title}>Member Card Information</Text>
      <View style={s.rows}>
        <View style={s.row}>
          <Text style={s.label}>ID</Text>
          <Text style={s.value}>{card.maskedMemberReference ?? 'MBC-***'}</Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Balance</Text>
          <Text
            style={[
              s.balanceValue,
              card.balance > 0 ? s.balancePositive : s.balanceZero,
            ]}
          >
            Rp {card.balance.toLocaleString(LOCALE_ID)}
          </Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>Status</Text>
          <View style={[s.statusBadge, isCheckedIn ? s.statusIn : s.statusOut]}>
            <Text
              style={[
                s.statusText,
                isCheckedIn ? s.statusTextIn : s.statusTextOut,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>
        {!!card.activeSession?.checkedInAt && (
          <View style={s.row}>
            <Text style={s.label}>Since</Text>
            <Text style={s.value}>
              {formatLogTime(card.activeSession.checkedInAt)}
            </Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rows: {
    marginTop: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  balancePositive: {
    color: '#00E676',
  },
  balanceZero: {
    color: '#FF5252',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusIn: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
  },
  statusOut: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextIn: {
    color: '#00E676',
  },
  statusTextOut: {
    color: 'rgba(255,255,255,0.6)',
  },
});
