import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

const GUEST_USER_KEY = 'guest_user';
const GUEST_SHOWS_KEY = 'guest_shows';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGuestUser();
  }, []);

  const loadGuestUser = async () => {
    try {
      const guestUser = await AsyncStorage.getItem(GUEST_USER_KEY);
      if (guestUser) {
        const parsedUser = JSON.parse(guestUser);
        setUser(parsedUser);
        setIsGuest(true);
      }
    } catch (error) {
      console.error('Error loading guest user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async () => {
    try {
      const guestUser: User = {
        id: 'guest',
        name: 'Guest User',
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
      await AsyncStorage.removeItem(GUEST_USER_KEY);
      await AsyncStorage.removeItem(GUEST_SHOWS_KEY);
      setUser(null);
      setIsGuest(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isGuest,
    isLoading,
    signInAsGuest,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
