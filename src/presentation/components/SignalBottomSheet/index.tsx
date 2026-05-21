import React from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { SignalBottomSheetProps } from './types';
import { styles } from './styles';

export type { SignalBottomSheetProps } from './types';

const bgImage = require('@presentation/assets/bg-role-switcher.png');

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
      <ImageBackground
        source={bgImage}
        resizeMode="cover"
        blurRadius={15}
        style={[styles.sheet, style]}
      >
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
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
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
      </ImageBackground>
    </View>
  );
}
