import type { ReactNode } from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import { componentTokens } from '@presentation/theme/components';

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
