import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => (
  <GestureHandlerRootView style={{flex: 1}}>
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#060E20" />
      <AppNavigator />
      <Toast />
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
