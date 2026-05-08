import type { ReactNode } from 'react';
import type {
  PressableProps,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { componentTokens } from '@presentation/theme/components';

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
