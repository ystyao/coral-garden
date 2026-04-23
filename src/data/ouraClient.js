// ═══════════════════════════════════════════════════════════════════════
// ouraClient.js — fetches 7 body metrics from Oura Ring API v2 and shapes
// them into the day.data schema the garden expects.
//
// Two auth paths, in precedence order:
//   1. Local config file `ouraConfig.local.js` with OURA_PAT — enables
//      per-day auto-sync. Git-ignored. Preferred for personal use.
//   2. localStorage `garden:oura-token` — populated by the UI's
//      CONNECT OURA modal. Fallback when no local config is set.
//
// CORS: Oura's v2 API currently allows browser-side fetches with a PAT. If
// you see a CORS error, the fix is a serverless proxy (Vercel / Netlify
// function) that forwards the Authorization header.
// ═══════════════════════════════════════════════════════════════════════

// Namespace import so the config file can grow new optional fields (like
// OURA_API_BASE for the dev proxy) without breaking older local.js copies
// that don't have them yet.
import * as ouraConfig from './ouraConfig.local.js';

const OURA_PAT = ouraConfig.OURA_PAT || '';
const AUTO_SYNC_HOUR = typeof ouraConfig.AUTO_SYNC_HOUR === 'number'
  ? ouraConfig.AUTO_SYNC_HOUR
  : 9;

// Allow config to point at a local dev proxy (CORS workaround). If unset,
// talk to Oura directly — which will fail in the browser due to CORS, so
// almost everyone running this app locally needs the proxy.
const OURA_BASE = ouraConfig.OURA_API_BASE
  || 'https://api.ouraring.com/v2/usercollection';
const OURA_TOKEN_KEY = 'garden:oura-token';
const LAST_SYNC_KEY  = 'garden:last-sync';

// ─── Auto-config detection ────────────────────────────────────────────
// True when the local config file carries a non-empty PAT. Drives auto-sync
// behavior and UI button labels ("AUTO · last HH:MM" vs "CONNECT OURA").
export function hasAutoConfig() {
  return typeof OURA_PAT === 'string' && OURA_PAT.trim().length > 10;
}

export function getAutoSyncHour() {
  return typeof AUTO_SYNC_HOUR === 'number' ? AUTO_SYNC_HOUR : 9;
}

// ─── Token management ─────────────────────────────────────────────────
// Config PAT wins over localStorage — if you've set up the local config,
// there's no reason to honor a stale token from the UI flow.
export function hasOuraToken() {
  if (hasAutoConfig()) return true;
  try { return !!localStorage.getItem(OURA_TOKEN_KEY); } catch { return false; }
}

export function getOuraToken() {
  if (hasAutoConfig()) return OURA_PAT.trim();
  try { return localStorage.getItem(OURA_TOKEN_KEY); } catch { return null; }
}

export function setOuraToken(token) {
  try { localStorage.setItem(OURA_TOKEN_KEY, token.trim()); } catch {}
}

export function clearOuraToken() {
  try { localStorage.removeItem(OURA_TOKEN_KEY); } catch {}
}

// ─── Sync timestamp management ────────────────────────────────────────
// Used by the startup freshness check to decide whether today's 9am
// auto-sync has already fired.
export function getLastSyncTime() {
  try {
    const v = Number(localStorage.getItem(LAST_SYNC_KEY));
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch { return 0; }
}

export function markSyncTime(ts = Date.now()) {
  try { localStorage.setItem(LAST_SYNC_KEY, String(ts)); } catch {}
}

// Returns true iff: auto-config is set AND we're past today's AUTO_SYNC_HOUR
// AND the last successful sync happened before today's cutoff.
export function shouldAutoSync(now = new Date()) {
  if (!hasAutoConfig()) return false;
  const cutoff = new Date(now);
  cutoff.setHours(getAutoSyncHour(), 0, 0, 0);
  if (now.getTime() < cutoff.getTime()) return false;  // too early
  return getLastSyncTime() < cutoff.getTime();
}

// ─── Low-level fetch ──────────────────────────────────────────────────
async function ouraFetch(path, startDate, endDate) {
  const token = getOuraToken();
  if (!token) throw new Error('No Oura token set — call setOuraToken(pat) first.');
  const url = `${OURA_BASE}/${path}?start_date=${startDate}&end_date=${endDate}`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('Oura rejected the token (401). Generate a new PAT.');
  if (res.status === 403) throw new Error('Oura token lacks required scopes (403). Re-authorize with daily_readiness + daily_sleep + daily_activity + sleep scopes.');
  if (res.status === 429) throw new Error('Oura rate limit hit (429). Try again in a minute.');
  if (!res.ok) throw new Error(`Oura ${path} → HTTP ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

// ─── Date helpers ─────────────────────────────────────────────────────
// Local-date formatter. `toISOString().slice(0,10)` converts to UTC first,
// which in UTC+X timezones turns local midnight on day N into day N-1 UTC —
// making our "today" string off by one when we ask Oura for data.
function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function daysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

// ─── Metric extraction ────────────────────────────────────────────────
// Oura v2 schema is spread across multiple endpoints:
//
//   daily_sleep.score, .contributors.*          → overall sleep score
//   sleep (sessions).hrv/average_breath/...     → detailed physiological signals
//   daily_activity.score                        → activity score
//   daily_readiness.score, .contributors.*      → RHR, temperature deviation
//
// We key everything by day.date and merge. A day with no sleep session is
// dropped (naps without full night sleep don't produce usable signals).

/**
 * Fetch raw records from all four endpoints covering [startDate, endDate].
 * Returns { dailySleep, sleep, dailyActivity, dailyReadiness } — each is
 * an array keyed by Oura's native payload; we merge in a second step.
 */
async function fetchAllRaw(startDate, endDate) {
  const [dailySleep, sleep, dailyActivity, dailyReadiness] = await Promise.all([
    ouraFetch('daily_sleep', startDate, endDate),
    ouraFetch('sleep', startDate, endDate),
    ouraFetch('daily_activity', startDate, endDate),
    ouraFetch('daily_readiness', startDate, endDate),
  ]);
  return { dailySleep, sleep, dailyActivity, dailyReadiness };
}

/**
 * Reduce an array to a map keyed by `.day` (Oura's YYYY-MM-DD field).
 * For the `sleep` collection there can be multiple sessions per day (naps);
 * keep only the longest one (the main nightly sleep).
 */
function indexByDay(records, { preferLongest = false } = {}) {
  const out = {};
  for (const r of records) {
    if (!r.day) continue;
    if (preferLongest) {
      const prior = out[r.day];
      if (!prior || (r.total_sleep_duration ?? 0) > (prior.total_sleep_duration ?? 0)) {
        out[r.day] = r;
      }
    } else {
      out[r.day] = r;
    }
  }
  return out;
}

/**
 * Convert a single day's worth of Oura records into the garden's day.data.
 * Returns null if the night wasn't recorded at all (no sleep session) — that
 * day is better filled later by mock data than faked from nothing.
 *
 * If a sleep session exists, we keep the day even when some peripheral fields
 * are missing (e.g. Oura skipped respRate for a noisy night). Missing fields
 * fall back to neutral defaults so downstream visuals still have numbers.
 */
function shapeDayData(date, { ds, sl, da, dr }) {
  if (!sl) {
    console.warn(`[oura] ${date} skipped: no sleep session`);
    return null;
  }

  // Oura fields differ across API versions. The most reliable v2 paths:
  const sleepScore   = ds?.score ?? null;
  const activityScore = da?.score ?? null;
  const rhr          = sl.average_heart_rate ?? dr?.contributors?.resting_heart_rate ?? null;
  const hrv          = sl.average_hrv ?? sl.hrv?.items?.filter(v => v != null).reduce((s, v, _, a) => s + v / a.length, 0) ?? null;
  const deepSleepSec = sl.deep_sleep_duration ?? null;
  const respRate     = sl.average_breath ?? null;
  const bodyTemp     = sl.temperature_delta ?? dr?.contributors?.temperature_deviation ?? sl.readiness?.contributors?.temperature_deviation ?? null;
  const readiness    = dr?.score ?? null;

  // Core keystones: we require sleep score + RHR. HRV is now optional
  // because Oura occasionally fails to compute it even when the sleep
  // session exists (poor ring contact, short sessions, etc.) — dropping
  // the whole day for one missing field forced the UI into mock-fill.
  if (sleepScore == null) {
    console.warn(`[oura] ${date} skipped: missing sleep score`, { ds, sl });
    return null;
  }
  if (rhr == null) {
    console.warn(`[oura] ${date} skipped: missing rhr`, { sl });
    return null;
  }
  // Warn but don't skip if HRV is missing — fall back to Lorriane's baseline
  if (hrv == null) {
    console.warn(`[oura] ${date} has no HRV — defaulting to 55ms baseline`);
  }

  return {
    date,
    data: {
      sleep: Number(sleepScore),
      hrv: hrv != null ? Number(hrv) : 55,
      rhr: Number(rhr),
      activity: activityScore != null ? Number(activityScore) : 60,
      deepSleep: deepSleepSec != null ? Number(deepSleepSec) / 60 : 75,  // min
      bodyTemp: bodyTemp != null ? Number(bodyTemp) : 0,
      respRate: respRate != null ? Number(respRate) : 14,
      readiness: readiness != null ? Number(readiness) : undefined,
    },
    source: 'oura',
  };
}

/**
 * High-level: fetch the last N days from Oura and return an array of
 * { date, data, source } sorted oldest→newest. Days where Oura didn't
 * have a sleep session are OMITTED (not mock-filled).
 */
/**
 * Diagnostic helper — shows the raw `.day` fields returned by each Oura
 * endpoint so you can tell whether a missing day is server-side absence or
 * a shape/merge problem on our end.
 */
export async function inspectOuraRaw(nDays = 30) {
  const endDate = isoDate(new Date());
  const startDate = isoDate(daysAgo(nDays + 2));
  console.log(`[oura] Querying ${startDate} → ${endDate}`);
  const raw = await fetchAllRaw(startDate, endDate);
  const summary = {
    daily_sleep: raw.dailySleep.map(r => r.day).sort(),
    sleep_sessions: raw.sleep.map(r => r.day).sort(),
    daily_activity: raw.dailyActivity.map(r => r.day).sort(),
    daily_readiness: raw.dailyReadiness.map(r => r.day).sort(),
  };
  for (const k in summary) {
    console.log(`[oura] ${k}:`, summary[k].join(', ') || '(empty)');
  }
  return summary;
}

export async function fetchOuraDays(nDays = 30) {
  const endDate   = isoDate(new Date());
  const startDate = isoDate(daysAgo(nDays + 2));  // +2 buffer for day boundaries
  const raw = await fetchAllRaw(startDate, endDate);

  const dsMap = indexByDay(raw.dailySleep);
  const slMap = indexByDay(raw.sleep, { preferLongest: true });
  const daMap = indexByDay(raw.dailyActivity);
  const drMap = indexByDay(raw.dailyReadiness);

  // Union of all dates that appeared in any endpoint.
  const dates = new Set([
    ...Object.keys(dsMap),
    ...Object.keys(slMap),
    ...Object.keys(daMap),
    ...Object.keys(drMap),
  ]);
  const sorted = Array.from(dates).sort();
  const days = [];
  for (const d of sorted) {
    const shaped = shapeDayData(d, {
      ds: dsMap[d], sl: slMap[d], da: daMap[d], dr: drMap[d],
    });
    if (shaped) days.push(shaped);
  }

  // Keep only the most recent N (oldest dropped so the garden stays 30 days).
  return days.slice(-nDays);
}

/**
 * Merge fresh Oura days onto an existing mock-generated days array.
 * For any date Oura covers, replace the mock with real data. Useful when
 * you want the garden to keep historical mock days for empty slots.
 */
export function mergeOuraIntoDays(mockDays, ouraDays) {
  const byDate = new Map(mockDays.map(d => [d.date, d]));
  for (const od of ouraDays) {
    byDate.set(od.date, od);
  }
  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * "Yesterday" — most recent complete Oura day. If today's sleep session has
 * synced already (rare — usually takes until mid-morning), that counts.
 * Otherwise returns the day before today.
 */
export function latestCompleteDay(days) {
  if (!days || days.length === 0) return null;
  const today = isoDate(new Date());
  // Walk from newest backwards; return the first day < today, or today if present.
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  for (const d of sorted) {
    if (d.date < today) return d;
  }
  // Fall back to most recent (may be today)
  return sorted[0];
}
