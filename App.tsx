import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/store/auth';
import { QueryProvider } from './src/store/queryClient';
import { NavigationContainerWrapper } from './src/utils/navigation';

export default function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <NavigationContainerWrapper />
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryProvider>
  );
}
