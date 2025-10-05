const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const getFullPhotoUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  // Use backend URL in development
  return `${API_BASE_URL}${url}`;
}; 