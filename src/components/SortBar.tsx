import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SortKey, SortDirection, SortConfig } from '../types';

interface SortBarProps {
  sortConfig: SortConfig;
  onSortConfigChange: (config: SortConfig) => void;
  showSortBar: boolean;
  setShowSortBar: (show: boolean) => void;
}

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'title', label: 'Title' },
  { key: 'dateAdded', label: 'Date Added' },
  { key: 'firstAirDate', label: 'First Air Date' },
  { key: 'nextAirDate', label: 'Next Air Date' },
  { key: 'lastAirDate', label: 'Last Air Date' },
  { key: 'rating', label: 'TMDB Rating' },
];

export default function SortBar({ sortConfig, onSortConfigChange, showSortBar, setShowSortBar }: SortBarProps) {
  const handleSortKeyChange = (key: SortKey) => {
    // For nextAirDate, default to ascending (soonest first)
    // For others, keep current direction or default to descending
    const direction = key === 'nextAirDate' ? 'asc' : sortConfig.direction;
    
    onSortConfigChange({
      ...sortConfig,
      key,
      direction,
    });
  };

  const handleDirectionToggle = () => {
    onSortConfigChange({
      ...sortConfig,
      direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const handleFavoritesToggle = () => {
    onSortConfigChange({
      ...sortConfig,
      favoritesFirst: !sortConfig.favoritesFirst,
    });
  };

  const getDirectionLabel = (key: SortKey, direction: SortDirection): string => {
    if (key === 'title') {
      return direction === 'asc' ? 'A→Z' : 'Z→A';
    } else if (key === 'nextAirDate') {
      return direction === 'asc' ? 'Soonest First' : 'Latest First';
    } else if (key === 'rating') {
      return direction === 'asc' ? 'Lowest First' : 'Highest First';
    } else {
      return direction === 'asc' ? 'Oldest First' : 'Newest First';
    }
  };

  const isDirectionRelevant = (key: SortKey): boolean => {
    return key !== 'nextAirDate'; // nextAirDate always uses ascending for "soonest first"
  };

  const getSortSummary = (): string => {
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
    if (sortConfig.key === 'dateAdded' || sortConfig.key === 'firstAirDate' || sortConfig.key === 'nextAirDate' || sortConfig.key === 'lastAirDate') {
      directionLabels.asc = 'Oldest First';
      directionLabels.desc = 'Newest First';
    } else if (sortConfig.key === 'rating') {
      directionLabels.asc = 'Lowest First';
      directionLabels.desc = 'Highest First';
    }
    
    // Override for nextAirDate specifically
    if (sortConfig.key === 'nextAirDate') {
      directionLabels.asc = 'Soonest First';
      directionLabels.desc = 'Latest First';
    }
    
    let summary = `${keyLabels[sortConfig.key]} (${directionLabels[sortConfig.direction]})`;
    
    if (sortConfig.favoritesFirst) {
      summary += ' • Favorites First';
    }
    
    return summary;
  };

  return (
    <View style={styles.container}>
      {/* Header row with toggle button and active sort summary */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowSortBar(!showSortBar)}
          accessibilityRole="button"
          accessibilityLabel={showSortBar ? "Hide sorting options" : "Show sorting options"}
          accessibilityState={{ expanded: showSortBar }}
        >
          <Text style={styles.toggleButtonText}>
            {showSortBar ? 'Hide Sort' : 'Sort'}
          </Text>
        </TouchableOpacity>
        
        {/* Active sort summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryLabel}>Sort:</Text>
          <Text style={styles.summaryText}>{getSortSummary()}</Text>
        </View>
      </View>

      {/* Expandable sorting options panel */}
      {showSortBar && (
        <View style={styles.panel}>
          {/* Sort Key Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Sort by:</Text>
            <View style={styles.chipContainer}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.chip,
                    sortConfig.key === option.key && styles.chipActive,
                  ]}
                  onPress={() => handleSortKeyChange(option.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Sort by ${option.label}`}
                  accessibilityState={{ selected: sortConfig.key === option.key }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      sortConfig.key === option.key && styles.chipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Direction Toggle */}
          {isDirectionRelevant(sortConfig.key) && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Direction:</Text>
              <TouchableOpacity
                style={styles.directionButton}
                onPress={handleDirectionToggle}
                accessibilityRole="button"
                accessibilityLabel={`Toggle sort direction to ${sortConfig.direction === 'asc' ? 'descending' : 'ascending'}`}
              >
                <Text style={styles.directionButtonText}>
                  {getDirectionLabel(sortConfig.key, sortConfig.direction)}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Favorites First Toggle */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Options:</Text>
            <TouchableOpacity
              style={[
                styles.favoritesToggle,
                sortConfig.favoritesFirst && styles.favoritesToggleActive,
              ]}
              onPress={handleFavoritesToggle}
              accessibilityRole="checkbox"
              accessibilityLabel="Show favorites first"
              accessibilityState={{ checked: sortConfig.favoritesFirst }}
            >
              <Text
                style={[
                  styles.favoritesToggleText,
                  sortConfig.favoritesFirst && styles.favoritesToggleTextActive,
                ]}
              >
                ★ Favorites First
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryContainer: {
    flex: 1,
    marginLeft: 16,
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
  },
  panel: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  section: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
  directionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  directionButtonText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  favoritesToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  favoritesToggleActive: {
    backgroundColor: '#ffd700',
    borderColor: '#ffd700',
  },
  favoritesToggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  favoritesToggleTextActive: {
    color: '#333',
  },
});
