/**
 * CSP aplicada só via `src/index.html` (meta). Não duplicar em header HTTP (ex.: Vercel) com texto
 * diferente — várias CSPs ativas ao mesmo tempo fazem o navegador exigir todas; uma política
 * antiga sem `'unsafe-inline'` continua a bloquear estilos.
 *
 * Uma linha **`style-src`** (sem `style-src-elem` / `style-src-attr` separados): em CSP nível 3,
 * alguns motores aplicam ramos de forma inconsistente; um único `style-src` cobre `<style>`
 * inline do build e `style=""` (vis-network, Angular).
 *
 * Inclui `https://fonts.gstatic.com`, `blob:` e `data:` para @font-face / subsets inlined pelo
 * pipeline de build. `script-src` com `'unsafe-inline' 'unsafe-eval'` mantém `ng serve`.
 */
export const GOROUTE_CSP_DOCUMENT = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "img-src 'self' data: blob:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "style-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com 'unsafe-inline' blob: data:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https://api.open-meteo.com http: https: ws: wss: data: blob:",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ');
