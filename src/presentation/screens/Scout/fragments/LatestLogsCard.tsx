import React from 'react';
import { Text, View } from 'react-native';
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
    <View className="rounded-[20px] p-4 bg-white/55 border border-white/70">
      <Text className="text-sm font-bold text-[#111827]">Latest Five Logs</Text>
      {logs.length > 0 && (
        <View className="mt-2">
          {[...logs]
            .reverse()
            .slice(0, 5)
            .map((log, index) => (
              <View
                key={log.id}
                className={`flex-row items-center justify-between py-1.5 ${
                  index < Math.min(logs.length, 5) - 1
                    ? 'border-b border-black/5'
                    : ''
                }`}
              >
                <Text className="text-[11px] text-[#111827] flex-1">
                  {index + 1}. {log.activity.replace('_', ' ')}
                  {log.isSimulation ? ' (S)' : ''}
                </Text>
                <Text className="text-[11px] text-brand font-semibold ml-2">
                  {log.nominal > 0
                    ? `Rp ${log.nominal.toLocaleString(LOCALE_ID)}`
                    : ''}
                </Text>
                <Text className="text-[11px] text-[#6B7280] ml-2">
                  {formatLogTime(log.occurredAt)}
                </Text>
              </View>
            ))}
        </View>
      )}
      {logs.length === 0 && (
        <Text className="mt-2 text-xs text-[#6B7280]">No logs yet.</Text>
      )}
    </View>
  );
}
