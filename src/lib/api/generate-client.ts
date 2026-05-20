import { clientRateLimit, type ClientRateLimitStatus } from '$lib/stores/rate-limit';

export type GenerateApiError = {
	message?: string;
	code?: string;
};

export function applyRateLimitHeaders(response: Response): void {
	const limit = response.headers.get('X-RateLimit-Limit');
	const remaining = response.headers.get('X-RateLimit-Remaining');
	const reset = response.headers.get('X-RateLimit-Reset');
	if (!limit || remaining === null || !reset) return;

	const status: ClientRateLimitStatus = {
		limit: Number(limit),
		remaining: Number(remaining),
		resetAt: Number(reset)
	};
	if (!Number.isNaN(status.limit) && !Number.isNaN(status.remaining)) {
		clientRateLimit.set(status);
	}
}

export async function parseGenerateError(response: Response): Promise<GenerateApiError> {
	try {
		return (await response.json()) as GenerateApiError;
	} catch {
		return { message: 'Something went wrong' };
	}
}
