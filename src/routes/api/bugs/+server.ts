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
	if (!locals.user) {
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

	try {
		await db.insert(bugReport).values({
			userId: locals.user.id,
			email,
			description,
			whereFound
		});
	} catch {
		throw error(500, 'Failed to save bug report.');
	}

	return json({ success: true });
};
