import { StyleSheet } from 'react-native';
import { signalColorTokens } from '@presentation/theme/colors';
import { componentTokens } from '@presentation/theme/components';
import { typography } from '@presentation/theme/typography';

export const styles = StyleSheet.create({
  root: { width: componentTokens.textField.width },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: componentTokens.textField.labelGap,
  },
  label: { ...typography.body1Regular },
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
  input: { ...typography.body1Regular, flex: 1, minWidth: 0, padding: 0 },
  helper: {
    ...typography.body2Regular,
    marginTop: componentTokens.textField.helperGap,
  },
});
