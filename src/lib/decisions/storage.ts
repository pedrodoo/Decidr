import { browser } from '$app/environment';

const DECISIONS_STORAGE_KEY = 'decidr:decisions:v1';
const MAX_DECISIONS = 100;

export type DecisionHistoryItem = {
	id: string;
	title: string;
	audienceLabel: string;
	createdAt: string;
	updatedAt: string;
	summary?: string;
	status?: 'draft' | 'generated';
};

type DecisionHistoryInput = {
	id?: string;
	title: string;
	audienceLabel?: string;
	summary?: string;
	status?: 'draft' | 'generated';
	createdAt?: string;
	updatedAt?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function normalizeDecision(value: unknown): DecisionHistoryItem | null {
	if (!isRecord(value)) return null;

	const id = typeof value.id === 'string' && value.id.trim() ? value.id : '';
	const title = typeof value.title === 'string' && value.title.trim() ? value.title.trim() : '';
	const audienceLabel =
		typeof value.audienceLabel === 'string' && value.audienceLabel.trim()
			? value.audienceLabel.trim()
			: 'Unknown';
	const createdAt = typeof value.createdAt === 'string' ? value.createdAt : '';
	const updatedAt = typeof value.updatedAt === 'string' ? value.updatedAt : createdAt;
	const summary =
		typeof value.summary === 'string' && value.summary.trim() ? value.summary.trim() : undefined;
	const status = value.status === 'draft' || value.status === 'generated' ? value.status : undefined;

	if (!id || !title || !createdAt || Number.isNaN(Date.parse(createdAt))) return null;
	if (!updatedAt || Number.isNaN(Date.parse(updatedAt))) return null;

	return { id, title, audienceLabel, createdAt, updatedAt, summary, status };
}

function readRawDecisions(): DecisionHistoryItem[] {
	if (!browser) return [];

	try {
		const raw = localStorage.getItem(DECISIONS_STORAGE_KEY);
		if (!raw) return [];

		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		return parsed
			.map((item) => normalizeDecision(item))
			.filter((item): item is DecisionHistoryItem => item !== null)
			.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
	} catch {
		return [];
	}
}

function writeRawDecisions(decisions: DecisionHistoryItem[]) {
	if (!browser) return;
	try {
		localStorage.setItem(DECISIONS_STORAGE_KEY, JSON.stringify(decisions.slice(0, MAX_DECISIONS)));
	} catch {
		// Ignore quota and serialization errors in MVP mode.
	}
}

export function listDecisions(): DecisionHistoryItem[] {
	return readRawDecisions();
}

export function listRecentDecisions(limit = 3): DecisionHistoryItem[] {
	return readRawDecisions().slice(0, Math.max(0, limit));
}

export function saveDecision(input: DecisionHistoryInput): DecisionHistoryItem | null {
	if (!browser) return null;

	const title = input.title.trim();
	if (!title) return null;

	const now = new Date().toISOString();
	const nextId = input.id?.trim() || crypto.randomUUID();
	const decisions = readRawDecisions();

	const nextItem: DecisionHistoryItem = {
		id: nextId,
		title,
		audienceLabel: input.audienceLabel?.trim() || 'Unknown',
		summary: input.summary?.trim() || undefined,
		status: input.status ?? 'generated',
		createdAt: input.createdAt && !Number.isNaN(Date.parse(input.createdAt)) ? input.createdAt : now,
		updatedAt: input.updatedAt && !Number.isNaN(Date.parse(input.updatedAt)) ? input.updatedAt : now
	};

	const existingIndex = decisions.findIndex((item) => item.id === nextId);
	if (existingIndex >= 0) {
		const previous = decisions[existingIndex];
		decisions[existingIndex] = {
			...previous,
			...nextItem,
			createdAt: previous.createdAt,
			updatedAt: now
		};
	} else {
		decisions.unshift(nextItem);
	}

	decisions.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
	writeRawDecisions(decisions);
	return decisions.find((item) => item.id === nextId) ?? null;
}

export function deleteDecision(id: string): boolean {
	if (!browser) return false;
	const current = readRawDecisions();
	const next = current.filter((item) => item.id !== id);
	if (next.length === current.length) return false;
	writeRawDecisions(next);
	return true;
}
