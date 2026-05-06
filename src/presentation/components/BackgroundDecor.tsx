import React from 'react';
import { useWindowDimensions, View } from 'react-native';

type Variant = 'roleSwitcher' | 'station' | 'gate' | 'terminal' | 'scout';

type Props = { variant?: Variant };

export function BackgroundDecor({
  variant = 'roleSwitcher',
}: Props): React.JSX.Element {
  const { height } = useWindowDimensions();
  return (
    <View
      className="absolute inset-0 overflow-hidden"
      style={{ minHeight: height }}
      pointerEvents="none"
    >
      {/* Top-right circle */}
      <View
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full"
        style={{
          backgroundColor: variant === 'scout' ? '#0050AE' : '#FF0025',
          opacity: 0.06,
        }}
      />
      {/* Bottom-left large circle */}
      <View
        className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full"
        style={{
          backgroundColor: '#001A41',
          opacity: 0.04,
        }}
      />
      {/* Mid-right diamond */}
      <View
        className="absolute right-6 top-1/3 h-16 w-16"
        style={{
          backgroundColor:
            variant === 'gate'
              ? '#008E53'
              : variant === 'terminal'
                ? '#FDA22B'
                : '#FF0025',
          opacity: 0.05,
          transform: [{ rotate: '45deg' }],
          borderRadius: 4,
        }}
      />
      {/* Small dot accent */}
      <View
        className="absolute bottom-1/4 left-8 h-6 w-6 rounded-full"
        style={{ backgroundColor: '#001A41', opacity: 0.07 }}
      />
    </View>
  );
}
