import type { ReactNode } from 'react';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';
import { componentTokens } from '@presentation/theme/components';

export type SignalTextFieldState =
  keyof typeof componentTokens.textField.states;

export interface SignalTextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  required?: boolean;
  helperText?: string;
  state?: Exclude<SignalTextFieldState, 'disabled'>;
  rightElement?: ReactNode;
  style?: StyleProp<ViewStyle>;
}
