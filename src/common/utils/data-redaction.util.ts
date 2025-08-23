/**
 * Utility for redacting sensitive data from logs
 */

// List of sensitive field names (case-insensitive)
const SENSITIVE_FIELDS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'key',
  'authorization',
  'auth',
  'bearer',
  'jwt',
  'apikey',
  'api_key',
  'access_token',
  'refresh_token',
  'session',
  'cookie',
  'ssn',
  'social_security_number',
  'creditcard',
  'credit_card',
  'cardnumber',
  'card_number',
  'cvv',
  'cvc',
  'pin',
  'otp',
  'verification_code',
  'confirm_password',
  'confirmPassword',
  'currentPassword',
  'current_password',
  'newPassword',
  'new_password',
  'oldPassword',
  'old_password',
];

// Sensitive URL patterns (partial matches)
const SENSITIVE_URL_PATTERNS = [
  '/auth/',
  '/login',
  '/register',
  '/password',
  '/reset',
  '/token',
  '/oauth',
];

// Headers that should be redacted
const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'x-access-token',
  'x-refresh-token',
];

const REDACTED_VALUE = '[REDACTED]';

/**
 * Check if a field name is sensitive
 */
export function isSensitiveField(fieldName: string): boolean {
  if (!fieldName || typeof fieldName !== 'string') {
    return false;
  }

  const lowerFieldName = fieldName.toLowerCase();
  return SENSITIVE_FIELDS.some((sensitiveField) =>
    lowerFieldName.includes(sensitiveField),
  );
}

/**
 * Check if a URL contains sensitive endpoints
 */
export function isSensitiveUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  const lowerUrl = url.toLowerCase();
  return SENSITIVE_URL_PATTERNS.some((pattern) => lowerUrl.includes(pattern));
}

/**
 * Check if a header is sensitive
 */
export function isSensitiveHeader(headerName: string): boolean {
  if (!headerName || typeof headerName !== 'string') {
    return false;
  }

  const lowerHeaderName = headerName.toLowerCase();
  return SENSITIVE_HEADERS.includes(lowerHeaderName);
}

/**
 * Recursively redact sensitive data from an object
 */
export function redactSensitiveData(obj: any, maxDepth = 10): any {
  if (maxDepth <= 0) {
    return '[MAX_DEPTH_REACHED]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Don't redact string values directly unless they look like tokens
    if (obj.length > 50 && /^[A-Za-z0-9+/=.-_]+$/.test(obj)) {
      return REDACTED_VALUE;
    }
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item, maxDepth - 1));
  }

  const redacted: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveField(key)) {
      redacted[key] = REDACTED_VALUE;
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value, maxDepth - 1);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Redact sensitive headers from request/response headers
 */
export function redactHeaders(
  headers: Record<string, any>,
): Record<string, any> {
  if (!headers || typeof headers !== 'object') {
    return headers;
  }

  const redacted: Record<string, any> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (isSensitiveHeader(key)) {
      redacted[key] = REDACTED_VALUE;
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Redact sensitive query parameters
 */
export function redactQueryParams(
  query: Record<string, any>,
): Record<string, any> {
  if (!query || typeof query !== 'object') {
    return query;
  }

  const redacted: Record<string, any> = {};

  for (const [key, value] of Object.entries(query)) {
    if (isSensitiveField(key)) {
      redacted[key] = REDACTED_VALUE;
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}

/**
 * Create a safe logging object with sensitive data redacted
 */
export function createSafeLogObject(data: any): any {
  if (!data) {
    return data;
  }

  return {
    ...redactSensitiveData(data),
    // Special handling for common HTTP request properties
    ...(data.headers && { headers: redactHeaders(data.headers) }),
    ...(data.query && { query: redactQueryParams(data.query) }),
    ...(data.body && { body: redactSensitiveData(data.body) }),
  };
}

/**
 * Sanitize URL by removing sensitive query parameters
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return url;
  }

  try {
    const urlObj = new URL(url, 'http://localhost');
    const sanitizedParams = new URLSearchParams();

    for (const [key, value] of urlObj.searchParams.entries()) {
      if (isSensitiveField(key)) {
        sanitizedParams.append(key, REDACTED_VALUE);
      } else {
        sanitizedParams.append(key, value);
      }
    }

    const sanitizedUrl =
      urlObj.pathname +
      (sanitizedParams.toString() ? '?' + sanitizedParams.toString() : '');

    return sanitizedUrl;
  } catch {
    // If URL parsing fails, return original (it's probably just a path)
    return url;
  }
}
