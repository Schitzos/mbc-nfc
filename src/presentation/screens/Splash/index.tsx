import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '@app/navigation';

const splashImage = require('@presentation/assets/app-splash-screen.png');

export function SplashScreen(): React.JSX.Element {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    BootSplash.hide({ fade: true });
    const timer = setTimeout(() => {
      navigation.replace('roleSwitcher');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={splashImage} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { width: '100%', height: '100%' },
});
