import { randomBytes, createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set');

const invite = pgTable('invite', {
	id: serial('id').primaryKey(),
	tokenHash: text('token_hash').notNull(),
	email: text('email'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	usedAt: timestamp('used_at', { withTimezone: true })
});

const db = drizzle(neon(url), { schema: { invite } });

const email = process.argv[2] ?? null;
const token = randomBytes(32).toString('hex');
const tokenHash = createHash('sha256').update(token).digest('hex');

await db.insert(invite).values({ tokenHash, email });

const origin = process.env.ORIGIN ?? 'http://localhost:5173';
const link = `${origin}/join/${token}`;

console.log('');
if (email) {
	console.log(`✓ Invite created for ${email}`);
} else {
	console.log('✓ Open invite created (no email restriction)');
}
console.log(`  ${link}`);
console.log('');
