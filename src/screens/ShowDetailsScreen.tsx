import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../store/auth';
import { useTheme } from '../theme/ThemeProvider';
import { getShowDetails } from '../services/tmdb';
import { removeShow } from '../store/localShows';
import { normalizeStatus, getStatusType } from '../utils/status';

type RouteParams = {
  tmdbId: number;
};

export default function ShowDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { isGuest } = useAuth();
  const { theme } = useTheme();
  const { tmdbId } = route.params as RouteParams;

  const { data: show, isLoading, error } = useQuery({
    queryKey: ['showDetails', tmdbId],
    queryFn: () => getShowDetails(tmdbId),
  });

  const handleRemoveShow = () => {
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
                await removeShow(tmdbId);
                navigation.goBack();
              } else {
                // auth path TBD
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove show. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleImdbPress = () => {
    if (show?.external_ids?.imdb_id) {
      const url = `https://www.imdb.com/title/${show.external_ids.imdb_id}/`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open IMDb link.');
      });
    }
  };

  const handleMetacriticPress = () => {
    if (show?.name) {
      const slugifyTitle = (title: string) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      };
      
      const slug = slugifyTitle(show.name);
      const url = `https://www.metacritic.com/tv/${slug}/`;
      
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open Metacritic link.');
      });
    }
  };

  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.action.primary.background} />
        <Text style={styles.loadingText}>Loading show details...</Text>
      </View>
    );
  }

  if (error || !show) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Failed to load show</Text>
        <Text style={styles.errorText}>
          {(error as Error)?.message || 'Unable to load show details. Please try again.'}
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

  const normalizedStatus = normalizeStatus(show.status);
  const statusType = getStatusType(show.status);
  const statusColors = theme.status[statusType];

  return (
    <ScrollView style={styles.container}>
      {/* Header with poster and basic info */}
      <View style={styles.header}>
        {show.poster_path ? (
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w300${show.poster_path}` }}
            style={styles.poster}
            accessibilityLabel={`Poster for ${show.name}`}
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Text style={styles.posterPlaceholderText}>📺</Text>
          </View>
        )}
        
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{show.name}</Text>
          
          {normalizedStatus && (
            <View style={[styles.statusPill, { backgroundColor: statusColors.background }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>
                {normalizedStatus}
              </Text>
            </View>
          )}
          
          {show.networks && show.networks.length > 0 && (
            <Text style={styles.network}>{show.networks[0].name}</Text>
          )}
          
          {(show.vote_average ?? 0) > 0 && (
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingLabel}>Rating:</Text>
              <Text style={styles.ratingValue}>⭐ {show.vote_average.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* External links */}
      {(show.external_ids?.imdb_id || show.name) && (
        <View style={styles.linksSection}>
          <Text style={styles.sectionTitle}>More Information</Text>
          <View style={styles.linksRow}>
            {show.external_ids?.imdb_id && (
              <TouchableOpacity
                style={[styles.linkPill, { backgroundColor: '#F5C518' }]}
                onPress={handleImdbPress}
                accessibilityRole="button"
                accessibilityLabel="Open on IMDb"
              >
                <Text style={[styles.linkPillText, { color: '#000000' }]}>IMDb</Text>
              </TouchableOpacity>
            )}
            
            {show.name && (
              <TouchableOpacity
                style={[styles.linkPill, { backgroundColor: '#2A2A2A' }]}
                onPress={handleMetacriticPress}
                accessibilityRole="button"
                accessibilityLabel="Search on Metacritic"
              >
                <Text style={[styles.linkPillText, { color: '#FFFFFF' }]}>MC</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Show details */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Show Details</Text>
        
        {show.overview && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Overview</Text>
            <Text style={styles.detailValue}>{show.overview}</Text>
          </View>
        )}
        
        {show.first_air_date && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>First Aired</Text>
            <Text style={styles.detailValue}>
              {new Date(show.first_air_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        {show.next_episode_to_air?.air_date && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Episode</Text>
            <Text style={styles.detailValue}>
              {new Date(show.next_episode_to_air.air_date).toLocaleDateString()}
            </Text>
          </View>
        )}
        
        {show.last_episode_to_air?.air_date && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Episode</Text>
            <Text style={styles.detailValue}>
              {new Date(show.last_episode_to_air.air_date).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={handleRemoveShow}
          accessibilityRole="button"
          accessibilityLabel="Remove show from my list"
        >
          <Text style={styles.removeButtonText}>Remove from My Shows</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.primary,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.background.primary,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: theme.action.primary.background,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: theme.action.primary.text,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: theme.background.surface,
    padding: 20,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 20,
  },
  posterPlaceholder: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 20,
    backgroundColor: theme.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.secondary,
  },
  posterPlaceholderText: {
    fontSize: 48,
    color: theme.text.muted,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 12,
    lineHeight: 28,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  network: {
    fontSize: 16,
    color: theme.text.secondary,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: theme.text.secondary,
    marginRight: 8,
  },
  ratingValue: {
    fontSize: 14,
    color: theme.text.primary,
    fontWeight: '500',
  },
  linksSection: {
    backgroundColor: theme.background.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 16,
  },
  linksRow: {
    flexDirection: 'row',
    gap: 12,
  },
  linkPill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: theme.special.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  linkPillText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: theme.background.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
  detailRow: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    color: theme.text.secondary,
    lineHeight: 22,
  },
  actionsSection: {
    backgroundColor: theme.background.surface,
    padding: 20,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  removeButton: {
    backgroundColor: theme.status.danger.background,
    borderWidth: 1,
    borderColor: theme.status.danger.background,
  },
  removeButtonText: {
    color: theme.status.danger.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
