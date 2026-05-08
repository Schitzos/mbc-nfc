import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { componentTokens } from '@presentation/theme/components';
import type { SignalButtonProps } from './types';
import { styles } from './styles';

export type {
  SignalButtonProps,
  SignalButtonVariant,
  SignalButtonSize,
} from './types';

function resolveOpacity(
  disabled: boolean | null | undefined,
  pressed: boolean,
): number {
  if (disabled) {
    return 0.5;
  }
  if (pressed) {
    return 0.86;
  }
  return 1;
}

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
}: Readonly<SignalButtonProps>) {
  const [pressed, setPressed] = useState(false);
  const sizeToken = componentTokens.button.sizes[size];
  const variantToken = componentTokens.button.variants[variant];
  const resolvedBackgroundColor = variantToken.backgroundColor;
  const resolvedBorderColor = variantToken.borderColor;
  const resolvedTextColor = variantToken.textColor;

  const pressableStyle = useMemo(
    () =>
      StyleSheet.create({
        dynamic: {
          minHeight: sizeToken.height,
          paddingHorizontal: 16,
          borderRadius: componentTokens.button.radius,
          backgroundColor: resolvedBackgroundColor,
          borderColor: resolvedBorderColor,
          opacity: resolveOpacity(disabled, pressed),
        },
      }),
    [
      sizeToken.height,
      resolvedBackgroundColor,
      resolvedBorderColor,
      disabled,
      pressed,
    ],
  );

  const contentGapStyle = useMemo(
    () => StyleSheet.create({ gap: { gap: sizeToken.gap } }),
    [sizeToken.gap],
  );

  const textColorStyle = useMemo(
    () => StyleSheet.create({ color: { color: resolvedTextColor } }),
    [resolvedTextColor],
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.base,
        pressableStyle.dynamic,
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...pressableProps}
    >
      <View style={[styles.content, contentGapStyle.gap]}>
        {leftIcon}
        <Text style={[sizeToken.typography, textColorStyle.color, textStyle]}>
          {label}
        </Text>
        {rightIcon}
      </View>
    </Pressable>
  );
}
