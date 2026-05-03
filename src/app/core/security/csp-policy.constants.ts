/**
 * Document CSP for `index.html` and `vercel.json` only (no runtime meta mutation).
 *
 * - **style-src** + **style-src-elem** + **style-src-attr**: CSP Level 3 splits `<style>` / linked
 *   CSS vs `style=""` updates; listing all three avoids engines that still enforce a stricter branch.
 * - **blob:** on style sources: inlined critical CSS / tooling may reference blob URLs.
 * - **script-src** includes `'unsafe-inline' 'unsafe-eval'` so `ng serve` (Vite) keeps working; the
 *   production bundle is still same-origin. Tighten on your final host via HTTP header if needed.
 *
 * Keep this string in sync with `src/index.html` and `vercel.json`.
 */
export const GOROUTE_CSP_DOCUMENT = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' https://fonts.googleapis.com 'unsafe-inline' blob:",
  "style-src-elem 'self' https://fonts.googleapis.com 'unsafe-inline' blob:",
  "style-src-attr 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "script-src-attr 'unsafe-inline'",
  "connect-src 'self' https://api.open-meteo.com http: https: ws: wss:",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');
