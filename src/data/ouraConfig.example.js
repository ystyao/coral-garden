// ═══════════════════════════════════════════════════════════════════════
// Oura config TEMPLATE — copy this file to `ouraConfig.local.js` and paste
// your Personal Access Token. The `.local.js` file is git-ignored so your
// real token never leaves this machine.
//
// Get a PAT from: https://cloud.ouraring.com/personal-access-tokens
// Scopes needed: daily_sleep + sleep + daily_activity + daily_readiness
// ═══════════════════════════════════════════════════════════════════════

// Paste your token between the quotes. Leave '' to disable auto-sync and
// fall back to the manual CONNECT OURA button in the UI.
export const OURA_PAT = '';

// The garden auto-syncs each day after this hour (24h clock).
// 9 means: the first time you open the page after 9am, fetch fresh data.
export const AUTO_SYNC_HOUR = 9;

// Browser → Oura API direct calls are blocked by CORS policy, so for local
// development we route through scripts/dev-proxy.mjs (run it in a separate
// terminal with `node scripts/dev-proxy.mjs`).
//
// Keep this as 'http://localhost:3001/oura' for local dev. For production
// (Vercel function or similar), change to your proxy URL, or delete this
// line to fall back to the direct Oura URL.
export const OURA_API_BASE = 'http://localhost:3001/oura';
