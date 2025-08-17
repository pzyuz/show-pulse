import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { searchShows, getShowDetails, TMDBSearchTVResult } from '../services/tmdb';
import { upsertShow, updateShowPartial } from '../store/localShows';
import { useAuth } from '../store/auth';
import { ShowLite } from '../types';
// removed useFocusEffect-based debounce

export default function AddShowScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const navigation = useNavigation();
  const { isGuest } = useAuth();
  const queryClient = useQueryClient();

  // (Removed external key check; tmdb.ts throws a clear error if truly missing)

  // Debounce search query on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['searchShows', debouncedQuery],
    queryFn: () => searchShows(debouncedQuery),
    enabled: debouncedQuery.length > 1, // search for 2+ chars
    retry: 0,
  });

  const handleAddShow = async (show: TMDBSearchTVResult['results'][0]) => {
    try {
      if (isGuest) {
        const newShow: ShowLite = {
          tmdbId: show.id,
          title: show.name,
          posterUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : undefined,
          status: 'unknown',
          nextAirDate: undefined,
          lastAirDate: undefined,
          network: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await upsertShow(newShow);
        
        // Fetch full details and persist enriched record in background
        // This work is done in background: do not block navigation/goBack
        (async () => {
          try {
            const details = await getShowDetails(show.id);
            const patch: Partial<ShowLite> = {
              status: details.status || undefined,
              nextAirDate: details.next_episode_to_air?.air_date || undefined,
              lastAirDate: details.last_episode_to_air?.air_date || undefined,
              network: details.networks?.[0]?.name || undefined,
            };
            await updateShowPartial(show.id, patch);
          } catch (error) {
            // Silently ignore network errors to avoid UI disruption
            console.warn('Failed to enrich show data:', error);
          }
        })();
        
        // Warm details cache in background so Details screen opens instantly
        queryClient.prefetchQuery({
          queryKey: ['showDetails', show.id],
          queryFn: () => getShowDetails(show.id),
        });
        // go back to list
        navigation.goBack();
      } else {
        // auth path TBD
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add show. Please try again.');
    }
  };

  const renderSearchResult = ({ item }: { item: TMDBSearchTVResult['results'][0] }) => (
    <TouchableOpacity
      style={styles.searchResult}
      onPress={() => handleAddShow(item)}
    >
      <Image
        source={{
          uri: item.poster_path
            ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
            : 'https://via.placeholder.com/200x300?text=No+Poster',
        }}
        style={styles.poster}
        resizeMode="cover"
      />
      <View style={styles.resultInfo}>
        <Text style={styles.showTitle}>{item.name}</Text>
        <Text style={styles.showDate}>
          {item.first_air_date
            ? `First aired: ${new Date(item.first_air_date).getFullYear()}`
            : 'Release date unknown'}
        </Text>
        <Text style={styles.showOverview} numberOfLines={2}>
          {item.overview || 'No description available'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Show</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="Search for TV shows..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus
      />

      {/* (Key banner removed to avoid false alarms) */}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {(error as Error).message || 'Failed to search shows.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              // re-trigger the query for the current debounced term
              queryClient.invalidateQueries({ queryKey: ['searchShows', debouncedQuery] });
            }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {searchResults && searchResults.results.length === 0 && debouncedQuery.length > 1 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No shows found for "{debouncedQuery}"</Text>
        </View>
      )}

      {searchResults && searchResults.results.length > 0 && (
        <FlatList
          data={searchResults.results}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id.toString()}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!debouncedQuery && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>
            Start typing to search for TV shows...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  resultsList: {
    flex: 1,
  },
  searchResult: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  showTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  showDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  showOverview: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
});
