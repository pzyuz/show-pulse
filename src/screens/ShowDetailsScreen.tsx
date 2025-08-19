import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getShowDetails } from '../services/tmdb';
import { removeShow } from '../store/localShows';
import { useAuth } from '../store/auth';
import { TMDBShow } from '../types';
import { getStatusColors, normalizeStatus } from '../utils/status';

type RouteParams = {
  tmdbId: number;
};

export default function ShowDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { tmdbId } = route.params as RouteParams;
  const { isGuest } = useAuth();
  const [removing, setRemoving] = useState(false);

  const { data: show, isLoading, error } = useQuery({
    queryKey: ['showDetails', tmdbId],
    queryFn: () => getShowDetails(tmdbId),
    enabled: !!tmdbId,
  });

  const handleRemoveShow = async () => {
    Alert.alert(
      'Remove Show',
      `Are you sure you want to remove "${show?.name}" from your list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setRemoving(true);
              await removeShow(tmdbId);
              Alert.alert('Success', 'Show removed from your list');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove show. Please try again.');
            } finally {
              setRemoving(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading show details...</Text>
      </View>
    );
  }

  if (error || !show) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Failed to load show</Text>
        <Text style={styles.errorText}>
          {error?.message || 'Unable to fetch show details'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const normalizedStatus = normalizeStatus(show?.status);
  const statusColors = normalizedStatus ? getStatusColors(normalizedStatus) : undefined;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{
            uri: show.poster_path
              ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Poster',
          }}
          style={styles.poster}
          resizeMode="cover"
        />
        
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{show.name}</Text>
          
          {normalizedStatus && normalizedStatus.toLowerCase() !== 'unknown' && statusColors && (
            <View style={[styles.statusBadge, { backgroundColor: statusColors.backgroundColor }]}>
              <Text style={[styles.statusText, { color: statusColors.textColor }]}>{normalizedStatus}</Text>
            </View>
          )}
          
          {show.first_air_date && (
            <Text style={styles.airDate}>
              First aired: {formatDate(show.first_air_date)}
            </Text>
          )}
          
          {show.networks && show.networks.length > 0 && (
            <Text style={styles.network}>
              Network: {show.networks[0].name}
            </Text>
          )}
          
          {show.number_of_seasons && (
            <Text style={styles.seasons}>
              {show.number_of_seasons} season{show.number_of_seasons !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      </View>

      {show.overview && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{show.overview}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Air Dates</Text>
        
        {show.next_episode_to_air ? (
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Next Episode:</Text>
            <Text style={styles.dateValue}>
              {formatDate(show.next_episode_to_air.air_date)}
            </Text>
          </View>
        ) : null}
        
        {show.last_episode_to_air ? (
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Last Episode:</Text>
            <Text style={styles.dateValue}>
              {formatDate(show.last_episode_to_air.air_date)}
            </Text>
          </View>
        ) : null}
        
        {!show.next_episode_to_air && !show.last_episode_to_air && (
          <Text style={styles.noDates}>No air dates available</Text>
        )}
      </View>

      {show.genres && show.genres.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genres</Text>
          <View style={styles.genresContainer}>
            {show.genres.map((genre) => (
              <View key={genre.id} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {show.vote_average && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rating</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>
              ⭐ {show.vote_average.toFixed(1)}/10
            </Text>
            <Text style={styles.ratingCount}>
              ({show.vote_count} votes)
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.removeButton, removing && styles.removeButtonDisabled]}
          onPress={handleRemoveShow}
          disabled={removing}
        >
          {removing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.removeButtonText}>Remove from My Shows</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    lineHeight: 28,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  airDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  network: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  seasons: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  overview: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  dateValue: {
    fontSize: 16,
    color: '#666',
  },
  noDates: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  ratingCount: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 32,
  },
  removeButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  removeButtonDisabled: {
    opacity: 0.6,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
