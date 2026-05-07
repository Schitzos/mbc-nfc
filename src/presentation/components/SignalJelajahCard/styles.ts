import { StyleSheet } from 'react-native';
import { colors } from '@presentation/theme/colors';
import { radius } from '@presentation/theme/radius';
import { shadows } from '@presentation/theme/shadows';
import { spacing } from '@presentation/theme/spacing';
import { typography } from '@presentation/theme/typography';

export const styles = StyleSheet.create({
  card: {
    width: 292,
    borderRadius: radius.card,
    backgroundColor: colors.surfaceWarm,
    ...shadows.low,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 164,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
  },
  content: {
    padding: spacing.lg,
    backgroundColor: colors.surfaceWarm,
    borderBottomLeftRadius: radius.card,
    borderBottomRightRadius: radius.card,
  },
  title: { ...typography.body1Bold, color: colors.textPrimary, minHeight: 40 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  metaText: { ...typography.body2Regular, color: colors.textPrimary },
  metaDot: {
    width: spacing.xxs,
    height: spacing.xxs,
    borderRadius: spacing.xxs / 2,
    backgroundColor: colors.iconSecondary,
  },
  category: { flex: 1 },
});
