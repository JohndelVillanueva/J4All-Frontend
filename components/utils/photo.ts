export const getFullPhotoUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  // Use backend URL in development
  return `http://localhost:3111${url}`;
}; 