import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../store/auth';
import { useTheme } from '../theme/ThemeProvider';

export default function AuthScreen() {
  const navigation = useNavigation();
  const { signIn, signInAsGuest } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email.trim(), password);
      // Navigation will be handled by the auth context
    } catch (error) {
      Alert.alert('Sign In Failed', 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setIsLoading(true);
    try {
      await signInAsGuest();
      // Navigation will be handled by the auth context
    } catch (error) {
      Alert.alert('Guest Mode Failed', 'Unable to enter guest mode. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Show Pulse</Text>
          <Text style={styles.subtitle}>Track your favorite TV shows</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={theme.text.muted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            accessibilityLabel="Email input"
            accessibilityRole="text"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.text.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
            accessibilityLabel="Password input"
            accessibilityRole="text"
          />

          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Sign in with email and password"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.action.primary.text} />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleGuestMode}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Continue as guest without signing in"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={theme.action.secondary.text} />
            ) : (
              <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Guest mode allows you to try the app without creating an account.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  input: {
    backgroundColor: theme.background.surface,
    borderWidth: 1,
    borderColor: theme.border.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: theme.text.primary,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: theme.action.primary.background,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: theme.special.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: theme.action.primary.text,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: theme.action.secondary.background,
    borderWidth: 2,
    borderColor: theme.action.secondary.background,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: theme.special.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  secondaryButtonText: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: theme.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
