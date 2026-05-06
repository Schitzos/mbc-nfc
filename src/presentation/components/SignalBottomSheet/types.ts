import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface SignalBottomSheetProps {
  visible: boolean;
  title?: string;
  caption?: string;
  children?: ReactNode;
  stickyAction?: ReactNode;
  onClose?: () => void;
  style?: StyleProp<ViewStyle>;
}
