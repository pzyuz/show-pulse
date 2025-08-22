import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

type Props = {
  options: { status: string[]; network: string[]; genres: string[] };
  filterStatus: string | null;
  setFilterStatus: (v: string | null) => void;
  filterNetwork: string | null;
  setFilterNetwork: (v: string | null) => void;
  filterGenres: Set<string>;
  setFilterGenres: (updater: (prev: Set<string>) => Set<string>) => void;
  filterFavorites: boolean;
  setFilterFavorites: (v: boolean) => void;
  showFilters: boolean;
  setShowFilters: (v: boolean) => void;
};

export default function FilterBar({
  options,
  filterStatus,
  setFilterStatus,
  filterNetwork,
  setFilterNetwork,
  filterGenres,
  setFilterGenres,
  filterFavorites,
  setFilterFavorites,
  showFilters,
  setShowFilters,
}: Props) {
  const hasActiveFilters = filterStatus || filterNetwork || filterGenres.size > 0 || filterFavorites;

  const handleStatusToggle = (status: string) => {
    setFilterStatus(filterStatus === status ? null : status);
  };

  const handleNetworkToggle = (network: string) => {
    setFilterNetwork(filterNetwork === network ? null : network);
  };

  const handleGenreToggle = (genre: string) => {
    setFilterGenres(prev => {
      const next = new Set(prev);
      if (next.has(genre)) {
        next.delete(genre);
      } else {
        next.add(genre);
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setFilterStatus(null);
    setFilterNetwork(null);
    setFilterGenres(() => new Set());
    setFilterFavorites(false);
  };

  return (
    <View style={styles.container}>
      {/* Top row with filters button and active filter badges */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => setShowFilters(!showFilters)}
          accessibilityRole="button"
          accessibilityLabel={showFilters ? 'Hide filters' : 'Show filters'}
        >
          <Text style={styles.filtersButtonText}>
            {showFilters ? 'Hide Filters' : 'Filters'}
          </Text>
        </TouchableOpacity>

        {/* Active filter badges */}
        <View style={styles.activeFilters}>
          {filterStatus && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>Status: {filterStatus}</Text>
              <TouchableOpacity
                onPress={() => setFilterStatus(null)}
                accessibilityRole="button"
                accessibilityLabel={`Remove status filter ${filterStatus}`}
              >
                <Text style={styles.filterBadgeRemove}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {filterNetwork && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>Network: {filterNetwork}</Text>
              <TouchableOpacity
                onPress={() => setFilterNetwork(null)}
                accessibilityRole="button"
                accessibilityLabel={`Remove network filter ${filterNetwork}`}
              >
                <Text style={styles.filterBadgeRemove}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {Array.from(filterGenres).map(genre => (
            <View key={genre} style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>Genre: {genre}</Text>
              <TouchableOpacity
                onPress={() => handleGenreToggle(genre)}
                accessibilityRole="button"
                accessibilityLabel={`Remove genre filter ${genre}`}
              >
                <Text style={styles.filterBadgeRemove}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          
          {filterFavorites && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>Favorites only</Text>
              <TouchableOpacity
                onPress={() => setFilterFavorites(false)}
                accessibilityRole="button"
                accessibilityLabel="Remove favorites filter"
              >
                <Text style={styles.filterBadgeRemove}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.clearButton, !hasActiveFilters && styles.clearButtonDisabled]}
          onPress={handleClearFilters}
          disabled={!hasActiveFilters}
          accessibilityRole="button"
          accessibilityLabel="Clear all filters"
          accessibilityState={{ disabled: !hasActiveFilters }}
        >
          <Text style={[styles.clearButtonText, !hasActiveFilters && styles.clearButtonTextDisabled]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expandable filter panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          {/* Status filter */}
          {options.status.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.chipRow}>
                {options.status.map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.chip,
                      filterStatus === status && styles.chipSelected
                    ]}
                    onPress={() => handleStatusToggle(status)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by status ${status}`}
                    accessibilityState={{ selected: filterStatus === status }}
                  >
                    <Text style={[
                      styles.chipText,
                      filterStatus === status && styles.chipTextSelected
                    ]}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Network filter */}
          {options.network.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Network</Text>
              <View style={styles.chipRow}>
                {options.network.map(network => (
                  <TouchableOpacity
                    key={network}
                    style={[
                      styles.chip,
                      filterNetwork === network && styles.chipSelected
                    ]}
                    onPress={() => handleNetworkToggle(network)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by network ${network}`}
                    accessibilityState={{ selected: filterNetwork === network }}
                  >
                    <Text style={[
                      styles.chipText,
                      filterNetwork === network && styles.chipTextSelected
                    ]}>
                      {network}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Genres filter */}
          {options.genres.length > 0 && (
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Genres</Text>
              <View style={styles.chipRow}>
                {options.genres.map(genre => (
                  <TouchableOpacity
                    key={genre}
                    style={[
                      styles.chip,
                      filterGenres.has(genre) && styles.chipSelected
                    ]}
                    onPress={() => handleGenreToggle(genre)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by genre ${genre}`}
                    accessibilityState={{ selected: filterGenres.has(genre) }}
                  >
                    <Text style={[
                      styles.chipText,
                      filterGenres.has(genre) && styles.chipTextSelected
                    ]}>
                      {genre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Favorites filter */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Favorites</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  filterFavorites && styles.chipSelected
                ]}
                onPress={() => setFilterFavorites(!filterFavorites)}
                accessibilityRole="button"
                accessibilityLabel="Filter by favorites"
                accessibilityState={{ selected: filterFavorites }}
              >
                <Text style={[
                  styles.chipText,
                  filterFavorites && styles.chipTextSelected
                ]}>
                  Favorites Only
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filtersButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 12,
  },
  filtersButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilters: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#1976d2',
    marginRight: 4,
  },
  filterBadgeRemove: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  clearButtonDisabled: {
    opacity: 0.5,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  clearButtonTextDisabled: {
    color: '#999',
  },
  filterPanel: {
    padding: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  chipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
});
