import { browser } from '$app/environment';
import {
	getDecision,
	type DecisionIteration,
	type DecisionRecord
} from '$lib/decisions/storage';
import {
	DEMO_AUDIENCE,
	DEMO_DECISION_ID,
	DEMO_FORM,
	DEMO_OUTPUTS
} from '$lib/demo/example-decision';

function readAllRaw(): DecisionRecord[] {
	if (!browser) return [];
	try {
		const raw = localStorage.getItem('decidr:decisions:v2');
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? (parsed as DecisionRecord[]) : [];
	} catch {
		return [];
	}
}

function writeAllRaw(records: DecisionRecord[]) {
	if (!browser) return;
	try {
		localStorage.setItem('decidr:decisions:v2', JSON.stringify(records.slice(0, 100)));
	} catch {
		/* ignore */
	}
}

/** Persist the guided-tour example as a local decision with static outputs. */
export function seedDemoDecisionRecord(): DecisionRecord {
	const now = new Date().toISOString();
	const iteration: DecisionIteration = {
		id: crypto.randomUUID(),
		generatedAt: now,
		inputSnapshot: {
			audience: { ...DEMO_AUDIENCE },
			form: { ...DEMO_FORM }
		},
		outputs: { ...DEMO_OUTPUTS }
	};

	const record: DecisionRecord = {
		id: DEMO_DECISION_ID,
		title: DEMO_FORM.decision,
		audience: { ...DEMO_AUDIENCE },
		audienceLabel: DEMO_AUDIENCE.label,
		form: { ...DEMO_FORM },
		iterations: [iteration],
		status: 'needs-work',
		createdAt: now,
		updatedAt: now,
		summary: DEMO_FORM.problem
	};

	if (!browser) return record;

	const records = readAllRaw().filter((r) => r.id !== DEMO_DECISION_ID);
	records.unshift(record);
	writeAllRaw(records);
	return record;
}

export function getDemoDecisionRecord(): DecisionRecord | null {
	if (!browser) return null;
	return getDecision(DEMO_DECISION_ID) ?? null;
}
