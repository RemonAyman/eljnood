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
  if (!base64Data) return undefined;

  const clean = base64Data.trim();
  
  // Accept standard data image base64 format or simple emoji preset
  const imageMimeRegex = /^data:image\/(png|jpg|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/;
  const svgDataUriRegex = /^data:image\/svg\+xml;utf8,.*$/;

  if (imageMimeRegex.test(clean) || svgDataUriRegex.test(clean)) {
    return clean;
  }

  // If payload fails image regex verification, reject for safety
  console.warn('⚠️ Security Alert: Invalid or potentially unsafe Base64 image payload blocked.');
  return undefined;
}

/**
 * Validates input string against SQL injection / NoSQL operator pattern injection.
 */
export function isSafeQueryInput(input: string): boolean {
  if (!input) return true;
  const dangerousPatterns = /(\$where|\$gt|\$lt|\$ne|\$regex|union\s+select|drop\s+table|delete\s+from)/i;
  return !dangerousPatterns.test(input);
}
