import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { signalColorTokens } from '../theme/colors';
import { radius } from '../theme/radius';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Tone = 'info' | 'warning' | 'error' | 'success';

type Props = {
  tone: Tone;
  eyebrow: string;
  title: string;
  body: string;
  items?: string[];
  children?: ReactNode;
};

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
}: Props): React.JSX.Element {
  const toneToken = toneMap[tone];

  return (
    <View
      style={[
        styles.root,
        {
          borderColor: toneToken.borderColor,
          backgroundColor: toneToken.backgroundColor,
        },
      ]}
    >
      <Text style={[styles.eyebrow, { color: toneToken.eyebrowColor }]}>
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

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.labelBold,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.mobileHeadline2,
    color: signalColorTokens.text.primary,
  },
  body: {
    ...typography.body1Regular,
    color: signalColorTokens.text.secondary,
  },
  list: {
    gap: spacing.xxs,
  },
  listItem: {
    ...typography.body2Regular,
    color: signalColorTokens.text.secondary,
  },
});
