import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { bugReport } from '$lib/server/db/schema';

type BugReportPayload = {
	description?: string;
	whereFound?: string;
	email?: string;
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const user = locals.user;
	const trialLead = locals.trialLead;

	if (!user && !trialLead) {
		throw error(401, 'Unauthorised');
	}

	let payload: BugReportPayload;
	try {
		payload = (await request.json()) as BugReportPayload;
	} catch {
		throw error(400, 'Invalid request body');
	}

	const description = payload.description?.trim() ?? '';
	const whereFound = payload.whereFound?.trim() ?? '';
	const email = payload.email?.trim() ?? '';

	if (!description) throw error(400, 'Description is required.');
	if (!whereFound) throw error(400, 'Where found is required.');
	if (!email) throw error(400, 'Email is required.');

	if (trialLead && email.toLowerCase() !== trialLead.email.toLowerCase()) {
		throw error(400, 'Email must match your trial sign-up email.');
	}

	try {
		await db.insert(bugReport).values({
			userId: user?.id ?? null,
			leadId: trialLead?.id ?? null,
			email,
			description,
			whereFound
		});
	} catch {
		throw error(500, 'Failed to save bug report.');
	}

	return json({ success: true });
};
