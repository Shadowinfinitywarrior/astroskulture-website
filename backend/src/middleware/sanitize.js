/**
 * Input sanitization middleware to mitigate XSS and injection attacks.
 * Automatically sanitizes string inputs while preserving passwords and security hashes.
 */

const EXCLUDED_FIELDS = new Set([
  'password',
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'securityAnswer',
  'token',
  'razorpay_signature',
  'razorpay_payment_id',
  'signature'
]);

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/`/g, '&#x60;');
  } else if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item));
  } else if (value && typeof value === 'object' && !(value instanceof Date)) {
    const sanitizedObj = {};
    for (const [k, v] of Object.entries(value)) {
      if (EXCLUDED_FIELDS.has(k)) {
        sanitizedObj[k] = v;
      } else {
        sanitizedObj[k] = sanitizeValue(v);
      }
    }
    return sanitizedObj;
  }
  return value;
}

export function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (!EXCLUDED_FIELDS.has(key)) {
        req.body[key] = sanitizeValue(value);
      }
    }
  }

  if (req.query && typeof req.query === 'object') {
    for (const [key, value] of Object.entries(req.query)) {
      req.query[key] = sanitizeValue(value);
    }
  }

  next();
}
