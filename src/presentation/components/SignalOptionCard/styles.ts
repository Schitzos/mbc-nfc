import { StyleSheet } from 'react-native';
import { componentTokens } from '../../theme/components';
import { typography } from '../../theme/typography';

export const styles = StyleSheet.create({
  base: {
    width: componentTokens.optionCard.width,
    minHeight: componentTokens.optionCard.minHeight,
    borderWidth: componentTokens.optionCard.borderWidth,
    borderRadius: componentTokens.optionCard.radius,
    justifyContent: 'center',
    paddingHorizontal: componentTokens.optionCard.paddingHorizontal,
    paddingVertical: componentTokens.optionCard.paddingVertical,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: componentTokens.optionCard.gap,
  },
  title: {
    ...typography.body1Bold,
    flexShrink: 1,
  },
});
