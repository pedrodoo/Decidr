import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import Anthropic from '@anthropic-ai/sdk';
import {
	buildConfidencePrompt,
	buildPreparePrompt,
	buildCommunicatePrompt,
	buildPortfolioPrompt,
	type DecisionPayload,
	type PromptParts,
	type PromptBuildOptions
} from '$lib/ai/prompts';
import { consumeRateLimit, rateLimitHeaders } from '$lib/server/rate-limit';
import {
	isTrialAllowedMode,
	recordTrialGeneration,
	TRIAL_GENERATION_LIMIT
} from '$lib/server/trial-limits';

const MODEL = 'claude-sonnet-4-5';
type GenerateMode = 'confidence' | 'prepare' | 'communicate' | 'portfolio';

const MAX_TOKENS: Record<GenerateMode, number> = {
	confidence: 100,
	prepare: 600,
	communicate: 550,
	portfolio: 800
};

async function callClaude(
	client: Anthropic,
	promptParts: PromptParts,
	maxTokens: number
): Promise<string> {
	const response = await client.messages.create({
		model: MODEL,
		max_tokens: maxTokens,
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

function apiError(
	status: number,
	message: string,
	code: string,
	headers?: Record<string, string>
) {
	return json({ message, code }, { status, headers });
}

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	if (!locals.user && !locals.trialLead) {
		throw error(401, 'Unauthorised');
	}

	const ip = getClientAddress();
	const { allowed, status: rateStatus } = consumeRateLimit(ip);
	const headers = rateLimitHeaders(rateStatus);

	if (!allowed) {
		return apiError(
			429,
			'Hourly limit reached. Try again later.',
			'rate_limit_exceeded',
			headers
		);
	}

	const trialLead = locals.user ? null : locals.trialLead;
	const isTrial = !!trialLead;

	const apiKey = env.ANTHROPIC_API_KEY?.trim();
	if (!apiKey) {
		throw error(
			503,
			'Anthropic API key is not configured. Add ANTHROPIC_API_KEY to your .env file and restart the dev server.'
		);
	}

	let mode: GenerateMode;
	let input: DecisionPayload;
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		throw error(400, 'Invalid request body');
	}

	const parsedMode = (raw as { mode?: unknown })?.mode;
	if (!['confidence', 'prepare', 'communicate', 'portfolio'].includes(String(parsedMode))) {
		throw error(400, 'Invalid mode');
	}
	mode = parsedMode as GenerateMode;

	const nestedInput = (raw as { input?: unknown })?.input;
	input =
		nestedInput && typeof nestedInput === 'object'
			? (nestedInput as DecisionPayload)
			: (raw as DecisionPayload);

	if (isTrial && trialLead) {
		if (trialLead.status === 'approval_requested' || trialLead.status === 'rejected') {
			return apiError(
				403,
				'Trial generations are paused while your access request is reviewed.',
				'trial_approval_pending',
				headers
			);
		}

		if (trialLead.status !== 'trial') {
			return apiError(403, 'Trial access is not available.', 'trial_inactive', headers);
		}

		if (!isTrialAllowedMode(mode)) {
			return apiError(
				403,
				'Communicate and Portfolio require full access. Request access to unlock.',
				'trial_mode_locked',
				headers
			);
		}

		if (trialLead.generateCount >= TRIAL_GENERATION_LIMIT) {
			return apiError(
				403,
				`Trial limit reached (${TRIAL_GENERATION_LIMIT} generations). Request full access to continue.`,
				'trial_limit_reached',
				headers
			);
		}
	}

	const rawPrepareReview = (raw as { prepareReview?: unknown })?.prepareReview;
	const prepareReview =
		typeof rawPrepareReview === 'string' && rawPrepareReview.trim() !== ''
			? rawPrepareReview.trim()
			: undefined;

	const rawInputDepth = (raw as { inputDepth?: unknown })?.inputDepth;
	const inputDepth = rawInputDepth === 'quick' ? 'quick' : 'full';

	if (!input.decision?.trim()) {
		throw error(400, 'Missing required field: decision');
	}

	if (inputDepth === 'full') {
		const required: (keyof DecisionPayload)[] = [
			'problem',
			'primaryMetric',
			'expectedOutcome'
		];
		for (const field of required) {
			if (!input[field]?.trim()) {
				throw error(400, `Missing required field: ${field}`);
			}
		}
	}

	const buildOptions: PromptBuildOptions = {
		...(prepareReview ? { prepareReview } : {}),
		inputDepth
	};

	let promptParts: PromptParts;
	if (mode === 'confidence') promptParts = buildConfidencePrompt(input, buildOptions);
	else if (mode === 'prepare') promptParts = buildPreparePrompt(input, buildOptions);
	else if (mode === 'communicate')
		promptParts = buildCommunicatePrompt(input, buildOptions);
	else promptParts = buildPortfolioPrompt(input, buildOptions);

	const client = new Anthropic({ apiKey });
	try {
		const output = await callClaude(client, promptParts, MAX_TOKENS[mode]);

		if (isTrial && trialLead) {
			await recordTrialGeneration(trialLead.id);
		}

		return json({ [mode]: output }, { headers });
	} catch (err) {
		console.error('Anthropic API error:', err);
		throw error(500, 'Failed to generate output. Please try again.');
	}
};
