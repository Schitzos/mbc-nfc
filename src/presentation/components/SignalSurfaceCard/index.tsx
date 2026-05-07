import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { styles } from './styles';

interface SignalSurfaceCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SignalSurfaceCard({
  children,
  style,
}: Readonly<SignalSurfaceCardProps>): React.JSX.Element {
  return <View style={[styles.card, style]}>{children}</View>;
}
