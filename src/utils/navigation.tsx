import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/auth';
import { useTheme } from '../theme/ThemeProvider';
import AuthScreen from '../screens/AuthScreen';
import MyShowsScreen from '../screens/MyShowsScreen';
import AddShowScreen from '../screens/AddShowScreen';
import ShowDetailsScreen from '../screens/ShowDetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Auth: undefined;
  MyShows: undefined;
  AddShow: undefined;
  ShowDetails: { tmdbId: number };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const NavigationContainerWrapper: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return null; // You could add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background.header,
          },
          headerTintColor: theme.text.inverse,
          headerTitleStyle: {
            fontWeight: 'bold',
            color: theme.text.inverse,
          },
          headerTitle: '',
          headerShadowVisible: false,
        }}
      >
        {!user ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerTitle: '' }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="MyShows" 
              component={MyShowsScreen} 
              options={{ headerTitle: '' }}
            />
            <Stack.Screen 
              name="AddShow" 
              component={AddShowScreen} 
              options={{ headerTitle: '' }}
            />
            <Stack.Screen 
              name="ShowDetails" 
              component={ShowDetailsScreen} 
              options={{ headerTitle: '' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ headerTitle: '' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
