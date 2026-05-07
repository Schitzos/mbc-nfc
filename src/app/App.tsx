import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './navigation';
import { AppProviders } from './providers';
import { ErrorBoundary } from '../presentation/components/ErrorBoundary';

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <AppProviders>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </AppProviders>
    </ErrorBoundary>
  );
}

export default App;
