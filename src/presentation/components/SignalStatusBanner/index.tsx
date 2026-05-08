import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { signalColorTokens } from '@presentation/theme/colors';
import type { SignalStatusBannerProps, Tone } from './types';
import { styles } from './styles';

export type { SignalStatusBannerProps, Tone } from './types';

const toneMap = {
  info: {
    borderColor: signalColorTokens.stroke.info,
    backgroundColor: signalColorTokens.background.info,
    eyebrowColor: signalColorTokens.text.info,
  },
  warning: {
    borderColor: signalColorTokens.stroke.warning,
    backgroundColor: signalColorTokens.background.warning,
    eyebrowColor: signalColorTokens.text.warning,
  },
  error: {
    borderColor: signalColorTokens.stroke.error,
    backgroundColor: signalColorTokens.background.error,
    eyebrowColor: signalColorTokens.text.error,
  },
  success: {
    borderColor: signalColorTokens.stroke.valid,
    backgroundColor: signalColorTokens.background.valid,
    eyebrowColor: signalColorTokens.text.valid,
  },
} as const satisfies Record<
  Tone,
  { borderColor: string; backgroundColor: string; eyebrowColor: string }
>;

export function SignalStatusBanner({
  tone,
  eyebrow,
  title,
  body,
  items,
  children,
}: Readonly<SignalStatusBannerProps>): React.JSX.Element {
  const toneToken = toneMap[tone];

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        rootTone: {
          borderColor: toneToken.borderColor,
          backgroundColor: toneToken.backgroundColor,
        },
        eyebrowColor: { color: toneToken.eyebrowColor },
      }),
    [toneToken],
  );

  return (
    <View style={[styles.root, dynamicStyles.rootTone]}>
      <Text style={[styles.eyebrow, dynamicStyles.eyebrowColor]}>
        {eyebrow}
      </Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      {items?.length ? (
        <View style={styles.list}>
          {items.map(item => (
            <Text key={item} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>
      ) : null}
      {children}
    </View>
  );
}
