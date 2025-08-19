export type StatusColors = { backgroundColor: string; textColor: string };

// Normalize raw TMDB or stored status values to a canonical display label.
// Always returns a plain string or undefined. Never returns JSX/objects/arrays.
export function normalizeStatus(raw?: string | null): string | undefined {
  if (raw == null) return undefined;
  const s = String(raw).trim().toLowerCase();
  if (!s) return undefined;

  // Known canonical forms
  if (s === 'returning series') return 'Returning Series';
  if (s === 'in production') return 'In Production';
  if (s === 'planned') return 'Planned';
  if (s === 'pilot') return 'Pilot';
  if (s === 'ended') return 'Ended';
  if (s === 'canceled' || s === 'cancelled') return 'Canceled';

  // Fallback: simple capitalized form of normalized input (still a plain string)
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Return strictly an object with { backgroundColor, textColor } based on status.
export function getStatusColors(status?: string | null): StatusColors {
  const normalized = normalizeStatus(status);
  const s = (normalized || '').toLowerCase();

  if (s === 'returning series' || s === 'in production') {
    return { backgroundColor: '#4caf50', textColor: '#ffffff' }; // Green
  }
  if (s === 'planned' || s === 'pilot') {
    return { backgroundColor: '#2196f3', textColor: '#ffffff' }; // Blue
  }
  if (s === 'ended') {
    return { backgroundColor: '#9e9e9e', textColor: '#ffffff' }; // Gray
  }
  if (s === 'canceled') {
    return { backgroundColor: '#f44336', textColor: '#ffffff' }; // Red
  }

  // Neutral fallback
  return { backgroundColor: '#e0e0e0', textColor: '#333333' };
}


