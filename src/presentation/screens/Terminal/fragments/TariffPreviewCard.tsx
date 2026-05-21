import React from 'react';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export function TariffPreviewCard(): React.JSX.Element {
  return (
    <LinearGradient
      colors={['#1E293B', '#334155']}
      style={{
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 4,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: '#3B82F6',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>
          P
        </Text>
      </View>
      <Text style={{ color: '#94A3B8', fontSize: 12 }}>Tariff Preview</Text>
      <Text
        className="mt-1"
        style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}
      >
        Rp 2.000{' '}
        <Text style={{ color: '#CBD5E1', fontSize: 14, fontWeight: '400' }}>
          / started hour
        </Text>
      </Text>
      <Text className="mt-1" style={{ color: '#94A3B8', fontSize: 12 }}>
        Fixed tariff
      </Text>
    </LinearGradient>
  );
}
