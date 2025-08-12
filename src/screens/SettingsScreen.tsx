import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../store/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen: React.FC = () => {
  const { user, isGuest, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);

  const handleNotificationToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    // TODO: Implement notification settings persistence
    Alert.alert(
      'Notifications',
      `Push notifications ${value ? 'enabled' : 'disabled'}`,
      [{ text: 'OK' }]
    );
  };

  const handleEmailNotificationToggle = (value: boolean) => {
    setEmailNotifications(value);
    // TODO: Implement email notification settings persistence
    Alert.alert(
      'Email Notifications',
      `Email notifications ${value ? 'enabled' : 'disabled'}`,
      [{ text: 'OK' }]
    );
  };

  const handleExportData = async () => {
    try {
      if (isGuest) {
        const guestShows = await AsyncStorage.getItem('guest_shows');
        const guestUser = await AsyncStorage.getItem('guest_user');
        
        const exportData = {
          user: guestUser ? JSON.parse(guestUser) : null,
          shows: guestShows ? JSON.parse(guestShows) : [],
          exportedAt: new Date().toISOString(),
        };

        // In a real app, you'd save this to a file or share it
        console.log('Export data:', JSON.stringify(exportData, null, 2));
        Alert.alert(
          'Data Exported',
          'Your data has been exported to the console. In a real app, this would be saved to a file.',
          [{ text: 'OK' }]
        );
      } else {
        // TODO: Export data from Supabase
        Alert.alert('Info', 'Supabase export not implemented yet');
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleDeleteData = async () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isGuest) {
                await AsyncStorage.removeItem('guest_shows');
                await AsyncStorage.removeItem('guest_user');
                Alert.alert('Success', 'All data deleted');
                // Sign out after deleting data
                await signOut();
              } else {
                // TODO: Delete data from Supabase
                Alert.alert('Info', 'Supabase delete not implemented yet');
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete data');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{user?.name || 'Unknown'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mode:</Text>
          <Text style={styles.infoValue}>
            {isGuest ? 'Guest Mode' : 'Authenticated Mode'}
          </Text>
        </View>
        {user?.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#767577', true: '#f4511e' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Email Notifications</Text>
          <Switch
            value={emailNotifications}
            onValueChange={handleEmailNotificationToggle}
            trackColor={{ false: '#767577', true: '#f4511e' }}
            thumbColor={emailNotifications ? '#fff' : '#f4f3f4'}
          />
        </View>
        <Text style={styles.settingNote}>
          Note: Notification settings are not yet persisted
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <Text style={styles.buttonText}>Export My Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleDeleteData}
        >
          <Text style={styles.dangerButtonText}>Delete All Data</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity
          style={[styles.button, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Show Pulse v1.0.0
        </Text>
        <Text style={styles.footerSubtext}>
          Built with React Native & Expo
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingNote: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerButton: {
    backgroundColor: '#dc3545',
  },
  dangerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: '#6c757d',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SettingsScreen;
