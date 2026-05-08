import { StyleSheet } from 'react-native';
import { colors } from '@presentation/theme/colors';
import { radius } from '@presentation/theme/radius';
import { shadows } from '@presentation/theme/shadows';
import { spacing } from '@presentation/theme/spacing';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceDefault,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.md,
    ...shadows.low,
  },
});
