import Constants from 'expo-constants';
import { TMDBShow, TMDBSearchResult } from '../types';

const TMDB_API_KEY = Constants.expoConfig?.extra?.tmdbApiKey;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  console.warn('TMDB API key missing. Check your environment variables.');
}

export const searchShows = async (query: string): Promise<TMDBSearchResult> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
};

export const getShowDetails = async (tmdbId: number): Promise<TMDBShow> => {
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=networks`
  );

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  return response.json();
};
