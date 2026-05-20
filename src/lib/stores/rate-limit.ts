import { writable } from 'svelte/store';

export type ClientRateLimitStatus = {
	limit: number;
	remaining: number;
	resetAt: number;
};

/** Updated from generate API response headers after each call. */
export const clientRateLimit = writable<ClientRateLimitStatus | null>(null);
