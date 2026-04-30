import React from 'react';
import {
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '../theme/colors';
import { radius } from '../theme/radius';
import { shadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type SignalJelajahCardProps = {
  title: string;
  date: string;
  category: string;
  imageSource: ImageSourcePropType;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

export function SignalJelajahCard({
  title,
  date,
  category,
  imageSource,
  style,
  imageStyle,
}: SignalJelajahCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Image source={imageSource} style={[styles.image, imageStyle]} resizeMode="cover" />

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {title}
        </Text>

        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={styles.metaText}>
            {date}
          </Text>
          <View style={styles.metaDot} />
          <Text numberOfLines={1} style={[styles.metaText, styles.category]}>
            {category}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  title: {
    ...typography.body1Bold,
    color: colors.textPrimary,
    minHeight: 40,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  metaText: {
    ...typography.body2Regular,
    color: colors.textPrimary,
  },
  metaDot: {
    width: spacing.xxs,
    height: spacing.xxs,
    borderRadius: spacing.xxs / 2,
    backgroundColor: colors.iconSecondary,
  },
  category: {
    flex: 1,
  },
});
