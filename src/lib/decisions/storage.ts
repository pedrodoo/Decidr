import { browser } from '$app/environment';

const DECISIONS_STORAGE_KEY = 'decidr:decisions:v2';
const MAX_DECISIONS = 100;

export type AudienceSelection = {
	id: string;
	label: string;
	icon: string;
	description: string;
	available: boolean;
};

export type DecisionForm = {
	decision: string;
	problem: string;
	businessArea: string;
	options: string;
	data: string;
	tradeoffs: string;
	primaryMetric: string;
	guardrailMetric: string;
	expectedOutcome: string;
};

export type IterationOutputs = {
	confidence?: string;
	prepare?: string;
	communicate?: string;
	portfolio?: string;
};

export type DecisionIteration = {
	id: string;
	generatedAt: string;
	inputSnapshot: {
		audience: AudienceSelection;
		form: DecisionForm;
	};
	outputs: IterationOutputs;
};

export type DecisionStatus = 'draft' | 'not-ready' | 'needs-work' | 'ready';

export type DecisionRecord = {
	id: string;
	title: string;
	audience: AudienceSelection;
	audienceLabel: string;
	form: DecisionForm;
	iterations: DecisionIteration[];
	status: DecisionStatus;
	createdAt: string;
	updatedAt: string;
	summary?: string;
};

export const STATUS_LABELS: Record<DecisionStatus, string> = {
	draft: 'Draft',
	'not-ready': 'Not Ready',
	'needs-work': 'Needs Work',
	ready: 'Ready'
};

export const EMPTY_FORM: DecisionForm = {
	decision: '',
	problem: '',
	businessArea: '',
	options: '',
	data: '',
	tradeoffs: '',
	primaryMetric: '',
	guardrailMetric: '',
	expectedOutcome: ''
};

const DEFAULT_AUDIENCE: AudienceSelection = {
	id: 'ceo',
	label: 'CEO',
	icon: '',
	description: '',
	available: true
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function normalizeAudience(value: unknown): AudienceSelection {
	if (!isRecord(value)) return { ...DEFAULT_AUDIENCE };
	const id = typeof value.id === 'string' && value.id.trim() ? value.id : DEFAULT_AUDIENCE.id;
	const label =
		typeof value.label === 'string' && value.label.trim() ? value.label : DEFAULT_AUDIENCE.label;
	const icon = typeof value.icon === 'string' ? value.icon : '';
	const description = typeof value.description === 'string' ? value.description : '';
	const available = typeof value.available === 'boolean' ? value.available : true;
	return { id, label, icon, description, available };
}

function normalizeForm(value: unknown): DecisionForm {
	if (!isRecord(value)) return { ...EMPTY_FORM };
	const next: DecisionForm = { ...EMPTY_FORM };
	for (const key of Object.keys(EMPTY_FORM) as (keyof DecisionForm)[]) {
		const raw = value[key];
		next[key] = typeof raw === 'string' ? raw : '';
	}
	return next;
}

function normalizeOutputs(value: unknown): IterationOutputs {
	if (!isRecord(value)) return {};
	const out: IterationOutputs = {};
	if (typeof value.confidence === 'string') out.confidence = value.confidence;
	if (typeof value.prepare === 'string') out.prepare = value.prepare;
	if (typeof value.communicate === 'string') out.communicate = value.communicate;
	if (typeof value.portfolio === 'string') out.portfolio = value.portfolio;
	return out;
}

function normalizeIteration(value: unknown): DecisionIteration | null {
	if (!isRecord(value)) return null;
	const id = typeof value.id === 'string' && value.id.trim() ? value.id : '';
	const generatedAt =
		typeof value.generatedAt === 'string' && !Number.isNaN(Date.parse(value.generatedAt))
			? value.generatedAt
			: '';
	if (!id || !generatedAt) return null;

	const snapshot = isRecord(value.inputSnapshot) ? value.inputSnapshot : {};
	return {
		id,
		generatedAt,
		inputSnapshot: {
			audience: normalizeAudience(snapshot.audience),
			form: normalizeForm(snapshot.form)
		},
		outputs: normalizeOutputs(value.outputs)
	};
}

function isDecisionStatus(value: unknown): value is DecisionStatus {
	return value === 'draft' || value === 'not-ready' || value === 'needs-work' || value === 'ready';
}

function normalizeRecord(value: unknown): DecisionRecord | null {
	if (!isRecord(value)) return null;

	const id = typeof value.id === 'string' && value.id.trim() ? value.id : '';
	const createdAt = typeof value.createdAt === 'string' ? value.createdAt : '';
	const updatedAt = typeof value.updatedAt === 'string' ? value.updatedAt : createdAt;
	if (!id || !createdAt || Number.isNaN(Date.parse(createdAt))) return null;
	if (!updatedAt || Number.isNaN(Date.parse(updatedAt))) return null;

	const audience = normalizeAudience(value.audience);
	const form = normalizeForm(value.form);
	const iterations = Array.isArray(value.iterations)
		? value.iterations
				.map((it) => normalizeIteration(it))
				.filter((it): it is DecisionIteration => it !== null)
		: [];

	const audienceLabel =
		typeof value.audienceLabel === 'string' && value.audienceLabel.trim()
			? value.audienceLabel.trim()
			: audience.label;

	const titleRaw = typeof value.title === 'string' ? value.title.trim() : '';
	const title = titleRaw || form.decision.trim() || 'Untitled decision';
	const summary =
		typeof value.summary === 'string' && value.summary.trim()
			? value.summary.trim()
			: form.problem.trim() || undefined;

	const status = isDecisionStatus(value.status)
		? value.status
		: deriveStatusFromIterations(iterations);

	return {
		id,
		title,
		audience,
		audienceLabel,
		form,
		iterations,
		status,
		createdAt,
		updatedAt,
		summary
	};
}

export function parseConfidenceRating(text: string | undefined | null): string | null {
	if (!text) return null;
	const line = text
		.split('\n')
		.map((l) => l.trim())
		.find((l) => l.startsWith('Rating:'));
	if (!line) return null;
	return line.replace('Rating:', '').trim();
}

export function deriveStatusFromConfidence(confidence: string | undefined | null): DecisionStatus {
	const rating = parseConfidenceRating(confidence);
	if (!rating) return 'draft';
	if (rating === 'Not Ready') return 'not-ready';
	if (rating === 'Ready to Present') return 'ready';
	return 'needs-work';
}

function deriveStatusFromIterations(iterations: DecisionIteration[]): DecisionStatus {
	if (iterations.length === 0) return 'draft';
	const latest = iterations[iterations.length - 1];
	return deriveStatusFromConfidence(latest.outputs.confidence);
}

function readAll(): DecisionRecord[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem(DECISIONS_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map((item) => normalizeRecord(item))
			.filter((item): item is DecisionRecord => item !== null)
			.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
	} catch {
		return [];
	}
}

function writeAll(records: DecisionRecord[]) {
	if (!browser) return;
	try {
		localStorage.setItem(
			DECISIONS_STORAGE_KEY,
			JSON.stringify(records.slice(0, MAX_DECISIONS))
		);
	} catch {
		// Ignore quota and serialization errors in MVP mode.
	}
}

export function listDecisions(): DecisionRecord[] {
	return readAll();
}

export function listRecentDecisions(limit = 3): DecisionRecord[] {
	return readAll().slice(0, Math.max(0, limit));
}

export function getDecision(id: string): DecisionRecord | null {
	if (!id) return null;
	return readAll().find((item) => item.id === id) ?? null;
}

export type UpsertDraftInput = {
	id?: string;
	audience: AudienceSelection;
	form: DecisionForm;
};

export function upsertDraft(input: UpsertDraftInput): DecisionRecord | null {
	if (!browser) return null;

	const now = new Date().toISOString();
	const records = readAll();
	const targetId = input.id?.trim() || crypto.randomUUID();
	const existingIndex = records.findIndex((item) => item.id === targetId);

	const audience = normalizeAudience(input.audience);
	const form = normalizeForm(input.form);
	const title = form.decision.trim() || 'Untitled decision';
	const summary = form.problem.trim() || undefined;

	let next: DecisionRecord;
	if (existingIndex >= 0) {
		const previous = records[existingIndex];
		next = {
			...previous,
			audience,
			audienceLabel: audience.label,
			form,
			title,
			summary,
			status: deriveStatusFromIterations(previous.iterations),
			updatedAt: now
		};
		records[existingIndex] = next;
	} else {
		next = {
			id: targetId,
			title,
			audience,
			audienceLabel: audience.label,
			form,
			iterations: [],
			status: 'draft',
			createdAt: now,
			updatedAt: now,
			summary
		};
		records.unshift(next);
	}

	records.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
	writeAll(records);
	return next;
}

export type AppendIterationInput = {
	audience: AudienceSelection;
	form: DecisionForm;
	outputs: IterationOutputs;
};

export function appendIteration(
	id: string,
	input: AppendIterationInput
): DecisionRecord | null {
	if (!browser || !id) return null;

	const now = new Date().toISOString();
	const records = readAll();
	const audience = normalizeAudience(input.audience);
	const form = normalizeForm(input.form);
	const outputs = normalizeOutputs(input.outputs);
	const iteration: DecisionIteration = {
		id: crypto.randomUUID(),
		generatedAt: now,
		inputSnapshot: { audience, form },
		outputs
	};

	const existingIndex = records.findIndex((item) => item.id === id);
	let next: DecisionRecord;
	if (existingIndex >= 0) {
		const previous = records[existingIndex];
		const iterations = [...previous.iterations, iteration];
		next = {
			...previous,
			audience,
			audienceLabel: audience.label,
			form,
			title: form.decision.trim() || previous.title,
			summary: form.problem.trim() || previous.summary,
			iterations,
			status: deriveStatusFromIterations(iterations),
			updatedAt: now
		};
		records[existingIndex] = next;
	} else {
		next = {
			id,
			title: form.decision.trim() || 'Untitled decision',
			audience,
			audienceLabel: audience.label,
			form,
			iterations: [iteration],
			status: deriveStatusFromIterations([iteration]),
			createdAt: now,
			updatedAt: now,
			summary: form.problem.trim() || undefined
		};
		records.unshift(next);
	}

	records.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
	writeAll(records);
	return next;
}

export function updateLatestIterationOutputs(
	id: string,
	partial: IterationOutputs
): DecisionRecord | null {
	if (!browser || !id) return null;

	const records = readAll();
	const existingIndex = records.findIndex((item) => item.id === id);
	if (existingIndex < 0) return null;

	const previous = records[existingIndex];
	if (previous.iterations.length === 0) return null;

	const lastIndex = previous.iterations.length - 1;
	const last = previous.iterations[lastIndex];
	const merged: IterationOutputs = { ...last.outputs, ...normalizeOutputs(partial) };
	const updatedLast: DecisionIteration = { ...last, outputs: merged };
	const iterations = [...previous.iterations.slice(0, lastIndex), updatedLast];
	const now = new Date().toISOString();

	const next: DecisionRecord = {
		...previous,
		iterations,
		status: deriveStatusFromIterations(iterations),
		updatedAt: now
	};
	records[existingIndex] = next;
	records.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
	writeAll(records);
	return next;
}

export function deleteDecision(id: string): boolean {
	if (!browser) return false;
	const current = readAll();
	const next = current.filter((item) => item.id !== id);
	if (next.length === current.length) return false;
	writeAll(next);
	return true;
}

export function getLatestIteration(record: DecisionRecord): DecisionIteration | null {
	if (record.iterations.length === 0) return null;
	return record.iterations[record.iterations.length - 1];
}

export function resolveDecisionLink(record: DecisionRecord): string {
	if (record.iterations.length > 0) {
		return `/decisions/outputs?id=${encodeURIComponent(record.id)}`;
	}
	return `/decisions/new?id=${encodeURIComponent(record.id)}`;
}
