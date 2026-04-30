import React, { ReactNode } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { componentTokens } from '../theme/components';

export type SignalButtonVariant = keyof typeof componentTokens.button.variants;
export type SignalButtonSize = keyof typeof componentTokens.button.sizes;

export type SignalButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: SignalButtonVariant;
  size?: SignalButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function SignalButton({
  label,
  variant = 'primary',
  size = 'large',
  leftIcon,
  rightIcon,
  fullWidth = true,
  disabled,
  style,
  textStyle,
  ...pressableProps
}: SignalButtonProps) {
  const sizeToken = componentTokens.button.sizes[size];
  const variantToken = componentTokens.button.variants[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          minWidth: fullWidth ? sizeToken.minWidth : undefined,
          height: sizeToken.height,
          borderRadius: componentTokens.button.radius,
          backgroundColor: variantToken.backgroundColor,
          borderColor: variantToken.borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...pressableProps}
    >
      <View style={[styles.content, { gap: sizeToken.gap }]}>
        {leftIcon}
        <Text style={[sizeToken.typography, { color: variantToken.textColor }, textStyle]}>
          {label}
        </Text>
        {rightIcon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

