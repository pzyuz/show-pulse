export type StatusType = 'success' | 'warning' | 'danger' | 'neutral';

export function normalizeStatus(raw?: string | null): StatusType | undefined {
  if (!raw) return undefined;
  
  const status = raw.toLowerCase().trim();
  
  // Map TMDB status values to semantic types
  if (status === 'returning series' || status === 'in production') {
    return 'success';
  } else if (status === 'planned' || status === 'pilot') {
    return 'warning';
  } else if (status === 'ended' || status === 'canceled' || status === 'cancelled') {
    return 'danger';
  } else {
    return 'neutral';
  }
}

export function getStatusType(status?: string | null): StatusType | undefined {
  return normalizeStatus(status);
}


