import { db } from '$lib/server/db';
import { invite, lead, userProfile } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { invite as inviteTable } from '$lib/server/db/schema';

export type InviteRow = typeof inviteTable.$inferSelect;

/** Link a new Better Auth user to their invite and optional prior lead row. */
export async function completeJoinConversion(params: {
	userId: string;
	email: string;
	inviteRow: InviteRow;
}): Promise<void> {
	const normalizedEmail = params.email.trim().toLowerCase();
	const now = new Date();

	const [existingLead] = await db
		.select()
		.from(lead)
		.where(eq(lead.email, normalizedEmail));

	const origin = existingLead ? 'lead' : 'invite';

	await db
		.insert(userProfile)
		.values({
			userId: params.userId,
			email: normalizedEmail,
			origin,
			leadId: existingLead?.id ?? params.inviteRow.leadId ?? null,
			inviteId: params.inviteRow.id,
			onboardingCompletedAt: existingLead?.onboardingCompletedAt ?? null,
			generateCount: existingLead?.generateCount ?? 0,
			firstGenerateAt: existingLead?.firstGenerateAt ?? null,
			lastSeenAt: now
		})
		.onConflictDoNothing();

	if (existingLead) {
		await db
			.update(lead)
			.set({
				status: 'converted',
				userId: params.userId,
				inviteId: params.inviteRow.id,
				convertedAt: now,
				lastSeenAt: now
			})
			.where(eq(lead.id, existingLead.id));
	}
}
