// ═══════════════════════════════════════════════════════════════════════
// dev-proxy.mjs — minimal CORS proxy for the Oura API during local dev.
//
// Oura's v2 API does not emit Access-Control-Allow-Origin headers, so
// browser fetches from http://localhost:3000 are blocked. This tiny HTTP
// server sits on :3001, accepts /oura/{path} from the browser, forwards
// the request (with the Authorization header intact) to
// https://api.ouraring.com/v2/usercollection/{path}, and echoes the
// response with permissive CORS headers.
//
// Zero dependencies — uses only Node's built-in http/https modules.
//
// Usage:
//   node scripts/dev-proxy.mjs
//   (Leave it running in a second terminal. Ctrl+C to stop.)
// ═══════════════════════════════════════════════════════════════════════

import http from 'node:http';
import https from 'node:https';

const PORT = 3001;
const TARGET_HOST = 'api.ouraring.com';
const TARGET_PATH_PREFIX = '/v2/usercollection';
const LOCAL_PATH_PREFIX = '/oura/';

function sendCors(res, status, body = '', extraHeaders = {}) {
  res.writeHead(status, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    ...extraHeaders,
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // Preflight
  if (req.method === 'OPTIONS') {
    sendCors(res, 204);
    return;
  }

  if (!req.url.startsWith(LOCAL_PATH_PREFIX)) {
    sendCors(res, 404, `Not found. This proxy serves ${LOCAL_PATH_PREFIX}* only.`);
    return;
  }

  const relativeUrl = req.url.slice(LOCAL_PATH_PREFIX.length);
  const targetPath = TARGET_PATH_PREFIX + '/' + relativeUrl;

  const options = {
    hostname: TARGET_HOST,
    path: targetPath,
    method: req.method,
    headers: {
      'Authorization': req.headers['authorization'] || '',
      'Accept': 'application/json',
      'User-Agent': 'coral-garden-dev-proxy/1.0',
    },
  };

  const proxyReq = https.request(options, (proxyRes) => {
    const chunks = [];
    proxyRes.on('data', (c) => chunks.push(c));
    proxyRes.on('end', () => {
      const body = Buffer.concat(chunks);
      sendCors(res, proxyRes.statusCode, body, {
        'Content-Type': proxyRes.headers['content-type'] || 'application/json',
      });
      console.log(`[proxy] ${req.method} ${req.url} → ${proxyRes.statusCode}`);
    });
  });

  proxyReq.on('error', (err) => {
    console.error(`[proxy] upstream error for ${req.url}:`, err.message);
    sendCors(res, 502, JSON.stringify({ error: err.message }));
  });

  proxyReq.end();
});

server.listen(PORT, () => {
  console.log(`
  ┌──────────────────────────────────────────────────────────┐
  │  Oura dev proxy running                                  │
  │                                                          │
  │  Listens on : http://localhost:${PORT}                       │
  │  Forwards   : /oura/*  →  https://${TARGET_HOST}${TARGET_PATH_PREFIX}/*
  │                                                          │
  │  Keep this terminal open. Ctrl+C to stop.                │
  └──────────────────────────────────────────────────────────┘
`);
});
