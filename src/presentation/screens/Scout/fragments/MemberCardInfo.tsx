import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
  const isCheckedIn = card.visitStatus === 'CHECKED_IN';
  const statusLabel = isCheckedIn
    ? `Checked in${activitySuffix}`
    : 'Not checked in';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Member Card Information</Text>
      <View style={styles.rows}>
        <View style={styles.row}>
          <Text style={styles.label}>ID</Text>
          <Text style={styles.value}>
            {card.maskedMemberReference ?? 'MBC-***'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Balance</Text>
          <Text style={[styles.value, card.balance > 0 ? styles.balancePositive : styles.balanceZero]}>
            Rp {card.balance.toLocaleString(LOCALE_ID)}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <View style={[styles.statusBadge, isCheckedIn ? styles.statusIn : styles.statusOut]}>
            <Text style={[styles.statusText, isCheckedIn ? styles.statusTextIn : styles.statusTextOut]}>
              {statusLabel}
            </Text>
          </View>
        </View>
        {!!(card.activeSession?.checkedInAt) && (
          <View style={styles.row}>
            <Text style={styles.label}>Since</Text>
            <Text style={styles.value}>
              {formatLogTime(card.activeSession.checkedInAt)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#002255',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 180, 216, 0.2)',
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
    color: '#8BA3C7',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(139, 163, 199, 0.15)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextIn: {
    color: '#00E676',
  },
  statusTextOut: {
    color: '#8BA3C7',
  },
});
