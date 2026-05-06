import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import type { SignalBottomSheetProps } from './types';
import { styles } from './styles';

export type { SignalBottomSheetProps } from './types';

export function SignalBottomSheet({
  visible,
  title,
  caption,
  children,
  stickyAction,
  onClose,
  style,
}: Readonly<SignalBottomSheetProps>) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
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
            {onClose ? (
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>x</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.body}>{children}</View>
          {stickyAction ? (
            <View style={styles.sticky}>
              {caption ? (
                <Text numberOfLines={1} style={styles.caption}>
                  {caption}
                </Text>
              ) : null}
              {stickyAction}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
