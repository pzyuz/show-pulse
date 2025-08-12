import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../store/auth';
import { Show } from '../types';
import { RootStackParamList } from '../utils/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyShows'>;

const GUEST_SHOWS_KEY = 'guest_shows';

const MyShowsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isGuest, user } = useAuth();
  const [shows, setShows] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShows();
  }, []);

  const loadShows = async () => {
    try {
      if (isGuest) {
        const guestShows = await AsyncStorage.getItem(GUEST_SHOWS_KEY);
        if (guestShows) {
          setShows(JSON.parse(guestShows));
        }
      } else {
        // TODO: Load shows from Supabase
        console.log('Loading shows from Supabase (not implemented)');
      }
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowPress = (show: Show) => {
    navigation.navigate('ShowDetails', { showId: show.id });
  };

  const handleAddShow = () => {
    navigation.navigate('AddShow');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const renderShowItem = ({ item }: { item: Show }) => (
    <TouchableOpacity
      style={styles.showItem}
      onPress={() => handleShowPress(item)}
    >
      <View style={styles.showInfo}>
        <Text style={styles.showTitle}>{item.title}</Text>
        <Text style={styles.showStatus}>Status: {item.status}</Text>
        {item.nextAirDate && (
          <Text style={styles.showDate}>Next: {item.nextAirDate}</Text>
        )}
        {item.lastAirDate && (
          <Text style={styles.showDate}>Last: {item.lastAirDate}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user?.name || 'User'}!
        </Text>
        <Text style={styles.modeText}>
          {isGuest ? 'Guest Mode' : 'Authenticated Mode'}
        </Text>
      </View>

      {shows.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No shows tracked yet</Text>
          <Text style={styles.emptySubtitle}>
            Start by adding your favorite TV shows
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddShow}>
            <Text style={styles.addButtonText}>Add Your First Show</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shows}
          renderItem={renderShowItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={handleAddShow}>
          <Text style={styles.footerButtonText}>Add Show</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={handleSettings}>
          <Text style={styles.footerButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modeText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  showItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  showInfo: {
    flex: 1,
  },
  showTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  showStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  showDate: {
    fontSize: 12,
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerButton: {
    flex: 1,
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  footerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MyShowsScreen;
