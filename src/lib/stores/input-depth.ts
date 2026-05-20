import { browser } from '$app/environment';

export type InputDepth = 'quick' | 'full';

const STORAGE_KEY = 'decidr:input-depth:v1';

export function readInputDepth(): InputDepth {
	if (!browser) return 'full';
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw === 'quick' ? 'quick' : 'full';
	} catch {
		return 'full';
	}
}

export function writeInputDepth(depth: InputDepth): void {
	if (!browser) return;
	try {
		localStorage.setItem(STORAGE_KEY, depth);
	} catch {
		/* ignore */
	}
}

export function parseInputDepth(value: string | null): InputDepth | null {
	if (value === 'quick' || value === 'full') return value;
	return null;
}
