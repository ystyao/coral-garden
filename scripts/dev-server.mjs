// ═══════════════════════════════════════════════════════════════════════
// dev-server.mjs — local stand-in for Vercel: serves the static site and
// routes POST /api/claude to the same handler Vercel runs in production.
//
// Usage:
//   npm install
//   npm run dev            → http://localhost:3000
//
// Reads ANTHROPIC_API_KEY from .env.local (git-ignored) if present. Without
// a key, /api/claude returns 503 and the garden falls back to its bundled
// poem bank — the rest of the site works normally.
// ═══════════════════════════════════════════════════════════════════════

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 3000;

const envFile = path.join(ROOT, '.env.local');
if (fs.existsSync(envFile)) process.loadEnvFile(envFile);

const { default: claudeHandler } = await import('../api/claude.js');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.glb':  'model/gltf-binary',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// Minimal Vercel-style res helpers for the handler
function withHelpers(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(obj));
    return res;
  };
  return res;
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { return {}; }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/claude') {
    req.body = req.method === 'POST' ? await readJsonBody(req) : {};
    return claudeHandler(req, withHelpers(res));
  }

  let filePath = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  if (url.pathname.endsWith('/')) filePath = path.join(filePath, 'index.html');

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  const keyState = process.env.ANTHROPIC_API_KEY ? 'set' : 'NOT set — poems use fallback bank';
  console.log(`Coral Garden → http://localhost:${PORT}`);
  console.log(`ANTHROPIC_API_KEY: ${keyState}`);
});
