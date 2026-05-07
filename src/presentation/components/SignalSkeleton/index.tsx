import React from 'react';
import { View } from 'react-native';
import type { SignalSkeletonProps } from './types';
import { styles } from './styles';

export type { SignalSkeletonProps, SignalSkeletonVariant } from './types';

export function SignalSkeleton({
  variant = 'title',
  style,
}: Readonly<SignalSkeletonProps>) {
  if (variant === 'button') {
    return <View style={[styles.button, style]} />;
  }
  if (variant === 'card') {
    return (
      <View style={[styles.card, style]}>
        <View style={styles.cardAvatar} />
        <View style={styles.cardLine} />
      </View>
    );
  }
  return <View style={[styles.title, style]} />;
}
