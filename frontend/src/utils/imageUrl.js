const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

/**
 * Convert a relative upload path (e.g. /uploads/logos/x.jpg) to a full URL.
 * Paths that already start with "http" are returned as-is.
 * Returns null when path is falsy.
 */
export function imgUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const rel = path.replace(/\\/g, '/');
  return `${BASE}/${rel.startsWith('/') ? rel.slice(1) : rel}`;
}
