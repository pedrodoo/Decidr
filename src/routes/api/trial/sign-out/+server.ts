import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearTrialCookie } from '$lib/server/trial';

export const POST: RequestHandler = async ({ cookies }) => {
	clearTrialCookie(cookies);
	return json({ ok: true });
};
