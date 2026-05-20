import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { lead as leadTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.trialLead) {
		throw error(401, 'Unauthorised');
	}

	const [row] = await db.select().from(leadTable).where(eq(leadTable.id, locals.trialLead.id));
	if (!row) {
		throw error(404, 'Lead not found');
	}

	if (row.status === 'approval_requested') {
		return json({ ok: true, status: 'approval_requested' });
	}

	if (row.status !== 'trial') {
		throw error(400, 'Full access cannot be requested for this account state.');
	}

	await db
		.update(leadTable)
		.set({
			status: 'approval_requested',
			approvalRequestedAt: new Date(),
			lastSeenAt: new Date()
		})
		.where(eq(leadTable.id, locals.trialLead.id));

	return json({ ok: true, status: 'approval_requested' });
};
