import { DOCUMENT } from '@angular/common';
import { inject, isDevMode, provideAppInitializer } from '@angular/core';

/**
 * Production CSP: strict script/style, same-origin by default.
 * Prefer repeating this policy as an HTTP response header in production so you can add
 * `frame-ancestors` (ignored in meta CSP) and `report-uri` / `report-to`.
 */
const CSP_PRODUCTION = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com",
  "style-src 'self' https://fonts.googleapis.com",
  "script-src 'self'",
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
