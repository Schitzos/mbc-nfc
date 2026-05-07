import { Dimensions, StyleSheet } from 'react-native';
import { colors, signalColorTokens } from '@presentation/theme/colors';
import { componentTokens } from '@presentation/theme/components';
import { shadows } from '@presentation/theme/shadows';
import { typography } from '@presentation/theme/typography';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: colors.surfaceDefault,
    borderTopLeftRadius: componentTokens.bottomSheet.topRadius,
    borderTopRightRadius: componentTokens.bottomSheet.topRadius,
    overflow: 'hidden',
  },
  header: {
    minHeight: 64,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    paddingTop: componentTokens.bottomSheet.headerPaddingTop,
    paddingBottom: 16,
    paddingHorizontal: componentTokens.bottomSheet.horizontalPadding,
  },
  title: {
    ...typography.mobileHeadline2,
    color: signalColorTokens.text.primary,
    flex: 1,
  },
  titleSpacer: { flex: 1 },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    ...typography.titleRegular,
    color: signalColorTokens.text.primary,
  },
  body: {
    paddingHorizontal: componentTokens.bottomSheet.horizontalPadding,
    gap: componentTokens.bottomSheet.componentGap,
  },
  sticky: {
    ...shadows.high,
    gap: componentTokens.bottomSheet.stickyGap,
    paddingTop: componentTokens.bottomSheet.stickyPaddingTop,
    paddingBottom: componentTokens.bottomSheet.stickyPaddingBottom,
    paddingHorizontal: componentTokens.bottomSheet.horizontalPadding,
    backgroundColor: colors.surfaceDefault,
  },
  caption: { ...typography.body2Regular, color: colors.bodySecondary },
});
