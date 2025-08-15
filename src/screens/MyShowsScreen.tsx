import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getShows, removeShow } from '../store/localShows';
import { useAuth } from '../store/auth';
import { ShowLite } from '../types';

export default function MyShowsScreen() {
  const [shows, setShows] = useState<ShowLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { isGuest } = useAuth();

  const loadShows = useCallback(async () => {
    try {
      if (isGuest) {
        const localShows = await getShows();
        setShows(localShows);
      } else {
        // TODO: Load from Supabase
        setShows([]);
      }
    } catch (error) {
      console.error('Error loading shows:', error);
      Alert.alert('Error', 'Failed to load shows. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useFocusEffect(
    useCallback(() => {
      loadShows();
    }, [loadShows])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadShows();
    setRefreshing(false);
  };

  const handleDeleteShow = (show: ShowLite) => {
    Alert.alert(
      'Remove Show',
      `Are you sure you want to remove "${show.title}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeShow(show.tmdbId);
              setShows(prev => prev.filter(s => s.tmdbId !== show.tmdbId));
            } catch (error) {
              Alert.alert('Error', 'Failed to remove show. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleShowPress = (show: ShowLite) => {
    navigation.navigate('ShowDetails' as never, { tmdbId: show.tmdbId } as never);
  };

  const renderShow = ({ item }: { item: ShowLite }) => (
    <TouchableOpacity
      style={styles.showItem}
      onPress={() => handleShowPress(item)}
      onLongPress={() => handleDeleteShow(item)}
    >
      <Image
        source={{
          uri: item.posterUrl || 'https://via.placeholder.com/200x300?text=No+Poster',
        }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.showInfo}>
        <Text style={styles.showTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        {item.status && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
        
        {item.nextAirDate && (
          <Text style={styles.airDate}>
            Next: {new Date(item.nextAirDate).toLocaleDateString()}
          </Text>
        )}
        
        {item.lastAirDate && !item.nextAirDate && (
          <Text style={styles.airDate}>
            Last: {new Date(item.lastAirDate).toLocaleDateString()}
          </Text>
        )}
        
        {item.network && (
          <Text style={styles.network}>{item.network}</Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteShow(item)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your shows...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings' as never)}>
          <Text style={styles.headerLink}>Settings</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Shows</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddShow' as never)}>
          <Text style={styles.headerLink}>Add</Text>
        </TouchableOpacity>
      </View>

      {shows.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No shows yet</Text>
          <Text style={styles.emptySubtitle}>
            Start by adding your favorite TV shows
          </Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={() => navigation.navigate('AddShow' as never)}
          >
            <Text style={styles.emptyAddButtonText}>Add Your First Show</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={shows}
          renderItem={renderShow}
          keyExtractor={(item) => item.tmdbId.toString()}
          style={styles.showsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerLink: { fontSize: 16, fontWeight: '600', color: '#007AFF' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  showsList: {
    flex: 1,
  },
  showItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 16,
  },
  showInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  showTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 22,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
  },
  airDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  network: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ff3b30',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
});
