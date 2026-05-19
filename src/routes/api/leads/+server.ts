import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { upsertLeadByEmail } from '$lib/server/leads';
import { isValidEmail, setTrialCookie } from '$lib/server/trial';

// Simple in-memory rate limit for public lead capture
const ipLog = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 20;

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const windowStart = now - WINDOW_MS;
	const recent = (ipLog.get(ip) ?? []).filter((t) => t > windowStart);
	if (recent.length >= MAX_PER_IP) return true;
	recent.push(now);
	ipLog.set(ip, recent);
	return false;
}

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	const ip = getClientAddress();
	if (isRateLimited(ip)) {
		throw error(429, 'Too many requests. Try again later.');
	}

	let body: { email?: string };
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid request body');
	}

	const email = body.email?.trim() ?? '';
	if (!email || !isValidEmail(email)) {
		throw error(400, 'A valid email address is required.');
	}

	const row = await upsertLeadByEmail(email);
	if (!row) {
		throw error(500, 'Could not save your email. Please try again.');
	}

	if (row.status === 'rejected') {
		throw error(403, 'This email is not eligible for trial access.');
	}

	setTrialCookie(cookies, row.id);

	return json({ ok: true, email: row.email });
};
