import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, signalColorTokens } from '../theme/colors';
import { componentTokens } from '../theme/components';

export type SignalSkeletonVariant = 'title' | 'button' | 'card';

export type SignalSkeletonProps = {
  variant?: SignalSkeletonVariant;
  style?: StyleProp<ViewStyle>;
};

export function SignalSkeleton({ variant = 'title', style }: SignalSkeletonProps) {
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

const styles = StyleSheet.create({
  title: {
    width: componentTokens.skeleton.title.width,
    height: componentTokens.skeleton.title.height,
    maxWidth: componentTokens.skeleton.title.maxWidth,
    backgroundColor: componentTokens.skeleton.color,
  },
  button: {
    width: componentTokens.skeleton.button.width,
    height: componentTokens.skeleton.button.height,
    borderRadius: componentTokens.skeleton.button.radius,
    backgroundColor: componentTokens.skeleton.color,
  },
  card: {
    width: componentTokens.skeleton.card.width,
    height: componentTokens.skeleton.card.height,
    borderWidth: 1,
    borderColor: componentTokens.skeleton.cardBorderColor,
    borderRadius: componentTokens.skeleton.card.radius,
    backgroundColor: colors.surfaceDefault,
    flexDirection: 'row',
    alignItems: 'center',
    padding: componentTokens.skeleton.card.padding,
    gap: componentTokens.skeleton.card.gap,
  },
  cardAvatar: {
    width: componentTokens.skeleton.card.avatarSize,
    height: componentTokens.skeleton.card.avatarSize,
    borderRadius: componentTokens.skeleton.card.avatarSize / 2,
    backgroundColor: signalColorTokens.background.neutral300,
  },
  cardLine: {
    width: componentTokens.skeleton.card.titleWidth,
    height: componentTokens.skeleton.card.titleHeight,
    backgroundColor: componentTokens.skeleton.color,
  },
});
