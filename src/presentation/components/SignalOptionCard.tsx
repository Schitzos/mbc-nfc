import React, { ReactNode, useMemo, useState } from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { componentTokens } from '../theme/components';
import { typography } from '../theme/typography';

export type SignalOptionCardState =
  keyof typeof componentTokens.optionCard.states;

export interface SignalOptionCardProps extends Omit<
  PressableProps,
  'style' | 'children'
> {
  title: string;
  state?: SignalOptionCardState;
  trailingIcon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SignalOptionCard({
  title,
  state = 'default',
  trailingIcon,
  disabled,
  style,
  ...pressableProps
}: Readonly<SignalOptionCardProps>) {
  const [pressed, setPressed] = useState(false);
  const stateToken =
    componentTokens.optionCard.states[disabled ? 'disabled' : state];

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        pressable: {
          backgroundColor: stateToken.backgroundColor,
          borderColor: stateToken.borderColor,
          opacity: pressed ? 0.86 : 1,
        },
        titleColor: { color: stateToken.textColor },
      }),
    [stateToken, pressed],
  );

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[styles.base, dynamicStyles.pressable, style]}
      {...pressableProps}
    >
      <View style={styles.content}>
        <Text
          numberOfLines={1}
          style={[styles.title, dynamicStyles.titleColor]}
        >
          {title}
        </Text>
        {trailingIcon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: componentTokens.optionCard.width,
    minHeight: componentTokens.optionCard.minHeight,
    borderWidth: componentTokens.optionCard.borderWidth,
    borderRadius: componentTokens.optionCard.radius,
    justifyContent: 'center',
    paddingHorizontal: componentTokens.optionCard.paddingHorizontal,
    paddingVertical: componentTokens.optionCard.paddingVertical,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: componentTokens.optionCard.gap,
  },
  title: {
    ...typography.body1Bold,
    flexShrink: 1,
  },
});
