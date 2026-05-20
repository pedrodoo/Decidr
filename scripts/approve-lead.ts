/**
 * Approve a homepage trial lead and create a join invite.
 * Usage: pnpm approve-lead user@example.com
 */
import { randomBytes, createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const invite = pgTable('invite', {
	id: serial('id').primaryKey(),
	tokenHash: text('token_hash').notNull(),
	email: text('email'),
	leadId: integer('lead_id'),
	source: text('source').notNull().default('direct'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	usedAt: timestamp('used_at', { withTimezone: true })
});

const lead = pgTable('lead', {
	id: serial('id').primaryKey(),
	email: text('email').notNull(),
	status: text('status').notNull(),
	inviteId: integer('invite_id'),
	approvedAt: timestamp('approved_at', { withTimezone: true }),
	lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
});

const db = drizzle(neon(url), { schema: { invite, lead } });

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

const emailArg = process.argv[2];
if (!emailArg) {
	console.error('Usage: pnpm approve-lead user@example.com');
	process.exit(1);
}

const email = emailArg.trim().toLowerCase();
const [row] = await db.select().from(lead).where(eq(lead.email, email));

if (!row) {
	console.error(`No lead found for ${email}.`);
	process.exit(1);
}

if (row.status !== 'trial' && row.status !== 'approval_requested') {
	console.error(`Lead status is "${row.status}" — only trial or approval_requested can be approved.`);
	process.exit(1);
}

const token = randomBytes(32).toString('hex');
const tokenHash = hashToken(token);

const [inviteRow] = await db
	.insert(invite)
	.values({
		tokenHash,
		email,
		leadId: row.id,
		source: 'lead_approval'
	})
	.returning({ id: invite.id });

if (!inviteRow) {
	console.error('Failed to create invite.');
	process.exit(1);
}

const now = new Date();
await db
	.update(lead)
	.set({
		status: 'approved',
		approvedAt: now,
		inviteId: inviteRow.id,
		lastSeenAt: now
	})
	.where(eq(lead.id, row.id));

const origin = process.env.ORIGIN ?? 'http://localhost:5173';
const link = `${origin}/join/${token}`;

console.log('');
console.log(`✓ Lead approved for ${email}`);
console.log(`  Lead id: ${row.id}`);
console.log(`  Invite id: ${inviteRow.id}`);
console.log(`  Join link:`);
console.log(`  ${link}`);
console.log('');
