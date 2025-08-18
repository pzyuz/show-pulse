import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/store/auth';
import { QueryProvider } from './src/store/queryClient';
import { NavigationContainerWrapper } from './src/utils/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <AuthProvider>
          <NavigationContainerWrapper />
          <StatusBar style="auto" />
        </AuthProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
