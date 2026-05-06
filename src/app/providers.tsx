import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

enableScreens();

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({
  children,
}: Readonly<AppProvidersProps>): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer>{children}</NavigationContainer>
    </SafeAreaProvider>
  );
}
