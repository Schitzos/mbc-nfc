import React from 'react';
import { Text, View } from 'react-native';
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
    <View className="rounded-2xl bg-white p-4 shadow-sm">
      <Text className="text-sm font-bold text-foreground">
        Latest Five Logs
      </Text>
      {logs.length ? (
        <View className="mt-2 gap-1">
          {logs.slice(0, 5).map((log, index) => (
            <View
              key={log.id}
              className="flex-row items-center justify-between"
            >
              <Text className="text-xs text-muted">
                {index + 1}. {log.activity.replace('_', ' ')}
              </Text>
              <Text className="text-xs text-muted">
                Rp {log.nominal.toLocaleString(LOCALE_ID)}
              </Text>
              <Text className="text-xs text-muted">
                {formatLogTime(log.occurredAt)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="mt-2 text-xs text-muted">No logs yet.</Text>
      )}
    </View>
  );
}
