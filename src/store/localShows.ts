import AsyncStorage from '@react-native-async-storage/async-storage';
import { ShowLite } from '../types';

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
      shows[existingIndex] = show;
    } else {
      shows.push(show);
    }
    
    await AsyncStorage.setItem(SHOWS_STORAGE_KEY, JSON.stringify(shows));
  } catch (error) {
    console.error('Error upserting show in storage:', error);
    throw error;
  }
};
