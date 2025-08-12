import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../store/auth';
import { Show } from '../types';
import { RootStackParamList } from '../utils/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RoutePropType = RouteProp<RootStackParamList, 'ShowDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ShowDetails'>;

const GUEST_SHOWS_KEY = 'guest_shows';

const ShowDetailsScreen: React.FC = () => {
  const route = useRoute<RoutePropType>();
  const navigation = useNavigation<NavigationProp>();
  const { showId } = route.params;
  const { isGuest } = useAuth();
  const [show, setShow] = useState<Show | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShowDetails();
  }, [showId]);

  const loadShowDetails = async () => {
    try {
      if (isGuest) {
        const guestShows = await AsyncStorage.getItem(GUEST_SHOWS_KEY);
        if (guestShows) {
          const shows: Show[] = JSON.parse(guestShows);
          const foundShow = shows.find(s => s.id === showId);
          if (foundShow) {
            setShow(foundShow);
          } else {
            Alert.alert('Error', 'Show not found');
            navigation.goBack();
          }
        }
      } else {
        // TODO: Load show details from Supabase
        console.log('Loading show details from Supabase (not implemented)');
      }
    } catch (error) {
      console.error('Error loading show details:', error);
      Alert.alert('Error', 'Failed to load show details');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShow = async () => {
    Alert.alert(
      'Remove Show',
      'Are you sure you want to remove this show from your list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isGuest) {
                const guestShows = await AsyncStorage.getItem(GUEST_SHOWS_KEY);
                if (guestShows) {
                  const shows: Show[] = JSON.parse(guestShows);
                  const updatedShows = shows.filter(s => s.id !== showId);
                  await AsyncStorage.setItem(GUEST_SHOWS_KEY, JSON.stringify(updatedShows));
                  Alert.alert('Success', 'Show removed from your list');
                  navigation.goBack();
                }
              } else {
                // TODO: Remove show from Supabase
                Alert.alert('Info', 'Supabase integration not implemented yet');
              }
            } catch (error) {
              console.error('Error removing show:', error);
              Alert.alert('Error', 'Failed to remove show');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!show) {
    return (
      <View style={styles.container}>
        <Text>Show not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{show.title}</Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.status, styles[`status_${show.status}`]]}>
            {show.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Show Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Network:</Text>
          <Text style={styles.infoValue}>{show.network || 'Unknown'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Added:</Text>
          <Text style={styles.infoValue}>
            {new Date(show.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last Updated:</Text>
          <Text style={styles.infoValue}>
            {new Date(show.updatedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Air Dates</Text>
        {show.nextAirDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Next Episode:</Text>
            <Text style={styles.infoValue}>
              {new Date(show.nextAirDate).toLocaleDateString()}
            </Text>
          </View>
        )}
        {show.lastAirDate && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Last Episode:</Text>
            <Text style={styles.infoValue}>
              {new Date(show.lastAirDate).toLocaleDateString()}
            </Text>
          </View>
        )}
        {!show.nextAirDate && !show.lastAirDate && (
          <Text style={styles.noInfoText}>No air date information available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cast & Crew</Text>
        <Text style={styles.placeholderText}>
          Cast information will be displayed here when available
        </Text>
        <Text style={styles.placeholderSubtext}>
          This feature is not yet implemented
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemoveShow}
        >
          <Text style={styles.removeButtonText}>Remove from My Shows</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statusContainer: {
    alignSelf: 'flex-start',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  status_returning: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  status_ended: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  status_cancelled: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  status_unknown: {
    backgroundColor: '#e2e3e5',
    color: '#383d41',
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
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  noInfoText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    padding: 20,
    marginBottom: 20,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShowDetailsScreen;
