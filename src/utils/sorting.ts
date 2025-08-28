import { ShowLite, SortKey, SortDirection, SortConfig } from '../types';

// Helper function to safely parse dates
function parseDate(dateString?: string): Date | null {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// Helper function to get the primary sort value for a show
function getSortValue(show: ShowLite, key: SortKey): string | number | Date | null {
  switch (key) {
    case 'title':
      return show.title.toLowerCase();
    case 'dateAdded':
      return parseDate(show.createdAt);
    case 'firstAirDate':
      return parseDate(show.firstAirDate);
    case 'nextAirDate':
      return parseDate(show.nextAirDate);
    case 'lastAirDate':
      return parseDate(show.lastAirDate);
    case 'rating':
      return show.voteAverage ?? null;
    default:
      return null;
  }
}

// Stable sorting with tiebreakers
export function sortShows(shows: ShowLite[], config: SortConfig): ShowLite[] {
  if (!shows || shows.length === 0) return shows;
  
  const { key, direction, favoritesFirst } = config;
  
  console.log(`🔀 Sorting ${shows.length} shows by ${key} (${direction}), favorites first: ${favoritesFirst}`);
  
  return [...shows].sort((a, b) => {
    // Handle favorites first
    if (favoritesFirst) {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
    }
    
    // Get primary sort values
    const aValue = getSortValue(a, key);
    const bValue = getSortValue(b, key);
    
    // Handle missing values (push to end)
    if (aValue === null && bValue === null) {
      // Both missing, use tiebreakers
    } else if (aValue === null) {
      return 1; // a goes to end
    } else if (bValue === null) {
      return -1; // b goes to end
    } else {
      // Both have values, compare them
      let comparison = 0;
      
      if (key === 'title') {
        // Case-insensitive, locale-aware string comparison
        comparison = aValue.toString().localeCompare(bValue.toString(), undefined, { 
          sensitivity: 'base',
          numeric: false 
        });
      } else if (aValue instanceof Date && bValue instanceof Date) {
        // Date comparison
        comparison = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        // Numeric comparison
        comparison = aValue - bValue;
      }
      
      // Apply direction
      if (direction === 'desc') {
        comparison = -comparison;
      }
      
      if (comparison !== 0) {
        return comparison;
      }
    }
    
    // Tiebreakers: title (A→Z) then tmdbId
    const titleComparison = (a.title || '').toLowerCase().localeCompare(
      (b.title || '').toLowerCase(), 
      undefined, 
      { sensitivity: 'base', numeric: false }
    );
    
    if (titleComparison !== 0) {
      return titleComparison;
    }
    
    // Final tiebreaker: tmdbId
    return (a.tmdbId || 0) - (b.tmdbId || 0);
  });
}

// Get human-readable sort description
export function getSortDescription(config: SortConfig): string {
  const { key, direction, favoritesFirst } = config;
  
  const keyLabels: Record<SortKey, string> = {
    title: 'Title',
    dateAdded: 'Date Added',
    firstAirDate: 'First Air Date',
    nextAirDate: 'Next Air Date',
    lastAirDate: 'Last Air Date',
    rating: 'TMDB Rating',
  };
  
  const directionLabels: Record<SortDirection, string> = {
    asc: 'A→Z',
    desc: 'Z→A',
  };
  
  // Special cases for date and rating sorts
  if (key === 'dateAdded' || key === 'firstAirDate' || key === 'nextAirDate' || key === 'lastAirDate') {
    directionLabels.asc = 'Oldest First';
    directionLabels.desc = 'Newest First';
  } else if (key === 'rating') {
    directionLabels.asc = 'Lowest First';
    directionLabels.desc = 'Highest First';
  }
  
  // Override for nextAirDate specifically
  if (key === 'nextAirDate') {
    directionLabels.asc = 'Soonest First';
    directionLabels.desc = 'Latest First';
  }
  
  let description = `Sort: ${keyLabels[key]} (${directionLabels[direction]})`;
  
  if (favoritesFirst) {
    description += ' • Favorites First';
  }
  
  return description;
}
