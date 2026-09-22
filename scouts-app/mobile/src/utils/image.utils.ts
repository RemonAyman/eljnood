/**
 * Helper utility to handle Base64 Image strings and Data URLs
 */
export function formatBase64Image(base64Data: string): string {
  if (!base64Data) return '';
  if (base64Data.startsWith('data:image')) {
    return base64Data;
  }
  return `data:image/jpeg;base64,${base64Data}`;
}

export function isValidBase64(str: string): boolean {
  if (str === '' || str.trim() === '') return false;
  try {
    return btoa(atob(str)) === str || str.startsWith('data:image');
  } catch (err) {
    return str.startsWith('data:image');
  }
}
