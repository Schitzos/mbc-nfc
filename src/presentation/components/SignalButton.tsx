import React, { ReactNode, useState } from 'react';
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
  const [pressed, setPressed] = useState(false);
  const sizeToken = componentTokens.button.sizes[size];
  const variantToken = componentTokens.button.variants[variant];
  const resolvedBackgroundColor = variantToken?.backgroundColor ?? '#ED0226';
  const resolvedBorderColor = variantToken?.borderColor ?? '#ED0226';
  const resolvedTextColor = variantToken?.textColor ?? '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.base,
        {
          minHeight: sizeToken.height,
          paddingHorizontal: 16,
          borderRadius: componentTokens.button.radius,
          backgroundColor: resolvedBackgroundColor,
          borderColor: resolvedBorderColor,
          opacity: disabled ? 0.5 : pressed ? 0.86 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...pressableProps}
    >
      <View style={[styles.content, { gap: sizeToken.gap }]}>
        {leftIcon}
        <Text
          style={[
            sizeToken.typography,
            { color: resolvedTextColor },
            textStyle,
          ]}
        >
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
