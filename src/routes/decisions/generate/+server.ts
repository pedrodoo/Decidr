import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import {
  buildPreparePrompt,
  buildCommunicatePrompt,
  buildPortfolioPrompt,
  type DecisionInput,
  type PromptParts,
  type PromptBuildOptions
} from '$lib/ai/prompts';

const ipRequestLog = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const requests = (ipRequestLog.get(ip) ?? []).filter(t => t > windowStart);
  ipRequestLog.set(ip, requests);
  if (requests.length >= RATE_LIMIT_MAX) return true;
  requests.push(now);
  ipRequestLog.set(ip, requests);
  return false;
}

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const MAX_TOKENS: Record<string, number> = {
  prepare:     700,
  communicate: 500,
  portfolio:   900
};

async function callClaude(promptParts: PromptParts, maxTokens: number): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
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
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  const ip = getClientAddress();
  if (isRateLimited(ip)) throw error(429, 'Too many requests. Try again later.');

  let body: { mode: string; input: DecisionInput; prepareReview?: unknown };
  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid request body');
  }

  const { mode, input } = body;
  const rawPrepareReview = body.prepareReview;
  const prepareReview =
    typeof rawPrepareReview === 'string' && rawPrepareReview.trim() !== '' ? rawPrepareReview.trim() : undefined;
  const buildOptions: PromptBuildOptions | undefined = prepareReview ? { prepareReview } : undefined;

  if (!['prepare', 'communicate', 'portfolio'].includes(mode)) {
    throw error(400, 'Invalid mode');
  }

  const required: (keyof DecisionInput)[] = ['decision', 'problem', 'primaryMetric', 'expectedOutcome'];
  for (const field of required) {
    if (!input[field]?.trim()) throw error(400, `Missing required field: ${field}`);
  }

  try {
    let promptParts: PromptParts;
    if (mode === 'prepare') promptParts = buildPreparePrompt(input);
    else if (mode === 'communicate') promptParts = buildCommunicatePrompt(input, buildOptions);
    else promptParts = buildPortfolioPrompt(input, buildOptions);

    const output = await callClaude(promptParts, MAX_TOKENS[mode]);
    return json({ [mode]: output });

  } catch (err) {
    console.error('Anthropic API error:', err);
    throw error(500, 'Failed to generate output. Please try again.');
  }
};