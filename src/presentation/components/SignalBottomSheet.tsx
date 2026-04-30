import React, { ReactNode } from 'react';
import { Modal, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, signalColorTokens } from '../theme/colors';
import { componentTokens } from '../theme/components';
import { shadows } from '../theme/shadows';
import { typography } from '../theme/typography';

export type SignalBottomSheetProps = {
  visible: boolean;
  title?: string;
  caption?: string;
  children?: ReactNode;
  stickyAction?: ReactNode;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function SignalBottomSheet({
  visible,
  title,
  caption,
  children,
  stickyAction,
  onClose,
  style,
}: SignalBottomSheetProps) {
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable accessibilityRole="button" style={styles.overlay} onPress={onClose} />
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
              <Pressable accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: componentTokens.bottomSheet.overlayColor,
    opacity: componentTokens.bottomSheet.overlayOpacity,
  },
  sheet: {
    maxHeight: componentTokens.bottomSheet.maxHeight,
    backgroundColor: colors.surfaceDefault,
    borderTopLeftRadius: componentTokens.bottomSheet.topRadius,
    borderTopRightRadius: componentTokens.bottomSheet.topRadius,
    overflow: 'hidden',
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingTop: componentTokens.bottomSheet.headerPaddingTop,
    paddingBottom: 16,
    paddingHorizontal: componentTokens.bottomSheet.horizontalPadding,
  },
  title: {
    ...typography.mobileHeadline2,
    color: signalColorTokens.text.primary,
    flex: 1,
  },
  titleSpacer: {
    flex: 1,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    ...typography.titleRegular,
    color: signalColorTokens.text.primary,
  },
  body: {
    paddingHorizontal: componentTokens.bottomSheet.horizontalPadding,
    gap: componentTokens.bottomSheet.componentGap,
  },
  sticky: {
    ...shadows.high,
    gap: componentTokens.bottomSheet.stickyGap,
    paddingTop: componentTokens.bottomSheet.stickyPaddingTop,
    paddingBottom: componentTokens.bottomSheet.stickyPaddingBottom,
    paddingHorizontal: componentTokens.bottomSheet.horizontalPadding,
    backgroundColor: colors.surfaceDefault,
  },
  caption: {
    ...typography.body2Regular,
    color: colors.bodySecondary,
  },
});

