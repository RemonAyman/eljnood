import React from 'react';
import { LogBox, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store/themeStore';

// Silence non-critical library deprecations and notifications in dev
LogBox.ignoreLogs([
  'InteractionManager has been deprecated',
  '@firebase/auth',
  'You are initializing Firebase Auth for React Native without providing AsyncStorage',
  'Setting a timer',
  'AsyncStorage',
]);

export default function App() {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  return (
    <SafeAreaProvider>
      <StatusBar style={isDarkMode ? 'light' : 'light'} />
      <View style={{ flex: 1, backgroundColor: isDarkMode ? '#111827' : '#FAF7F2' }}>
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}
