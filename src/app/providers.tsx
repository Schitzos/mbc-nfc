import React, { useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { ServiceProvider } from '@presentation/context/service-context';
import { createAppServices } from './container';

enableScreens();

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({
  children,
}: Readonly<AppProvidersProps>): React.JSX.Element {
  const services = useMemo(() => createAppServices(), []);

  return (
    <SafeAreaProvider>
      <ServiceProvider services={services}>
        <NavigationContainer>{children}</NavigationContainer>
      </ServiceProvider>
    </SafeAreaProvider>
  );
}
