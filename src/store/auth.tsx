import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_USER_KEY = '@sp:guest_user';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(GUEST_USER_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsGuest(true);
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async () => {
    try {
      const guestUser: User = {
        id: 'guest',
        name: 'Guest User',
        email: 'guest@showpulse.app',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser));
      setUser(guestUser);
      setIsGuest(true);
    } catch (error) {
      console.error('Error signing in as guest:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (isGuest) {
        // Clear all guest data including theme preference
        await AsyncStorage.multiRemove([
          GUEST_USER_KEY,
          '@sp:shows',
          '@sp:guest_shows',
          '@sp:theme'
        ]);
      }
      
      setUser(null);
      setIsGuest(false);
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if clearing storage fails, reset the state
      setUser(null);
      setIsGuest(false);
    }
  };

  const value: AuthContextType = {
    user,
    isGuest,
    isLoading,
    signInAsGuest,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
