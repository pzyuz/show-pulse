import 'react-native-gesture-handler';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/store/auth';
import { QueryProvider } from './src/store/queryClient';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { NavigationContainerWrapper } from './src/utils/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <NavigationContainerWrapper />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
