/** Origin without /api — for static assets (uploads). */
export const API_ORIGIN = 'https://delivery-backend-alichan25.amvera.io'

export const assetUrl = (path: string): string => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}
