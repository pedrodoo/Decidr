/**
 * In-memory IP rate limiting for Anthropic generate calls. Replace with Redis in production.
 */
const ipRequestLog = new Map<string, number[]>();

export const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
export const RATE_LIMIT_MAX = 5;

export type RateLimitStatus = {
	limit: number;
	remaining: number;
	resetAt: number;
};

function prune(ip: string, now: number): number[] {
	const windowStart = now - RATE_LIMIT_WINDOW_MS;
	const requests = ipRequestLog.get(ip) ?? [];
	const recent = requests.filter((t) => t > windowStart);
	ipRequestLog.set(ip, recent);
	return recent;
}

export function getRateLimitStatus(ip: string): RateLimitStatus {
	const now = Date.now();
	const recent = prune(ip, now);
	const remaining = Math.max(0, RATE_LIMIT_MAX - recent.length);
	const oldest = recent[0];
	const resetAt = oldest
		? Math.ceil((oldest + RATE_LIMIT_WINDOW_MS) / 1000)
		: Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000);

	return { limit: RATE_LIMIT_MAX, remaining, resetAt };
}

export function consumeRateLimit(ip: string): { allowed: boolean; status: RateLimitStatus } {
	const now = Date.now();
	const recent = prune(ip, now);

	if (recent.length >= RATE_LIMIT_MAX) {
		return { allowed: false, status: getRateLimitStatus(ip) };
	}

	recent.push(now);
	ipRequestLog.set(ip, recent);
	return { allowed: true, status: getRateLimitStatus(ip) };
}

export function rateLimitHeaders(status: RateLimitStatus): Record<string, string> {
	return {
		'X-RateLimit-Limit': String(status.limit),
		'X-RateLimit-Remaining': String(status.remaining),
		'X-RateLimit-Reset': String(status.resetAt)
	};
}
