// ═══════════════════════════════════════════════════════════════════════
// ouraSimulator.js — deterministic stand-in for the Oura Ring v2 API, used
// by the public (Vercel) deployment where no personal token can ship.
//
// Produces the same day.data schema as ouraClient.js. Values are tuned to
// Lorriane's real baselines (sleep 78 ± 8, RHR 62 ± 4, HRV ~55 ms) and are
// a pure function of the calendar date: every visitor, on every reload, sees
// the same reading for the same day. A past day can never be rewritten —
// the ledger stays a ledger, and omikuji signatures stay stable.
//
// Physiology modelled (loosely, for narrative plausibility):
//   - a latent "recovery" factor (AR(1)) couples sleep, deep sleep, HRV, RHR
//   - a ~28-day cycle lifts body temp / RHR / resp in the luteal phase
//   - rare illness episodes: fever, high RHR, low HRV, decaying over days
//   - a weekly rhythm in activity
// ═══════════════════════════════════════════════════════════════════════

// Walk starts from a fixed epoch so a given date's value doesn't depend on
// which 30-day window is being viewed.
const EPOCH = new Date(2025, 0, 1);
const CYCLE_DAYS = 28;

const ISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// FNV-1a → 32-bit seed
function hashString(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32 PRNG
function rngFor(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussFrom(rng) {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round = (v, digits = 0) => {
  const k = 10 ** digits;
  return Math.round(v * k) / k;
};

// Returns `n` days ending today (oldest first), each
// { date, data: {sleep, hrv, rhr, activity, deepSleep, bodyTemp, respRate}, source }.
export function simulateOuraDays(n = 30, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - (n - 1));
  const start = windowStart < EPOCH ? windowStart : EPOCH;

  let recovery = 0;
  let illness = 0;
  const out = [];

  for (let d = new Date(start), i = 0; d <= today; d.setDate(d.getDate() + 1), i++) {
    const date = ISO(d);
    const rng = rngFor(hashString(`coral-garden|${date}`));
    const g = () => gaussFrom(rng);

    recovery = 0.6 * recovery + 0.8 * g();
    illness *= 0.55;
    if (illness < 0.05) illness = 0;
    if (illness === 0 && rng() < 0.025) illness = 1.0 + rng() * 0.6;

    // Smooth luteal lift: 0 in follicular half, up to 1 mid-luteal
    const phase = (i % CYCLE_DAYS) / CYCLE_DAYS;
    const luteal = Math.max(0, Math.sin((phase - 0.5) * 2 * Math.PI));

    const dow = d.getDay();
    const weekRhythm = dow === 0 ? -6 : dow === 6 ? 8 : dow === 3 ? 4 : 0;

    const data = {
      sleep:     round(clamp(78 + 7 * recovery + 3 * g() - 8 * illness, 40, 100)),
      hrv:       round(clamp(55 + 9 * recovery + 5 * g() - 14 * illness - 3 * luteal, 20, 90)),
      rhr:       round(clamp(62 - 3 * recovery + 1.5 * g() + 7 * illness + 2 * luteal, 45, 85)),
      activity:  round(clamp(72 + weekRhythm + 4 * recovery + 9 * g() - 25 * illness, 30, 100)),
      deepSleep: round(clamp(75 + 16 * recovery + 10 * g() - 20 * illness, 0, 180)),
      bodyTemp:  round(clamp(0.38 * luteal + illness + 0.1 * g(), -1.5, 2.0), 2),
      respRate:  round(clamp(14 + 0.5 * g() - 0.3 * recovery + 2.2 * illness + 0.3 * luteal, 10, 20), 1),
    };

    if (d >= windowStart) out.push({ date, data, source: 'oura-sim' });
  }
  return out;
}
