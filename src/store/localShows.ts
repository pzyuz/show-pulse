import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShowLite, SortConfig } from '../types';

const SHOWS_STORAGE_KEY = '@sp:shows';

export const getShows = async (): Promise<ShowLite[]> => {
  try {
    const showsJson = await AsyncStorage.getItem(SHOWS_STORAGE_KEY);
    if (showsJson) {
      return JSON.parse(showsJson);
    }
    return [];
  } catch (error) {
    console.error('Error loading shows from storage:', error);
    return [];
  }
};

export const addShow = async (show: ShowLite): Promise<void> => {
  try {
    const shows = await getShows();
    const existingIndex = shows.findIndex(s => s.tmdbId === show.tmdbId);
    
    if (existingIndex === -1) {
      shows.push(show);
      await AsyncStorage.setItem(SHOWS_STORAGE_KEY, JSON.stringify(shows));
    }
  } catch (error) {
    console.error('Error adding show to storage:', error);
    throw error;
  }
};

export const removeShow = async (tmdbId: number): Promise<void> => {
  try {
    const shows = await getShows();
    const filteredShows = shows.filter(s => s.tmdbId !== tmdbId);
    await AsyncStorage.setItem(SHOWS_STORAGE_KEY, JSON.stringify(filteredShows));
  } catch (error) {
    console.error('Error removing show from storage:', error);
    throw error;
  }
};

export const upsertShow = async (show: ShowLite): Promise<void> => {
  try {
    const shows = await getShows();
    const existingIndex = shows.findIndex(s => s.tmdbId === show.tmdbId);
    
    if (existingIndex !== -1) {
      // Update existing show with new data but preserve timestamps
      shows[existingIndex] = { 
        ...shows[existingIndex], 
        ...show,
        createdAt: shows[existingIndex].createdAt, // Preserve original creation date
        updatedAt: new Date().toISOString() // Update timestamp
      };
    } else {
      shows.push(show);
    }
    
    await AsyncStorage.setItem(SHOWS_STORAGE_KEY, JSON.stringify(shows));
  } catch (error) {
    console.error('Error upserting show in storage:', error);
    throw error;
  }
};

export const updateShowPartial = async (tmdbId: number, patch: Partial<ShowLite>): Promise<void> => {
  try {
    const shows = await getShows();
    const existingIndex = shows.findIndex(s => s.tmdbId === tmdbId);
    
    if (existingIndex !== -1) {
      shows[existingIndex] = { ...shows[existingIndex], ...patch };
      await AsyncStorage.setItem(SHOWS_STORAGE_KEY, JSON.stringify(shows));
    }
  } catch (error) {
    console.error('Error updating show in storage:', error);
    throw error;
  }
};

export const toggleFavorite = async (tmdbId: number): Promise<void> => {
  try {
    const shows = await getShows();
    const existingIndex = shows.findIndex(s => s.tmdbId === tmdbId);
    
    if (existingIndex !== -1) {
      shows[existingIndex] = { 
        ...shows[existingIndex], 
        isFavorite: !shows[existingIndex].isFavorite,
        updatedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(SHOWS_STORAGE_KEY, JSON.stringify(shows));
    }
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
};

export const hydrateMissingFields = async (shows: ShowLite[]): Promise<void> => {
  try {
    const { getShowDetails } = await import('../services/tmdb');
    
    // Process shows that need hydration (missing status and both air dates)
    const showsToHydrate = shows.filter(show => 
      (!show.status || show.status.toLowerCase() === 'unknown') && 
      !show.nextAirDate && 
      !show.lastAirDate
    );
    
    if (showsToHydrate.length === 0) return;
    
    // Process with small concurrency to avoid overwhelming the API
    const concurrency = 2;
    for (let i = 0; i < showsToHydrate.length; i += concurrency) {
      const batch = showsToHydrate.slice(i, i + concurrency);
      
      await Promise.allSettled(
        batch.map(async (show) => {
          try {
            const details = await getShowDetails(show.tmdbId);
            
            const patch: Partial<ShowLite> = {
              status: details.status || undefined,
              nextAirDate: details.next_episode_to_air?.air_date || undefined,
              lastAirDate: details.last_episode_to_air?.air_date || undefined,
              firstAirDate: details.first_air_date || undefined,
              network: details.networks?.[0]?.name || undefined,
              genres: details.genres?.map(g => g.name) || undefined,
              voteAverage: details.vote_average || undefined,
            };
            
            await updateShowPartial(show.tmdbId, patch);
          } catch (error) {
            // Swallow errors to avoid UI disruption
            console.warn(`Failed to hydrate show ${show.tmdbId}:`, error);
          }
        })
      );
    }
  } catch (error) {
    // Swallow errors to avoid UI disruption
    console.warn('Error during show hydration:', error);
  }
};

const SORT_CONFIG_KEY = '@sp:sortConfig';

export const saveSortConfig = async (config: SortConfig): Promise<void> => {
  try {
    await AsyncStorage.setItem(SORT_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving sort config:', error);
    throw error;
  }
};

export const loadSortConfig = async (): Promise<SortConfig> => {
  try {
    const stored = await AsyncStorage.getItem(SORT_CONFIG_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading sort config:', error);
  }
  
  // Default sort configuration
  return {
    key: 'dateAdded',
    direction: 'desc',
    favoritesFirst: true,
  };
};
