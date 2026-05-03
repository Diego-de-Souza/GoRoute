import { DOCUMENT } from '@angular/common';
import { inject, isDevMode, provideAppInitializer } from '@angular/core';

/**
 * Production CSP (meta tag): balanced for an Angular SPA + vis-network on hosts like Vercel.
 *
 * - **style-src 'unsafe-inline'**: vis-network and many UI paths set `style="..."` on nodes;
 *   Angular host bindings can also emit inline styles. Without this, the console fills with CSP
 *   violations and layout/interaction break. Tightening later usually means nonces + hashes
 *   on the document (often via HTTP header `Content-Security-Policy`, not meta).
 * - **script-src-attr 'unsafe-inline'**: allows `onclick`/`onload`-style handlers only on elements,
 *   while **script-src 'self'** still blocks arbitrary `<script>...</script>` blobs. Some
 *   third-party DOM still uses attribute handlers; if you remove them, try dropping this line.
 *
 * Prefer duplicating this policy as an HTTP response header on your final server so you can add
 * `frame-ancestors` (ignored in meta CSP) and `report-to`.
 */
const CSP_PRODUCTION = [
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

/**
 * Dev CSP: Vite / eval / inline scripts, HMR WebSockets, local HTTP(S).
 */
const CSP_DEVELOPMENT = [
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

function installDocumentCsp(): void {
  const doc = inject(DOCUMENT);
  const head = doc.head;
  if (!head) {
    return;
  }

  const content = isDevMode() ? CSP_DEVELOPMENT : CSP_PRODUCTION;
  head.querySelectorAll('meta[http-equiv="Content-Security-Policy"]').forEach((el) => el.remove());

  const meta = doc.createElement('meta');
  meta.setAttribute('http-equiv', 'Content-Security-Policy');
  meta.setAttribute('content', content);
  head.appendChild(meta);
}

/** Registers Content-Security-Policy before the app bootstraps. */
export function provideContentSecurityPolicy() {
  return provideAppInitializer(() => {
    installDocumentCsp();
  });
}
