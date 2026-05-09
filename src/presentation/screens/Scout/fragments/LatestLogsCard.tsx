import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import dayjs from 'dayjs';
import { LOCALE_ID } from '@shared/constants';

interface LogEntry {
  id: string;
  activity: string;
  nominal: number;
  occurredAt: string;
}

interface LatestLogsCardProps {
  logs: LogEntry[];
}

function formatLogTime(iso: string): string {
  const d = dayjs(iso);
  return d.isValid() ? d.format('DD-MMM-YYYY HH:mm') : iso;
}

export function LatestLogsCard({
  logs,
}: Readonly<LatestLogsCardProps>): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Latest Five Logs</Text>
      {logs.length ? (
        <View style={styles.logList}>
          {logs.slice(0, 5).map((log, index) => (
            <View key={log.id} style={[styles.logRow, index < Math.min(logs.length, 5) - 1 && styles.logRowBorder]}>
              <Text style={styles.logActivity}>
                {index + 1}. {log.activity.replace('_', ' ')}
              </Text>
              <Text style={styles.logMuted}>
                Rp {log.nominal.toLocaleString(LOCALE_ID)}
              </Text>
              <Text style={styles.logMuted}>
                {formatLogTime(log.occurredAt)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No logs yet.</Text>
      )}
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
  logList: {
    marginTop: 8,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  logRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 180, 216, 0.1)',
  },
  logActivity: {
    fontSize: 11,
    color: '#FFFFFF',
    flex: 1,
  },
  logMuted: {
    fontSize: 11,
    color: '#8BA3C7',
    marginLeft: 8,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 12,
    color: '#8BA3C7',
  },
});
