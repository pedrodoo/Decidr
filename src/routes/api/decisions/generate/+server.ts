// src/routes/api/decisions/generate/+server.ts

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import {
  buildPreparePrompt,
  buildCommunicatePrompt,
  buildPortfolioPrompt,
  type DecisionInput
} from '$lib/ai/prompts';

// ─── Rate limiting ───────────────────────────────────────────
// Simple in-memory store. Replace with Redis in production.
const ipRequestLog = new Map<string, number[]>();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10;                     // max requests per IP per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const requests = ipRequestLog.get(ip) ?? [];

  // Drop requests outside the window
  const recent = requests.filter((t) => t > windowStart);
  ipRequestLog.set(ip, recent);

  if (recent.length >= RATE_LIMIT_MAX) return true;

  recent.push(now);
  ipRequestLog.set(ip, recent);
  return false;
}

// ─── Anthropic ────────────────────────────────────────────────
const MODEL = 'claude-sonnet-4-5-20251001';

// Max tokens per mode — keeps outputs focused and costs predictable
const MAX_TOKENS = {
  prepare:     600,
  communicate: 400,
  portfolio:   800
};

async function callClaude(client: Anthropic, prompt: string, maxTokens: number): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type from Anthropic API');
  return block.text;
}

// ─── Route handler ───────────────────────────────────────────
export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
  // #region agent log
  fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1aaca0'},body:JSON.stringify({sessionId:'1aaca0',location:'+server.ts:entry',message:'POST handler entry',data:{hasUser:!!locals.user},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
  // #endregion

  // Auth check — Better Auth populates locals.user
  if (!locals.user) {
    throw error(401, 'Unauthorised');
  }

  // Rate limit by IP
  const ip = getClientAddress();
  if (isRateLimited(ip)) {
    throw error(429, 'Too many requests. Try again later.');
  }

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw error(503, 'Anthropic API key is not configured. Add ANTHROPIC_API_KEY to your .env file and restart the dev server.');
  }

  // Parse and validate input
  let input: DecisionInput;
  try {
    input = await request.json();
  } catch {
    throw error(400, 'Invalid request body');
  }

  const required: (keyof DecisionInput)[] = [
    'decision',
    'problem',
    'primaryMetric',
    'expectedOutcome'
  ];

  for (const field of required) {
    if (!input[field]?.trim()) {
      throw error(400, `Missing required field: ${field}`);
    }
  }

  // #region agent log
  fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1aaca0'},body:JSON.stringify({sessionId:'1aaca0',location:'+server.ts:afterValidation',message:'Validation passed',data:{},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

  // Build prompts
  let preparePrompt: string;
  let communicatePrompt: string;
  let portfolioPrompt: string;
  try {
    preparePrompt     = buildPreparePrompt(input);
    communicatePrompt = buildCommunicatePrompt(input);
    portfolioPrompt   = buildPortfolioPrompt(input);
  } catch (promptErr: unknown) {
    // #region agent log
    const e = promptErr instanceof Error ? promptErr : new Error(String(promptErr));
    fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1aaca0'},body:JSON.stringify({sessionId:'1aaca0',location:'+server.ts:promptBuildError',message:'Prompt build threw',data:{errMessage:e.message,errName:e.name},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    console.error('Prompt build error:', promptErr);
    throw error(500, 'Failed to generate outputs. Please try again.');
  }

  // #region agent log
  fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1aaca0'},body:JSON.stringify({sessionId:'1aaca0',location:'+server.ts:beforeClaude',message:'About to call Claude',data:{},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
  // #endregion

  // Run three calls in parallel (client created only when apiKey is set)
  const client = new Anthropic({ apiKey });
  try {
    const [prepare, communicate, portfolio] = await Promise.all([
      callClaude(client, preparePrompt,     MAX_TOKENS.prepare),
      callClaude(client, communicatePrompt, MAX_TOKENS.communicate),
      callClaude(client, portfolioPrompt,   MAX_TOKENS.portfolio)
    ]);

    // #region agent log
    fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1aaca0'},body:JSON.stringify({sessionId:'1aaca0',location:'+server.ts:success',message:'Claude responses OK',data:{runId:'post-fix'},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    return json({ prepare, communicate, portfolio });

  } catch (err) {
    // #region agent log
    const e = err instanceof Error ? err : new Error(String(err));
    fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1aaca0'},body:JSON.stringify({sessionId:'1aaca0',location:'+server.ts:claudeCatch',message:'Claude/Promise.all error',data:{errMessage:e.message,errName:e.name},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    console.error('Anthropic API error:', err);
    throw error(500, 'Failed to generate outputs. Please try again.');
  }
};
