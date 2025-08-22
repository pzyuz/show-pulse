import React, { useState, useCallback, useMemo, useRef } from 'react';
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
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getShows, removeShow, hydrateMissingFields, toggleFavorite } from '../store/localShows';
import { useAuth } from '../store/auth';
import { ShowLite } from '../types';
import { getStatusColors, normalizeStatus } from '../utils/status';
import FilterBar from '../components/FilterBar';

export default function MyShowsScreen() {
  const [shows, setShows] = useState<ShowLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterNetwork, setFilterNetwork] = useState<string | null>(null);
  const [filterGenres, setFilterGenres] = useState<Set<string>>(new Set());
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Refs to track Swipeable instances for each row
  const swipeableRefs = useRef<{ [tmdbId: number]: Swipeable | null }>({});
  
  const navigation = useNavigation();
  const { isGuest } = useAuth();

  // Compute available filter options from current shows
  const options = useMemo(() => {
    const status = new Set<string>();
    const network = new Set<string>();
    const genres = new Set<string>();
    
    shows.forEach(s => {
      if (s.status && s.status.toLowerCase() !== 'unknown') status.add(s.status);
      if (s.network) network.add(s.network);
      (s.genres ?? []).forEach(g => genres.add(g));
    });
    
    return {
      status: Array.from(status).sort(),
      network: Array.from(network).sort(),
      genres: Array.from(genres).sort(),
    };
  }, [shows]);

  // Derive filtered list based on active filters
  const filtered = useMemo(() => {
    return shows.filter(s => {
      if (filterStatus && (s.status ?? '').toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (filterNetwork && (s.network ?? '') !== filterNetwork) return false;
      if (filterGenres.size > 0) {
        const g = new Set(s.genres ?? []);
        for (const need of filterGenres) if (!g.has(need)) return false;
      }
      if (filterFavorites && !s.isFavorite) return false;
      return true;
    });
  }, [shows, filterStatus, filterNetwork, filterGenres, filterFavorites]);

  const loadShows = useCallback(async () => {
    try {
      if (isGuest) {
        const localShows = await getShows();
        setShows(localShows);
        
        // Hydrate missing fields in background if any item lacks status and both air dates
        const needsHydration = localShows.some(show => 
          (!show.status || show.status.toLowerCase() === 'unknown') && 
          !show.nextAirDate && 
          !show.lastAirDate
        );
        
        if (needsHydration) {
          // Run hydration in background, then reload to show updates
          hydrateMissingFields(localShows).then(() => {
            // Reload the list from storage so users see updates
            getShows().then(updatedShows => {
              setShows(updatedShows);
            }).catch(console.warn);
          }).catch(console.warn);
        }
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

  // Clean up swipeable refs when shows change significantly
  React.useEffect(() => {
    return () => {
      // Cleanup on unmount
      swipeableRefs.current = {};
    };
  }, []);

  // Clean up refs for shows that no longer exist
  React.useEffect(() => {
    const currentTmdbIds = new Set(shows.map(s => s.tmdbId));
    Object.keys(swipeableRefs.current).forEach(tmdbIdStr => {
      const tmdbId = parseInt(tmdbIdStr, 10);
      if (!currentTmdbIds.has(tmdbId)) {
        delete swipeableRefs.current[tmdbId];
      }
    });
  }, [shows]);

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
              // Clean up the ref when show is removed
              delete swipeableRefs.current[show.tmdbId];
            } catch (error) {
              Alert.alert('Error', 'Failed to remove show. Please try again.');
            } finally {
              // Close the swipeable regardless of success/failure
              const swipeable = swipeableRefs.current[show.tmdbId];
              if (swipeable) {
                swipeable.close();
              }
            }
          },
        },
      ]
    );
  };

  const handleShowPress = (show: ShowLite) => {
    navigation.navigate('ShowDetails' as never, { tmdbId: show.tmdbId } as never);
  };

  const handleClearFilters = () => {
    setFilterStatus(null);
    setFilterNetwork(null);
    setFilterGenres(new Set());
    setFilterFavorites(false);
    setShowFilters(false);
  };

  const renderRightActions = (onDelete: () => void) => (
    <TouchableOpacity
      accessibilityLabel="Delete show"
      onPress={onDelete}
      style={styles.rightAction}
      activeOpacity={0.8}
    >
      <Text style={styles.rightActionText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = (show: ShowLite) => (
    <TouchableOpacity
      accessibilityLabel={show.isFavorite ? "Remove from favorites" : "Add to favorites"}
      onPress={async () => {
        try {
          await toggleFavorite(show.tmdbId);
          setShows(prev => prev.map(s => 
            s.tmdbId === show.tmdbId 
              ? { ...s, isFavorite: !s.isFavorite, updatedAt: new Date().toISOString() }
              : s
          ));
        } catch (error) {
          Alert.alert('Error', 'Failed to update favorite status. Please try again.');
        } finally {
          // Close the swipeable regardless of success/failure
          const swipeable = swipeableRefs.current[show.tmdbId];
          if (swipeable) {
            swipeable.close();
          }
        }
      }}
      style={styles.leftAction}
      activeOpacity={0.8}
    >
      <Text style={styles.leftActionText}>
        {show.isFavorite ? '★' : '☆'}
      </Text>
    </TouchableOpacity>
  );

  const renderShow = useCallback(({ item }: { item: ShowLite }) => {
    const normalized = normalizeStatus(item.status);
    const statusStyle = normalized ? getStatusColors(normalized) : null;
    
    return (
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current[item.tmdbId] = ref;
          }
        }}
        renderLeftActions={() => renderLeftActions(item)}
        renderRightActions={() => renderRightActions(() => handleDeleteShow(item))}
      >
        <TouchableOpacity
          style={styles.showItem}
          onPress={() => handleShowPress(item)}
        >
          <Image
            source={{
              uri: item.posterUrl || 'https://via.placeholder.com/200x300?text=No+Poster',
            }}
            style={styles.poster}
            resizeMode="cover"
          />
          <View style={styles.showInfo}>
            {/* Favorite star marker */}
            {item.isFavorite && (
              <View style={styles.favoriteMarker}>
                <Text style={styles.favoriteStar}>★</Text>
              </View>
            )}
            
            <Text style={styles.showTitle} numberOfLines={2}>
              {item.title}
            </Text>
            
            {/* Only render status pill if status is truthy and not "unknown" (case-insensitive) */}
            {!!normalized && normalized.toLowerCase() !== 'unknown' && statusStyle && (
              <View style={[styles.statusContainer, { backgroundColor: statusStyle.backgroundColor }]}>
                <Text style={[styles.statusText, { color: statusStyle.textColor }]}>{normalized}</Text>
              </View>
            )}
            
            {/* Show one compact line: Next air date takes priority, then last air date */}
            {(item.nextAirDate || item.lastAirDate) && (
              <Text style={styles.airDate}>
                {item.nextAirDate 
                  ? `Next: ${new Date(item.nextAirDate).toLocaleDateString()}`
                  : `Last: ${new Date(item.lastAirDate!).toLocaleDateString()}`
                }
              </Text>
            )}
            
            {/* Show network as small secondary text under the date line */}
            {item.network && (
              <Text style={styles.network}>{item.network}</Text>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }, [handleDeleteShow, handleShowPress, renderLeftActions, renderRightActions]);

  const keyExtractor = useCallback((item: ShowLite) => item.tmdbId.toString(), []);

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
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No shows match filters</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your filter criteria
          </Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={handleClearFilters}
          >
            <Text style={styles.emptyAddButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FilterBar
            options={options}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterNetwork={filterNetwork}
            setFilterNetwork={setFilterNetwork}
            filterGenres={filterGenres}
            setFilterGenres={setFilterGenres}
            filterFavorites={filterFavorites}
            setFilterFavorites={setFilterFavorites}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
          />
          <FlatList
            data={filtered}
            renderItem={renderShow}
            keyExtractor={keyExtractor}
            style={styles.showsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        </>
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
    position: 'relative',
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  rightAction: {
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  rightActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  leftAction: {
    backgroundColor: '#ffd700', // Gold color for favorites
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  leftActionText: {
    fontSize: 24, // Larger font for the star
    fontWeight: 'bold',
    color: '#333',
  },
  favoriteMarker: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ffd700', // Gold color for favorites
    borderRadius: 10,
    padding: 4,
  },
  favoriteStar: {
    fontSize: 20,
    color: '#333',
  },
});
