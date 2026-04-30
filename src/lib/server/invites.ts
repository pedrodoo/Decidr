import { randomBytes, createHash } from 'crypto';
import { db } from '$lib/server/db';
import { invite } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export function generateToken(): string {
	return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createInvite(email?: string): Promise<string> {
	const token = generateToken();
	await db.insert(invite).values({ tokenHash: hashToken(token), email: email ?? null });
	return token;
}

export async function validateInvite(token: string) {
	const hash = hashToken(token);
	const [row] = await db.select().from(invite).where(eq(invite.tokenHash, hash));
	if (!row) return { valid: false, reason: 'not_found' as const };
	if (row.usedAt) return { valid: false, reason: 'already_used' as const };
	return { valid: true, invite: row };
}

export async function consumeInvite(token: string) {
	const hash = hashToken(token);
	await db.update(invite).set({ usedAt: new Date() }).where(eq(invite.tokenHash, hash));
}
