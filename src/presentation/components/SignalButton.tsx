import React, { ReactNode, useMemo, useState } from 'react';
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

export interface SignalButtonProps extends Omit<
  PressableProps,
  'style' | 'children'
> {
  label: string;
  variant?: SignalButtonVariant;
  size?: SignalButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

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
  const resolvedBackgroundColor = variantToken?.backgroundColor ?? '#ED0226';
  const resolvedBorderColor = variantToken?.borderColor ?? '#ED0226';
  const resolvedTextColor = variantToken?.textColor ?? '#FFFFFF';

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

const styles = StyleSheet.create({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#9E9E9E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
