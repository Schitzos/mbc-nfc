import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './navigation';
import { AppProviders } from './providers';

function App(): React.JSX.Element {
  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </AppProviders>
  );
}

export default App;
