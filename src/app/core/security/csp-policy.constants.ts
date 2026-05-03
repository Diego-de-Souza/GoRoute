/**
 * Single source for CSP strings (runtime meta). Keep in sync with:
 * - `src/index.html` (first meta in `<head>` — parsed before any bundle runs)
 * - `vercel.json` → `headers` → `Content-Security-Policy` (HTTP header on Vercel)
 *
 * If the browser reports a policy **without** `'unsafe-inline'` in `style-src`, a **stricter**
 * CSP is still coming from elsewhere (e.g. another meta tag or a platform header); remove it
 * so only this policy applies, or align that source with these values.
 */
export const GOROUTE_CSP_PRODUCTION = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
  "script-src 'self'",
  "script-src-attr 'unsafe-inline'",
  "connect-src 'self' https://api.open-meteo.com",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

export const GOROUTE_CSP_DEVELOPMENT = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https://api.open-meteo.com http: https: ws: wss:",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join('; ');
