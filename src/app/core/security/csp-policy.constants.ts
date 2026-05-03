/**
 * CSP em duas camadas:
 *
 * 1. **`GOROUTE_CSP_META_DEVELOPMENT`** — copiada para `src/index.html`. Usada em `ng serve`
 *    (precisa de `'unsafe-inline' 'unsafe-eval'` em scripts para o Vite / dev).
 *
 * 2. **`GOROUTE_CSP_META_PRODUCTION`** — espelho lógico de `scripts/harden-dist.mjs` (`PRODUCTION_CSP`).
 *    Após `ng build`, `npm run build` corre `harden-dist.mjs`, que remove o `onload` inline do stylesheet
 *    e **substitui** a meta no `dist/.../index.html` por esta política: `script-src 'self'` apenas
 *    (muito melhor contra XSS refletido/armazenado em `<script>` inline). Estilos inline continuam
 *    permitidos por causa do **vis-network** e do CSS crítico do build (`style-src` + `style-src-attr`).
 *
 * Em produção endurecida, **não** dupliques outra CSP em HTTP sem alinhar o texto.
 */
export const GOROUTE_CSP_META_DEVELOPMENT = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com 'unsafe-inline' blob: data:",
  "style-src-attr 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https://api.open-meteo.com http: https: ws: wss: data: blob:",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');

/** Igual a `PRODUCTION_CSP` em `scripts/harden-dist.mjs` — alterar nos dois sítios. */
export const GOROUTE_CSP_META_PRODUCTION = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com 'unsafe-inline' blob: data:",
  "style-src-attr 'unsafe-inline'",
  "script-src 'self'",
  "connect-src 'self' https://api.open-meteo.com https: wss:",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');
