import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ScoutErrorCardProps {
  message: string;
}

export function ScoutErrorCard({
  message,
}: Readonly<ScoutErrorCardProps>): React.JSX.Element {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Card cannot be processed</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.4)',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5252',
    textTransform: 'uppercase',
  },
  message: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
