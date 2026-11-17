// Gera dist-preview/prototipo.html: um único arquivo que abre direto no navegador, sem servidor.
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';

const r = await build({
  entryPoints: ['src/main.jsx'], bundle: true, minify: true, format: 'iife', jsx: 'automatic',
  loader: { '.js': 'jsx' }, define: { 'process.env.NODE_ENV': '"production"' }, write: false, outdir: 'out',
});
const js = r.outputFiles.find(f => f.path.endsWith('.js')).text;
const css = r.outputFiles.find(f => f.path.endsWith('.css')).text;
const fontes = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">';
mkdirSync('dist-preview', { recursive: true });
writeFileSync('dist-preview/prototipo.html',
  `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>BI Marketplace | Protótipo</title>${fontes}<style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`);
console.log('dist-preview/prototipo.html gerado');
