export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface Show {
  id: string;
  tmdbId: number;
  title: string;
  posterUrl?: string;
  status: 'returning' | 'ended' | 'cancelled' | 'unknown';
  nextAirDate?: string;
  lastAirDate?: string;
  network?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserShow {
  id: string;
  userId: string;
  showId: string;
  notifyOn: 'renewal' | 'cancellation' | 'date_change' | 'all';
  createdAt: string;
}

export interface ShowSnapshot {
  id: string;
  payloadJson: string;
  payloadHash: string;
  fetchedAt: string;
}

export interface TMDBShow {
  id: number;
  name: string;
  poster_path?: string;
  status: string;
  first_air_date?: string;
  next_episode_to_air?: {
    air_date: string;
  };
  last_episode_to_air?: {
    air_date: string;
  };
  networks?: Array<{
    name: string;
  }>;
  external_ids?: {
    imdb_id?: string | null;
    tvdb_id?: number | null;
    facebook_id?: string | null;
    instagram_id?: string | null;
    twitter_id?: string | null;
  } | null;
}

export interface TMDBSearchResult {
  results: TMDBShow[];
  total_results: number;
  total_pages: number;
}

export interface ShowLite {
  tmdbId: number;
  title: string;
  posterUrl?: string;
  status?: string;
  nextAirDate?: string;
  lastAirDate?: string;
  network?: string;
  genres?: string[];
  createdAt?: string;
  updatedAt?: string;
}
