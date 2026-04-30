import React, { ReactNode, useState } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { signalColorTokens } from '../theme/colors';
import { componentTokens } from '../theme/components';
import { typography } from '../theme/typography';

export type SignalTextFieldState = keyof typeof componentTokens.textField.states;

export type SignalTextFieldProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  required?: boolean;
  helperText?: string;
  state?: Exclude<SignalTextFieldState, 'disabled'>;
  rightElement?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SignalTextField({
  label,
  required = false,
  helperText,
  state = 'enabled',
  rightElement,
  editable = true,
  value,
  onFocus,
  onBlur,
  style,
  placeholder = 'Placeholder',
  ...textInputProps
}: SignalTextFieldProps) {
  const [focused, setFocused] = useState(false);
  const visualState: SignalTextFieldState = !editable
    ? 'disabled'
    : state === 'enabled' && focused
      ? 'focused'
      : state;
  const stateToken = componentTokens.textField.states[visualState];

  return (
    <View style={[styles.root, style]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? <Text style={styles.required}>*</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.inputShell,
          {
            backgroundColor: stateToken.backgroundColor,
            borderColor: stateToken.borderColor,
          },
        ]}
      >
        <TextInput
          value={value}
          editable={editable && state !== 'load'}
          placeholder={placeholder}
          placeholderTextColor={stateToken.placeholderColor}
          style={[styles.input, { color: stateToken.textColor }]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...textInputProps}
        />
        {rightElement}
      </View>

      {helperText ? (
        <Text style={[styles.helper, { color: stateToken.helperColor }]}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: componentTokens.textField.width,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: componentTokens.textField.labelGap,
  },
  label: {
    ...typography.body1Regular,
  },
  required: {
    ...typography.body1Regular,
    color: signalColorTokens.brand.primary,
  },
  inputShell: {
    height: componentTokens.textField.height,
    borderWidth: componentTokens.textField.borderWidth,
    borderRadius: componentTokens.textField.radius,
    paddingHorizontal: componentTokens.textField.inputPaddingHorizontal,
    paddingVertical: componentTokens.textField.inputPaddingVertical,
    flexDirection: 'row',
    alignItems: 'center',
    gap: componentTokens.button.sizes.large.gap,
  },
  input: {
    ...typography.body1Regular,
    flex: 1,
    minWidth: 0,
    padding: 0,
  },
  helper: {
    ...typography.body2Regular,
    marginTop: componentTokens.textField.helperGap,
  },
});
