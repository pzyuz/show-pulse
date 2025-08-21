

import Constants from 'expo-constants';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Robust key reader with fallbacks for all build types:
function readTmdbKey(): string {
  // 1) process.env.EXPO_PUBLIC_TMDB_KEY for Expo Go and local development
  const fromEnv = process.env.EXPO_PUBLIC_TMDB_KEY;
  // 2) extra.tmdbApiKey from app.config.js for standalone builds / EAS
  const extra =
    (Constants as any)?.expoConfig?.extra ||
    (Constants as any)?.manifest?.extra;   // fallback for standalone builds
  const fromExtra = extra?.tmdbApiKey;
  
  // env takes priority, fallback to extra
  const TMDB_KEY = fromEnv || fromExtra;
  const key = String(TMDB_KEY || '').trim();
  console.log(`🔑 TMDB key loaded: ${key ? 'present' : 'missing'}`);
  return key;
}

function ensureKey(k: string) {
  if (!k) {
    console.error('❌ TMDB key missing at runtime');
    throw new Error('TMDB API key is not configured. Set TMDB_API_KEY as an EAS secret or in .env for local dev.');
  }
}

async function tmdbGet<T>(
  path: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const TMDB_KEY = readTmdbKey();
  ensureKey(TMDB_KEY);
  
  const qp = new URLSearchParams({
    api_key: String(TMDB_KEY),
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });
  const url = `${TMDB_BASE}${path}?${qp.toString()}`;
  
  console.log(`🌐 TMDB request: ${path}`);
  const res = await fetch(url);
  
  if (!res.ok) {
    const body = await res.text();
    console.error(`❌ TMDB error ${res.status}: ${body || res.statusText}`);
    throw new Error(`TMDB API error (${res.status}): ${body || res.statusText}`);
  }
  
  console.log(`✅ TMDB response: ${path} - ${res.status}`);
  return res.json() as Promise<T>;
}

export type TMDBSearchTVResult = {
  page: number;
  results: Array<{
    id: number;
    name: string;
    poster_path?: string | null;
    first_air_date?: string | null;
    overview?: string | null;
  }>;
  total_pages: number;
  total_results: number;
};

export type TMDBTVDetails = {
  id: number;
  name: string;
  overview?: string | null;
  poster_path?: string | null;
  first_air_date?: string | null;
  status?: string | null;
  next_episode_to_air?: { air_date?: string | null } | null;
  last_episode_to_air?: { air_date?: string | null } | null;
  networks?: Array<{ name: string }>;
  vote_average?: number;
  vote_count?: number;
  genres?: Array<{ id: number; name: string }>;
  external_ids?: {
    imdb_id?: string | null;
    tvdb_id?: number | null;
    facebook_id?: string | null;
    instagram_id?: string | null;
    twitter_id?: string | null;
  } | null;
};

export async function searchShows(query: string) {
  const q = query.trim();
  if (!q) {
    return {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0,
    } as TMDBSearchTVResult;
  }
  // Search TV shows
  return tmdbGet<TMDBSearchTVResult>('/search/tv', {
    query: q,
    include_adult: 'false',
    language: 'en-US',
    page: 1,
  });
}

export async function getShowDetails(tmdbId: number) {
  if (!tmdbId) throw new Error('Invalid TMDB id');
  return tmdbGet<TMDBTVDetails>(`/tv/${tmdbId}`, { language: 'en-US', append_to_response: 'external_ids' });
}
