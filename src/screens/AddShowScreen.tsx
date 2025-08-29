import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
import { useTheme } from '../theme/ThemeProvider';
import { searchShows, getShowDetails } from '../services/tmdb';
import { upsertShow, getShows } from '../store/localShows';
import { ShowLite, TMDBSearchResult } from '../types';

export default function AddShowScreen() {
  const navigation = useNavigation();
  const { isGuest } = useAuth();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  // Load existing shows to populate addedIds
  useEffect(() => {
    const loadExistingShows = async () => {
      try {
        const existingShows = await getShows();
        const existingIds = new Set(existingShows.map(show => show.tmdbId));
        setAddedIds(existingIds);
      } catch (error) {
        console.warn('Failed to load existing shows:', error);
      }
    };
    
    loadExistingShows();
  }, []);

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

  const handleAddShow = async (show: TMDBSearchResult) => {
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
        
        // Update addedIds to include the newly added show
        setAddedIds(prev => new Set([...prev, show.id]));
        
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

  const handleShowPress = (show: TMDBSearchResult) => {
    if (addedIds.has(show.id)) {
      // Navigate to details if already added
      navigation.navigate('ShowDetails' as never, { tmdbId: show.id } as never);
    } else {
      // Add the show if not already added
      handleAddShow(show);
    }
  };

  const renderSearchResult = ({ item }: { item: TMDBSearchResult }) => {
    const alreadyAdded = addedIds.has(item.id);
    
    return (
      <View style={styles.searchResult}>
        <TouchableOpacity
          style={styles.showItem}
          onPress={() => handleShowPress(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}${alreadyAdded ? ', already added, tap to view details' : ', tap to add to my shows'}`}
        >
          {item.poster_path ? (
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w92${item.poster_path}` }}
              style={styles.poster}
              accessibilityLabel={`Poster for ${item.name}`}
            />
          ) : (
            <View style={styles.posterPlaceholder}>
              <Text style={styles.posterPlaceholderText}>📺</Text>
            </View>
          )}
          
          <View style={styles.showInfo}>
            <Text style={styles.showTitle} numberOfLines={2}>
              {item.name}
            </Text>
            {item.first_air_date && (
              <Text style={styles.showYear}>
                {new Date(item.first_air_date).getFullYear()}
              </Text>
            )}
            {item.overview && (
              <Text style={styles.showOverview} numberOfLines={2}>
                {item.overview}
              </Text>
            )}
          </View>

          {alreadyAdded && (
            <View style={styles.alreadyAddedBadge}>
              <Text style={styles.alreadyAddedText}>✓ Added</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for TV shows..."
          placeholderTextColor={theme.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          returnKeyType="search"
          accessibilityLabel="Search for TV shows"
          accessibilityRole="search"
        />
      </View>

      {/* (Key banner removed to avoid false alarms) */}

      {/* Error UI */}
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
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading state */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.action.primary.background} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}

      {/* Search results */}
      {searchResults && searchResults.results.length > 0 && (
        <FlatList
          data={searchResults.results}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id.toString()}
          style={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Empty state */}
      {searchResults && searchResults.results.length === 0 && debouncedQuery.length > 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No shows found</Text>
          <Text style={styles.emptySubtitle}>
            Try searching for a different title or check your spelling.
          </Text>
        </View>
      )}

      {/* Initial state */}
      {!searchResults && !isLoading && debouncedQuery.length === 0 && (
        <View style={styles.initialContainer}>
          <Text style={styles.initialTitle}>Search for TV Shows</Text>
          <Text style={styles.initialSubtitle}>
            Start typing to search for shows to add to your list.
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  searchContainer: {
    backgroundColor: theme.background.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  searchInput: {
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text.primary,
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  errorContainer: {
    backgroundColor: theme.status.danger.background,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: theme.status.danger.text,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: theme.status.danger.text,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.status.danger.background,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.text.secondary,
  },
  resultsList: {
    flex: 1,
  },
  searchResult: {
    backgroundColor: theme.background.surface,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  showItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 16,
  },
  posterPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: theme.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  posterPlaceholderText: {
    fontSize: 24,
    color: theme.text.muted,
  },
  showInfo: {
    flex: 1,
    marginRight: 16,
  },
  showTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
    lineHeight: 22,
  },
  showYear: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 8,
  },
  showOverview: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 18,
  },

  alreadyAddedBadge: {
    backgroundColor: theme.ui.chip.default.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.ui.chip.default.border,
  },
  alreadyAddedText: {
    color: theme.ui.chip.default.text,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 12,
  },
  initialSubtitle: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
