import { StyleSheet } from 'react-native';
import { signalColorTokens } from '@presentation/theme/colors';
import { radius } from '@presentation/theme/radius';
import { spacing } from '@presentation/theme/spacing';
import { typography } from '@presentation/theme/typography';

export const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  eyebrow: { ...typography.labelBold, textTransform: 'uppercase' },
  title: {
    ...typography.mobileHeadline2,
    color: signalColorTokens.text.primary,
  },
  body: { ...typography.body1Regular, color: signalColorTokens.text.secondary },
  list: { gap: spacing.xxs },
  listItem: {
    ...typography.body2Regular,
    color: signalColorTokens.text.secondary,
  },
});
