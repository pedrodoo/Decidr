import { db } from '$lib/server/db';
import { lead as leadTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { TrialLead } from '$lib/server/trial';

export const TRIAL_GENERATION_LIMIT = 2;
export const TRIAL_ALLOWED_MODES = ['confidence', 'prepare'] as const;
export type TrialAllowedMode = (typeof TRIAL_ALLOWED_MODES)[number];

export type TrialUsage = {
	active: true;
	status: 'trial' | 'approval_requested';
	used: number;
	limit: number;
	remaining: number;
	canGenerate: boolean;
};

export function buildTrialUsage(lead: TrialLead): TrialUsage | null {
	if (lead.status !== 'trial' && lead.status !== 'approval_requested') {
		return null;
	}

	const used = lead.generateCount;
	const limit = TRIAL_GENERATION_LIMIT;
	const remaining = Math.max(0, limit - used);

	return {
		active: true,
		status: lead.status as TrialUsage['status'],
		used,
		limit,
		remaining,
		canGenerate: lead.status === 'trial' && used < limit
	};
}

export async function recordTrialGeneration(leadId: number): Promise<void> {
	const [row] = await db.select().from(leadTable).where(eq(leadTable.id, leadId));
	if (!row) return;

	const now = new Date();
	await db
		.update(leadTable)
		.set({
			generateCount: row.generateCount + 1,
			firstGenerateAt: row.firstGenerateAt ?? now,
			lastSeenAt: now
		})
		.where(eq(leadTable.id, leadId));
}

export function isTrialAllowedMode(mode: string): mode is TrialAllowedMode {
	return (TRIAL_ALLOWED_MODES as readonly string[]).includes(mode);
}
