import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../store/auth';
import { TMDBShow, Show } from '../types';
import { searchShows } from '../services/tmdb';
import { RootStackParamList } from '../utils/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddShow'>;

const GUEST_SHOWS_KEY = 'guest_shows';

const AddShowScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isGuest } = useAuth();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBShow[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      const results = await searchShows(query.trim());
      setSearchResults(results.results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search shows. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddShow = async (tmdbShow: TMDBShow) => {
    try {
      const newShow: Show = {
        id: `show_${Date.now()}`,
        tmdbId: tmdbShow.id,
        title: tmdbShow.name,
        posterUrl: tmdbShow.poster_path 
          ? `https://image.tmdb.org/t/p/w500${tmdbShow.poster_path}`
          : undefined,
        status: (tmdbShow.status as any) || 'unknown',
        nextAirDate: tmdbShow.next_episode_to_air?.air_date,
        lastAirDate: tmdbShow.last_episode_to_air?.air_date,
        network: tmdbShow.networks?.[0]?.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isGuest) {
        // Save to local storage
        const existingShows = await AsyncStorage.getItem(GUEST_SHOWS_KEY);
        const shows: Show[] = existingShows ? JSON.parse(existingShows) : [];
        shows.push(newShow);
        await AsyncStorage.setItem(GUEST_SHOWS_KEY, JSON.stringify(shows));
        Alert.alert('Success', 'Show added to your list!');
        navigation.goBack();
      } else {
        // TODO: Save to Supabase
        Alert.alert('Info', 'Supabase integration not implemented yet');
      }
    } catch (error) {
      console.error('Error adding show:', error);
      Alert.alert('Error', 'Failed to add show. Please try again.');
    }
  };

  const renderSearchResult = ({ item }: { item: TMDBShow }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleAddShow(item)}
    >
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle}>{item.name}</Text>
        <Text style={styles.resultStatus}>Status: {item.status}</Text>
        {item.next_episode_to_air && (
          <Text style={styles.resultDate}>
            Next: {item.next_episode_to_air.air_date}
          </Text>
        )}
        {item.networks && item.networks.length > 0 && (
          <Text style={styles.resultNetwork}>
            Network: {item.networks[0].name}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => handleAddShow(item)}
      >
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Search TV Shows</Text>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter show name..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {searchResults.length > 0 && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>
            Found {searchResults.length} results
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id.toString()}
            style={styles.resultsList}
          />
        </View>
      )}

      {!loading && searchResults.length === 0 && query && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>No shows found</Text>
          <Text style={styles.noResultsSubtext}>
            Try a different search term
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsSection: {
    flex: 1,
    padding: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: 'white',
    marginBottom: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  resultStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  resultDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  resultNetwork: {
    fontSize: 12,
    color: '#999',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 6,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noResultsSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AddShowScreen;
