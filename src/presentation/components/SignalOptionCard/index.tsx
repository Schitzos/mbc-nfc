import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { componentTokens } from '@presentation/theme/components';
import type { SignalOptionCardProps } from './types';
import { styles } from './styles';

export type { SignalOptionCardProps, SignalOptionCardState } from './types';

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
