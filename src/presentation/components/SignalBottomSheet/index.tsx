import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SignalBottomSheetProps } from './types';
import { styles } from './styles';

export type { SignalBottomSheetProps } from './types';

const absoluteRoot = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
});

export function SignalBottomSheet({
  visible,
  title,
  caption,
  children,
  stickyAction,
  onClose,
  style,
}: Readonly<SignalBottomSheetProps>) {
  if (!visible) {
    return null;
  }

  return (
    <View style={[absoluteRoot.container, styles.root]}>
      <Pressable
        accessibilityRole="button"
        style={styles.overlay}
        onPress={onClose}
      />
      <View style={[styles.sheet, style]}>
        <View style={styles.header}>
          {title ? (
            <Text numberOfLines={2} style={styles.title}>
              {title}
            </Text>
          ) : (
            <View style={styles.titleSpacer} />
          )}
          {onClose && (
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>x</Text>
            </Pressable>
          )}
        </View>
        <View style={styles.body}>{children}</View>
        {stickyAction && (
          <View style={styles.sticky}>
            {caption && (
              <Text numberOfLines={1} style={styles.caption}>
                {caption}
              </Text>
            )}
            {stickyAction}
          </View>
        )}
      </View>
    </View>
  );
}
