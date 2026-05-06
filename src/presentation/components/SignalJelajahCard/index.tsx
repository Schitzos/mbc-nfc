import React from 'react';
import { Image, Text, View } from 'react-native';
import type { SignalJelajahCardProps } from './types';
import { styles } from './styles';

export type { SignalJelajahCardProps } from './types';

export function SignalJelajahCard({
  title,
  date,
  category,
  imageSource,
  style,
  imageStyle,
}: Readonly<SignalJelajahCardProps>) {
  return (
    <View style={[styles.card, style]}>
      <Image
        source={imageSource}
        style={[styles.image, imageStyle]}
        resizeMode="cover"
      />
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
