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

export type CreateInviteOptions = {
	email?: string;
	leadId?: number;
	source?: 'direct' | 'lead_approval';
};

export async function createInvite(options: CreateInviteOptions = {}): Promise<{
	token: string;
	inviteId: number;
}> {
	const token = generateToken();
	const [row] = await db
		.insert(invite)
		.values({
			tokenHash: hashToken(token),
			email: options.email ?? null,
			leadId: options.leadId ?? null,
			source: options.source ?? 'direct'
		})
		.returning({ id: invite.id });

	if (!row) {
		throw new Error('Failed to create invite.');
	}

	return { token, inviteId: row.id };
}

/** @deprecated Use createInvite({ email }) — kept for scripts that expect token string only. */
export async function createInviteToken(email?: string): Promise<string> {
	const { token } = await createInvite({ email, source: 'direct' });
	return token;
}

export async function validateInvite(token: string) {
	const hash = hashToken(token);
	const [row] = await db.select().from(invite).where(eq(invite.tokenHash, hash));
	if (!row) return { valid: false as const, reason: 'not_found' as const };
	if (row.usedAt) return { valid: false as const, reason: 'already_used' as const };
	return { valid: true as const, invite: row };
}

export async function consumeInvite(token: string) {
	const hash = hashToken(token);
	const [row] = await db.select().from(invite).where(eq(invite.tokenHash, hash));
	if (!row) return null;

	await db.update(invite).set({ usedAt: new Date() }).where(eq(invite.id, row.id));
	return row;
}
