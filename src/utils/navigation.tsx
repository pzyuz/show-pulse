import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/auth';
import AuthScreen from '../screens/AuthScreen';
import MyShowsScreen from '../screens/MyShowsScreen';
import AddShowScreen from '../screens/AddShowScreen';
import ShowDetailsScreen from '../screens/ShowDetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Auth: undefined;
  MyShows: undefined;
  AddShow: undefined;
  ShowDetails: { showId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const NavigationContainerWrapper: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // You could add a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!user ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ title: 'Show Pulse' }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="MyShows" 
              component={MyShowsScreen} 
              options={{ title: 'My Shows' }}
            />
            <Stack.Screen 
              name="AddShow" 
              component={AddShowScreen} 
              options={{ title: 'Add Show' }}
            />
            <Stack.Screen 
              name="ShowDetails" 
              component={ShowDetailsScreen} 
              options={{ title: 'Show Details' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen} 
              options={{ title: 'Settings' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
