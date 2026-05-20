import { db } from '$lib/server/db';
import { lead as leadTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { createInvite } from '$lib/server/invites';
import { env } from '$env/dynamic/private';

const APPROVABLE_STATUSES = ['trial', 'approval_requested'] as const;

export type ApproveLeadResult = {
	email: string;
	joinUrl: string;
	leadId: number;
	inviteId: number;
};

export async function approveLeadByEmail(rawEmail: string): Promise<ApproveLeadResult> {
	const email = rawEmail.trim().toLowerCase();
	if (!email) {
		throw new Error('Email is required.');
	}

	const [row] = await db.select().from(leadTable).where(eq(leadTable.email, email));
	if (!row) {
		throw new Error(`No lead found for ${email}.`);
	}

	if (!APPROVABLE_STATUSES.includes(row.status as (typeof APPROVABLE_STATUSES)[number])) {
		throw new Error(
			`Lead status is "${row.status}" — only trial or approval_requested leads can be approved.`
		);
	}

	const now = new Date();
	const { token, inviteId } = await createInvite({
		email,
		leadId: row.id,
		source: 'lead_approval'
	});

	await db
		.update(leadTable)
		.set({
			status: 'approved',
			approvedAt: now,
			inviteId,
			lastSeenAt: now
		})
		.where(eq(leadTable.id, row.id));

	const origin = env.ORIGIN ?? 'http://localhost:5173';
	const joinUrl = `${origin}/join/${token}`;

	return {
		email,
		joinUrl,
		leadId: row.id,
		inviteId
	};
}
