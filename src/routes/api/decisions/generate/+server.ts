// src/routes/api/decisions/generate/+server.ts

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import Anthropic from '@anthropic-ai/sdk';
import {
  buildPreparePrompt,
  buildCommunicatePrompt,
  buildPortfolioPrompt,
  type DecisionInput,
  type PromptParts,
  type PromptBuildOptions
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
type GenerateMode = 'prepare' | 'communicate' | 'portfolio';

// Max tokens per mode — keeps outputs focused and costs predictable
const MAX_TOKENS: Record<GenerateMode, number> = {
  prepare:     600,
  communicate: 400,
  portfolio:   800
};

async function callClaude(client: Anthropic, promptParts: PromptParts, maxTokens: number): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    // Cache static instruction blocks to reduce repeated prompt processing.
    system: [{ type: 'text', text: promptParts.system, cache_control: { type: 'ephemeral' } }],
    messages: [
      {
        role: 'user',
        content: [{ type: 'text', text: promptParts.user }]
      }
    ]
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
  let mode: GenerateMode;
  let input: DecisionInput;
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw error(400, 'Invalid request body');
  }
  const parsedMode = (raw as { mode?: unknown })?.mode;
  if (!['prepare', 'communicate', 'portfolio'].includes(String(parsedMode))) {
    throw error(400, 'Invalid mode');
  }
  mode = parsedMode as GenerateMode;
  // Client sends { mode, input }; keep flat DecisionInput fallback for compatibility.
  const nestedInput = (raw as { input?: unknown })?.input;
  input = nestedInput && typeof nestedInput === 'object' ? nestedInput as DecisionInput : raw as DecisionInput;

  const rawPrepareReview = (raw as { prepareReview?: unknown })?.prepareReview;
  const prepareReview =
    typeof rawPrepareReview === 'string' && rawPrepareReview.trim() !== '' ? rawPrepareReview.trim() : undefined;

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

  const buildOptions: PromptBuildOptions | undefined = prepareReview ? { prepareReview } : undefined;

  let promptParts: PromptParts;
  if (mode === 'prepare') promptParts = buildPreparePrompt(input);
  else if (mode === 'communicate') promptParts = buildCommunicatePrompt(input, buildOptions);
  else promptParts = buildPortfolioPrompt(input, buildOptions);

  const client = new Anthropic({ apiKey });
  try {
    const output = await callClaude(client, promptParts, MAX_TOKENS[mode]);
    return json({ [mode]: output });

  } catch (err) {
    console.error('Anthropic API error:', err);
    throw error(500, 'Failed to generate output. Please try again.');
  }
};
