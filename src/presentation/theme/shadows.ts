import type { ViewStyle } from 'react-native';

export const shadows = {
  low: {
    shadowColor: '#9E9E9E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  elevation2: {
    shadowColor: '#9E9E9E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  high: {
    shadowColor: '#9E9E9E',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
} satisfies Record<string, ViewStyle>;

export type ShadowToken = keyof typeof shadows;
