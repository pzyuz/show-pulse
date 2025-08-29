import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../store/auth';
import { useTheme } from '../theme/ThemeProvider';
import { getShows } from '../store/localShows';
import { ShowLite } from '../types';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user, isGuest, signOut } = useAuth();
  const { theme, themeMode, setThemeMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExportData = async () => {
    if (!isGuest) {
      Alert.alert('Coming Soon', 'Data export will be available for authenticated users soon!');
      return;
    }

    try {
      setExporting(true);
      const shows = await getShows();
      
      const exportData = {
        exportedAt: new Date().toISOString(),
        user: user,
        shows: shows,
        totalShows: shows.length,
      };

      // In a real app, you might want to share this data or save to file
      console.log('=== EXPORTED DATA ===');
      console.log(JSON.stringify(exportData, null, 2));
      console.log('=====================');

      Alert.alert(
        'Data Exported',
        `Successfully exported ${shows.length} shows to console.\n\nCheck your console/logs to see the exported data.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!isGuest) {
      Alert.alert('Coming Soon', 'Data deletion will be available for authenticated users soon!');
      return;
    }

    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your shows and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              
              // Clear AsyncStorage for guest mode including theme preference
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              await AsyncStorage.multiRemove([
                '@sp:shows',
                '@sp:guest_user',
                '@sp:guest_shows',
                '@sp:theme'
              ]);
              
              // Reset theme to light after clearing storage
              setThemeMode('light');

              Alert.alert(
                'Data Deleted',
                'All your data has been successfully deleted.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Sign out and go back to auth
                      signOut();
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Delete Failed', 'Unable to delete your data. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
          },
        },
      ]
    );
  };

  const styles = createStyles(theme);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          {isGuest ? 'Guest Mode' : 'Authenticated User'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Theme</Text>
            <Text style={styles.settingDescription}>
              Choose between light and dark themes
            </Text>
          </View>
          <View style={styles.themeToggle}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'light' && styles.themeOptionActive
              ]}
              onPress={() => setThemeMode('light')}
              accessibilityRole="button"
              accessibilityLabel="Light theme"
              accessibilityState={{ selected: themeMode === 'light' }}
            >
              <Text style={[
                styles.themeOptionText,
                themeMode === 'light' && styles.themeOptionTextActive
              ]}>
                ☀️ Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'dark' && styles.themeOptionActive
              ]}
              onPress={() => setThemeMode('dark')}
              accessibilityRole="button"
              accessibilityLabel="Dark theme"
              accessibilityState={{ selected: themeMode === 'dark' }}
            >
              <Text style={[
                styles.themeOptionText,
                themeMode === 'dark' && styles.themeOptionTextActive
              ]}>
                🌙 Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>
              Get notified about show updates and new episodes
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: theme.border.secondary, true: theme.action.primary.background }}
            thumbColor={notificationsEnabled ? theme.action.primary.text : theme.background.secondary}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive email updates about your shows
            </Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: theme.border.secondary, true: theme.action.primary.background }}
            thumbColor={emailNotifications ? theme.action.primary.text : theme.background.secondary}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.exportButton]}
          onPress={handleExportData}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={theme.action.primary.background} />
          ) : (
            <Text style={styles.exportButtonText}>📤 Export My Data</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteAllData}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={theme.action.destructive.text} />
          ) : (
            <Text style={styles.deleteButtonText}>🗑️ Delete All Data</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>User ID</Text>
            <Text style={styles.settingValue}>{user?.id || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Name</Text>
            <Text style={styles.settingValue}>{user?.name || 'N/A'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.actionButton, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>App Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Build</Text>
            <Text style={styles.settingValue}>Development</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    backgroundColor: theme.background.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: theme.text.secondary,
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: theme.background.surface,
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.subtle,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.text.primary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 20,
  },
  settingValue: {
    fontSize: 16,
    color: theme.action.primary.background,
    fontWeight: '500',
  },
  themeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.ui.chip.default.background,
    borderWidth: 1,
    borderColor: theme.ui.chip.default.border,
  },
  themeOptionActive: {
    backgroundColor: theme.ui.chip.selected.background,
    borderColor: theme.ui.chip.selected.border,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.ui.chip.default.text,
  },
  themeOptionTextActive: {
    color: theme.ui.chip.selected.text,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  exportButton: {
    backgroundColor: theme.ui.chip.default.background,
    borderWidth: 1,
    borderColor: theme.action.primary.background,
  },
  exportButtonText: {
    color: theme.action.primary.background,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: theme.status.danger.background,
    borderWidth: 1,
    borderColor: theme.status.danger.background,
  },
  deleteButtonText: {
    color: theme.status.danger.text,
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: theme.action.secondary.background,
    borderWidth: 1,
    borderColor: theme.action.secondary.background,
  },
  signOutButtonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
