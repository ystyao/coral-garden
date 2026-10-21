// ═══════════════════════════════════════════════════════════════════════
// /api/claude — Vercel Serverless Function that relays the garden's three
// text rituals (omikuji poem, lantern whisper, bottle resonance) to Claude.
//
// The API key lives only in the server environment (ANTHROPIC_API_KEY,
// set in Vercel → Project → Settings → Environment Variables, or in
// .env.local for `npm run dev`). The browser never sees it.
//
// Guardrails so this isn't an open relay for anyone who finds the URL:
//   - only the three known tasks, each with its own output cap
//   - prompt length cap
//   - same-origin browser requests only
// Also set a monthly spend limit in the Anthropic Console.
// ═══════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';

const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-5-5';
const TASK_MAX_TOKENS = { omikuji: 2000, lantern: 3000, resonance: 1000 };
const MAX_PROMPT_CHARS = 8000;

let client;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  const origin = req.headers.origin;
  if (origin) {
    let originHost = '';
    try { originHost = new URL(origin).host; } catch {}
    if (originHost !== req.headers.host) {
      return res.status(403).json({ error: 'forbidden origin' });
    }
  }

  const { task, prompt } = req.body || {};
  const maxTokens = TASK_MAX_TOKENS[task];
  if (!maxTokens || typeof prompt !== 'string' || !prompt.trim() ||
      prompt.length > MAX_PROMPT_CHARS) {
    return res.status(400).json({ error: 'bad request' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }
  client ??= new Anthropic();

  try {
    const msg = await client.beta.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      // Short creative/classification outputs — little reasoning needed
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      messages: [{ role: 'user', content: prompt }],
    });
    if (msg.stop_reason === 'refusal') {
      return res.status(502).json({ error: 'refused' });
    }
    const text = msg.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim();
    if (!text) return res.status(502).json({ error: 'empty response' });
    return res.status(200).json({ text });
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      console.error(`[api/claude] ${task}: ${err.status} ${err.message}`);
      return res.status(502).json({ error: `upstream ${err.status ?? 'error'}` });
    }
    console.error(`[api/claude] ${task}:`, err);
    return res.status(500).json({ error: 'internal error' });
  }
}
