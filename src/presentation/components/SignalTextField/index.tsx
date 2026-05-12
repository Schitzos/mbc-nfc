import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { componentTokens } from '@presentation/theme/components';
import type { SignalTextFieldProps, SignalTextFieldState } from './types';
import { styles } from './styles';

export type { SignalTextFieldProps, SignalTextFieldState } from './types';

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
}: Readonly<SignalTextFieldProps>) {
  const [focused, setFocused] = useState(false);

  let visualState: SignalTextFieldState = state;
  if (editable === false) {
    visualState = 'disabled';
  } else if (state === 'enabled' && focused) {
    visualState = 'focused';
  }
  const stateToken = componentTokens.textField.states[visualState];

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        shell: {
          backgroundColor: stateToken.backgroundColor,
          borderColor: stateToken.borderColor,
        },
        inputColor: { color: stateToken.textColor },
        helperColor: { color: stateToken.helperColor },
      }),
    [stateToken],
  );

  return (
    <View style={[styles.root, style]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}
      <View style={[styles.inputShell, dynamicStyles.shell]}>
        <TextInput
          value={value}
          editable={editable && state !== 'load'}
          placeholder={placeholder}
          placeholderTextColor={stateToken.placeholderColor}
          style={[styles.input, dynamicStyles.inputColor]}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
          {...textInputProps}
        />
        {rightElement}
      </View>
      {helperText && (
        <Text style={[styles.helper, dynamicStyles.helperColor]}>
          {helperText}
        </Text>
      )}
    </View>
  );
}
