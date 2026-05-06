import type { StyleProp, ViewStyle } from 'react-native';

export type SignalSkeletonVariant = 'title' | 'button' | 'card';

export interface SignalSkeletonProps {
  variant?: SignalSkeletonVariant;
  style?: StyleProp<ViewStyle>;
}
