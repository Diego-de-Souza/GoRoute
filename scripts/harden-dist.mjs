/**
 * Pós-processamento do `ng build` (produção):
 * 1. Remove o padrão `media="print" onload="this.media='all'"` do index (handler inline → CSP script).
 * 2. Substitui a meta CSP por política mais restrita: `script-src 'self'` (sem unsafe-inline / unsafe-eval).
 *
 * Manter `PRODUCTION_CSP` alinhado com o comentário em `csp-policy.constants.ts`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

/** Mesmo texto que `GOROUTE_CSP_META_PRODUCTION` em csp-policy.constants.ts */
const PRODUCTION_CSP = [
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

function findIndexHtml() {
  const browser = path.join(root, 'dist', 'goroute-frontend', 'browser', 'index.html');
  if (fs.existsSync(browser)) {
    return browser;
  }
  const alt = path.join(root, 'dist', 'browser', 'index.html');
  if (fs.existsSync(alt)) {
    return alt;
  }
  return null;
}

function main() {
  const indexPath = findIndexHtml();
  if (!indexPath) {
    console.warn('harden-dist: index.html não encontrado em dist/ (skip).');
    process.exit(0);
  }

  let html = fs.readFileSync(indexPath, 'utf8');

  html = html.replace(/media="print"\s+onload="this\.media='all'"/g, 'media="all"');
  html = html.replace(/media='print'\s+onload='this\.media="all"'/g, "media=\"all\"");

  const metaRe = /<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]*"\s*\/?>/gi;
  if (!metaRe.test(html)) {
    console.warn('harden-dist: meta CSP não encontrada; nada alterado.');
    fs.writeFileSync(indexPath, html);
    process.exit(0);
  }
  metaRe.lastIndex = 0;
  html = html.replace(
    metaRe,
    `<meta http-equiv="Content-Security-Policy" content="${PRODUCTION_CSP}" />`,
  );

  fs.writeFileSync(indexPath, html);
  console.log('harden-dist: OK →', path.relative(root, indexPath));
}

main();
