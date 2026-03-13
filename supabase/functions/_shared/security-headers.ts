/**
 * Shared security response headers for all edge functions.
 * These are HTTP-level headers that cannot be set via HTML meta tags.
 */
export const securityHeaders: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  "Content-Security-Policy":
    "default-src 'none'; frame-ancestors 'none';",
};
