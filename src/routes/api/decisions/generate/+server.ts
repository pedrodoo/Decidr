// src/routes/api/decisions/generate/+server.ts

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
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
const MODEL = 'claude-sonnet-4-5';

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
  // Auth check — Better Auth populates locals.user
  if (!locals.user) {
    throw error(401, 'Unauthorised');
  }

  // Rate limit by IP
  const ip = getClientAddress();
  if (isRateLimited(ip)) {
    throw error(429, 'Too many requests. Try again later.');
  }

  const apiKey = env.ANTHROPIC_API_KEY?.trim();
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

  // Build prompts
  const preparePrompt     = buildPreparePrompt(input);
  const communicatePrompt = buildCommunicatePrompt(input);
  const portfolioPrompt   = buildPortfolioPrompt(input);

  // Run three calls in parallel (client created only when apiKey is set)
  const client = new Anthropic({ apiKey });
  try {
    const [prepare, communicate, portfolio] = await Promise.all([
      callClaude(client, preparePrompt,     MAX_TOKENS.prepare),
      callClaude(client, communicatePrompt, MAX_TOKENS.communicate),
      callClaude(client, portfolioPrompt,   MAX_TOKENS.portfolio)
    ]);

    return json({ prepare, communicate, portfolio });

  } catch (err) {
    console.error('Anthropic API error:', err);
    throw error(500, 'Failed to generate outputs. Please try again.');
  }
};
