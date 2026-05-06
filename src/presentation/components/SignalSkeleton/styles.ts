import { StyleSheet } from 'react-native';
import { colors, signalColorTokens } from '../../theme/colors';
import { componentTokens } from '../../theme/components';

export const styles = StyleSheet.create({
  title: {
    width: componentTokens.skeleton.title.width,
    height: componentTokens.skeleton.title.height,
    maxWidth: componentTokens.skeleton.title.maxWidth,
    backgroundColor: componentTokens.skeleton.color,
  },
  button: {
    width: componentTokens.skeleton.button.width,
    height: componentTokens.skeleton.button.height,
    borderRadius: componentTokens.skeleton.button.radius,
    backgroundColor: componentTokens.skeleton.color,
  },
  card: {
    width: componentTokens.skeleton.card.width,
    height: componentTokens.skeleton.card.height,
    borderWidth: 1,
    borderColor: componentTokens.skeleton.cardBorderColor,
    borderRadius: componentTokens.skeleton.card.radius,
    backgroundColor: colors.surfaceDefault,
    flexDirection: 'row',
    alignItems: 'center',
    padding: componentTokens.skeleton.card.padding,
    gap: componentTokens.skeleton.card.gap,
  },
  cardAvatar: {
    width: componentTokens.skeleton.card.avatarSize,
    height: componentTokens.skeleton.card.avatarSize,
    borderRadius: componentTokens.skeleton.card.avatarSize / 2,
    backgroundColor: signalColorTokens.background.neutral300,
  },
  cardLine: {
    width: componentTokens.skeleton.card.titleWidth,
    height: componentTokens.skeleton.card.titleHeight,
    backgroundColor: componentTokens.skeleton.color,
  },
});
