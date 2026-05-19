import { db } from '$lib/server/db';
import { lead } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function upsertLeadByEmail(email: string) {
	const normalized = email.trim().toLowerCase();

	const [existing] = await db.select().from(lead).where(eq(lead.email, normalized));

	if (existing) {
		const [updated] = await db
			.update(lead)
			.set({ lastSeenAt: new Date() })
			.where(eq(lead.id, existing.id))
			.returning();
		return updated ?? existing;
	}

	const [created] = await db
		.insert(lead)
		.values({
			email: normalized,
			status: 'trial',
			lastSeenAt: new Date()
		})
		.returning();

	return created;
}
