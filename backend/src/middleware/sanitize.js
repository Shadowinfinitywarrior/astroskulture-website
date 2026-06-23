/**
 * Simple input sanitization middleware.
 * Escapes special characters in string fields of req.body to mitigate XSS/Injection.
 */
export function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      const value = req.body[key];
      if (typeof value === 'string') {
        // Escape &, <, >, ", ', ` characters
        req.body[key] = value
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;')
          .replace(/`/g, '&#x60;');
      }
    }
  }
  next();
}
