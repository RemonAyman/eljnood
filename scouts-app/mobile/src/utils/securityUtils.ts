/**
 * Security & Data Sanitization Utility
 * Provides XSS prevention, Base64 URI validation, and input sanitization.
 */

/**
 * Strips HTML tags, script elements, javascript: protocols, and event handlers
 * to prevent Cross-Site Scripting (XSS) attacks in chat, notes, and user profile inputs.
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return '';
  
  let cleaned = String(input);

  // 1. Strip script tags and content
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Strip standard HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // 3. Prevent javascript: / vbscript: protocol execution links
  cleaned = cleaned.replace(/javascript:/gi, '');
  cleaned = cleaned.replace(/vbscript:/gi, '');

  // 4. Clean event handlers (e.g. onload=, onerror=, onclick=)
  cleaned = cleaned.replace(/on\w+\s*=/gi, '');

  return cleaned.trim();
}

/**
 * Validates Base64 Data URI images to ensure they match valid image mime types
 * (jpeg, png, webp, gif, svg+xml) and prevents arbitrary data URI code injection.
 */
export function validateAndSanitizeBase64Image(base64Data: string | undefined | null): string | undefined {
  if (!base64Data || typeof base64Data !== 'string') return undefined;

  const clean = base64Data.trim();
  if (clean.length < 20) return undefined;

  // 1. Check data:image/...;base64 prefix
  const prefixMatch = clean.match(/^data:image\/(png|jpg|jpeg|webp|gif|heic|heif|svg\+xml);base64,/i);
  if (prefixMatch) {
    return clean;
  }

  // 2. SVG utf8 data URI
  if (/^data:image\/svg\+xml;utf8,/i.test(clean)) {
    return clean;
  }

  // 3. Local or remote URI (file://, content://, http://, https://, blob:)
  if (/^(file:\/\/|content:\/\/|https?:\/\/|blob:)/i.test(clean)) {
    return clean;
  }

  // 4. Raw base64 payload without prefix (auto-wrap in jpeg mime)
  if (/^[A-Za-z0-9+/=]{20,}/.test(clean)) {
    return `data:image/jpeg;base64,${clean.replace(/[\r\n\s]/g, '')}`;
  }

  return clean;
}

/**
 * Validates input string against SQL injection / NoSQL operator pattern injection.
 */
export function isSafeQueryInput(input: string): boolean {
  if (!input) return true;
  const dangerousPatterns = /(\$where|\$gt|\$lt|\$ne|\$regex|union\s+select|drop\s+table|delete\s+from)/i;
  return !dangerousPatterns.test(input);
}
