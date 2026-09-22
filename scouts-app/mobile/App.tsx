import React from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';

// Silence non-critical library deprecations and notifications in dev
LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
  '@firebase/auth',
  'You are initializing Firebase Auth for React Native without providing AsyncStorage',
  'Setting a timer',
  'AsyncStorage',
]);


export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
