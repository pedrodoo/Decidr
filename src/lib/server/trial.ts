/**
 * Signed httpOnly cookie for homepage trial leads (no Better Auth account yet).
 */
import { createHmac, timingSafeEqual } from 'crypto';
import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { lead } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const TRIAL_COOKIE_NAME = 'decidr_trial';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 90; // 90 days

export type TrialLead = {
	id: number;
	email: string;
	status: string;
	generateCount: number;
};

function getSecret(): string {
	const secret = env.BETTER_AUTH_SECRET?.trim();
	if (!secret) throw new Error('BETTER_AUTH_SECRET is not configured');
	return secret;
}

function signPayload(leadId: number): string {
	const payload = String(leadId);
	const sig = createHmac('sha256', getSecret()).update(payload).digest('base64url');
	return `${payload}.${sig}`;
}

function verifySignedValue(value: string): number | null {
	const dot = value.lastIndexOf('.');
	if (dot === -1) return null;
	const payload = value.slice(0, dot);
	const sig = value.slice(dot + 1);
	const leadId = Number(payload);
	if (!Number.isInteger(leadId) || leadId < 1) return null;

	const expected = createHmac('sha256', getSecret()).update(payload).digest('base64url');
	try {
		const a = Buffer.from(sig);
		const b = Buffer.from(expected);
		if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
	} catch {
		return null;
	}
	return leadId;
}

export function setTrialCookie(cookies: Cookies, leadId: number): void {
	cookies.set(TRIAL_COOKIE_NAME, signPayload(leadId), {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: COOKIE_MAX_AGE_SECONDS
	});
}

export function clearTrialCookie(cookies: Cookies): void {
	cookies.delete(TRIAL_COOKIE_NAME, { path: '/' });
}

export async function getTrialLeadFromCookies(cookies: Cookies): Promise<TrialLead | null> {
	const raw = cookies.get(TRIAL_COOKIE_NAME);
	if (!raw) return null;

	const leadId = verifySignedValue(raw);
	if (!leadId) return null;

	const [row] = await db.select().from(lead).where(eq(lead.id, leadId));
	if (!row) return null;
	if (row.status === 'rejected') return null;

	return {
		id: row.id,
		email: row.email,
		status: row.status,
		generateCount: row.generateCount
	};
}

export function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
