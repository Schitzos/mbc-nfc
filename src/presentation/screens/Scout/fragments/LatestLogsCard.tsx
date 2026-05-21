import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import dayjs from 'dayjs';
import { LOCALE_ID } from '@shared/constants';

interface LogEntry {
  id: string;
  activity: string;
  nominal: number;
  occurredAt: string;
  isSimulation?: boolean;
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
    <LinearGradient colors={['#0F172A', '#1E293B']} style={s.card}>
      <Text style={s.title}>Latest Five Logs</Text>
      {logs.length ? (
        <View style={s.logList}>
          {logs.slice(0, 5).map((log, index) => (
            <View
              key={log.id}
              style={[
                s.logRow,
                index < Math.min(logs.length, 5) - 1 && s.logRowBorder,
              ]}
            >
              <Text style={s.logActivity}>
                {index + 1}. {log.activity.replace('_', ' ')}
                {log.isSimulation ? ' (S)' : ''}
              </Text>
              <Text style={s.logAmount}>
                Rp {log.nominal.toLocaleString(LOCALE_ID)}
              </Text>
              <Text style={s.logTime}>{formatLogTime(log.occurredAt)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={s.emptyText}>No logs yet.</Text>
      )}
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
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logActivity: {
    fontSize: 11,
    color: '#FFFFFF',
    flex: 1,
  },
  logAmount: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
    marginLeft: 8,
  },
  logTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginLeft: 8,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
});
