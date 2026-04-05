/**
 * Helper to get the full URL for images stored on the backend.
 * Prepends the backend base URL to relative paths.
 */
export const getImageUrl = (path) => {
  if (!path) return ''
  
  // If path is already a full URL (e.g. from a CDN or Stripe), return it as is
  if (path.startsWith('http')) return path
  
  // Get base URL from env or fallback to localhost
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  
  // Ensure we don't have double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  
  return `${baseUrl}${cleanPath}`
}
