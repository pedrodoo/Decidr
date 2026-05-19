import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { lead as leadTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

type ActivityPayload = {
	event?: string;
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.trialLead) {
		throw error(401, 'Unauthorised');
	}

	let payload: ActivityPayload;
	try {
		payload = (await request.json()) as ActivityPayload;
	} catch {
		throw error(400, 'Invalid request body');
	}

	if (payload.event === 'onboarding_complete') {
		await db
			.update(leadTable)
			.set({
				onboardingCompletedAt: new Date(),
				lastSeenAt: new Date()
			})
			.where(eq(leadTable.id, locals.trialLead.id));
	}

	return json({ ok: true });
};
