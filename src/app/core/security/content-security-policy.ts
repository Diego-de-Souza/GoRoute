import { DOCUMENT } from '@angular/common';
import { inject, isDevMode, provideAppInitializer } from '@angular/core';

import { GOROUTE_CSP_DEVELOPMENT, GOROUTE_CSP_PRODUCTION } from './csp-policy.constants';

/**
 * Production CSP: see `csp-policy.constants.ts` (also mirrored in `index.html` + `vercel.json`).
 *
 * - **style-src 'unsafe-inline'**: vis-network + dynamic UI; meta in `index.html` applies before
 *   bundles run so the first inline styles are not blocked.
 * - **script-src-attr 'unsafe-inline'**: attribute event handlers only; `script-src` stays `'self'`.
 */
function installDocumentCsp(): void {
  const doc = inject(DOCUMENT);
  const head = doc.head;
  if (!head) {
    return;
  }

  const content = isDevMode() ? GOROUTE_CSP_DEVELOPMENT : GOROUTE_CSP_PRODUCTION;

  const metas = head.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
  metas.forEach((el, index) => {
    if (index > 0) {
      el.remove();
    }
  });

  let meta = head.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!meta) {
    meta = doc.createElement('meta');
    meta.setAttribute('http-equiv', 'Content-Security-Policy');
    head.insertBefore(meta, head.firstChild);
  }
  meta.setAttribute('content', content);
}

/** Registers / updates Content-Security-Policy meta (see index.html for early baseline). */
export function provideContentSecurityPolicy() {
  return provideAppInitializer(() => {
    installDocumentCsp();
  });
}
