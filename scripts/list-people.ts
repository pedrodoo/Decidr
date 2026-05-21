/**
 * List trial leads, approved leads, and invited users with usage signals.
 * Usage: pnpm list-people [--segment=trial_lead|approval_requested|...]
 */
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { desc } from 'drizzle-orm';
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
	userId: text('user_id'),
	inviteId: integer('invite_id'),
	generateCount: integer('generate_count').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	approvedAt: timestamp('approved_at', { withTimezone: true }),
	convertedAt: timestamp('converted_at', { withTimezone: true }),
	approvalRequestedAt: timestamp('approval_requested_at', { withTimezone: true }),
	onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),
	firstGenerateAt: timestamp('first_generate_at', { withTimezone: true }),
	lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
});

const userProfile = pgTable('user_profile', {
	userId: text('user_id').primaryKey(),
	email: text('email').notNull(),
	origin: text('origin').notNull(),
	leadId: integer('lead_id'),
	inviteId: integer('invite_id'),
	generateCount: integer('generate_count').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),
	firstGenerateAt: timestamp('first_generate_at', { withTimezone: true }),
	lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
});

const db = drizzle(neon(url), { schema: { invite, lead, userProfile } });

const TRIAL_LIMIT = 2;

type Segment =
	| 'trial_lead'
	| 'approval_requested'
	| 'approved_lead'
	| 'converted_lead'
	| 'invited_user'
	| 'rejected';

type PersonRow = {
	email: string;
	segment: Segment;
	onboarding: string;
	generates: string;
	lastSeen: string;
	status: string;
	sortAt: number;
};

const SEGMENTS: Segment[] = [
	'trial_lead',
	'approval_requested',
	'approved_lead',
	'converted_lead',
	'invited_user',
	'rejected'
];

function parseArgs() {
	const segmentArg = process.argv.find((arg) => arg.startsWith('--segment='));
	const segment = segmentArg?.split('=')[1]?.trim() as Segment | undefined;
	if (segment && !SEGMENTS.includes(segment)) {
		console.error(`Unknown segment "${segment}". Valid: ${SEGMENTS.join(', ')}`);
		process.exit(1);
	}
	return { segment };
}

function segmentFromLeadStatus(status: string): Segment {
	switch (status) {
		case 'trial':
			return 'trial_lead';
		case 'approval_requested':
			return 'approval_requested';
		case 'approved':
			return 'approved_lead';
		case 'converted':
			return 'converted_lead';
		case 'rejected':
			return 'rejected';
		default:
			return 'trial_lead';
	}
}

function formatRelative(date: Date | null | undefined): string {
	if (!date) return '—';
	const ms = Date.now() - date.getTime();
	if (ms < 0) return 'just now';
	const minutes = Math.floor(ms / 60_000);
	if (minutes < 1) return 'just now';
	if (minutes < 60) return `${minutes}m ago`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d ago`;
	return date.toISOString().slice(0, 10);
}

function formatGenerates(count: number, segment: Segment): string {
	if (segment === 'approved_lead') return '—';
	if (segment === 'trial_lead' || segment === 'approval_requested' || segment === 'rejected') {
		return `${count}/${TRIAL_LIMIT}`;
	}
	return String(count);
}

function formatOnboarding(done: boolean | null | undefined): string {
	if (done == null) return '—';
	return done ? 'yes' : 'no';
}

function leadStatusLabel(
	segment: Segment,
	leadStatus: string,
	inviteUsed: boolean | null
): string {
	switch (segment) {
		case 'trial_lead':
			return 'trial';
		case 'approval_requested':
			return 'pending approval';
		case 'approved_lead':
			return inviteUsed ? 'joined' : 'pending join';
		case 'converted_lead':
			return 'active';
		case 'invited_user':
			return 'active';
		case 'rejected':
			return 'rejected';
		default:
			return leadStatus;
	}
}

function pad(value: string, width: number): string {
	return value.length >= width ? value : value + ' '.repeat(width - value.length);
}

function printTable(rows: PersonRow[]) {
	const headers = ['EMAIL', 'SEGMENT', 'ONBOARDING', 'GENERATES', 'LAST SEEN', 'STATUS'];
	const widths = [28, 20, 11, 10, 11, 16];

	console.log('');
	console.log(headers.map((h, i) => pad(h, widths[i])).join('  '));
	console.log(widths.map((w) => '─'.repeat(w)).join('  '));

	for (const row of rows) {
		const cells = [
			row.email,
			row.segment,
			row.onboarding,
			row.generates,
			row.lastSeen,
			row.status
		];
		console.log(cells.map((cell, i) => pad(cell, widths[i])).join('  '));
	}

	console.log('');
	console.log(`${rows.length} ${rows.length === 1 ? 'person' : 'people'}`);
	console.log('');
}

const { segment: segmentFilter } = parseArgs();

const [leads, profiles, invites] = await Promise.all([
	db.select().from(lead).orderBy(desc(lead.createdAt)),
	db.select().from(userProfile).orderBy(desc(userProfile.createdAt)),
	db.select().from(invite).orderBy(desc(invite.createdAt))
]);

const inviteById = new Map(invites.map((row) => [row.id, row]));
const byEmail = new Map<string, PersonRow>();

for (const row of leads) {
	const segment = segmentFromLeadStatus(row.status);
	const linkedInvite = row.inviteId ? inviteById.get(row.inviteId) : undefined;

	byEmail.set(row.email, {
		email: row.email,
		segment,
		onboarding: formatOnboarding(!!row.onboardingCompletedAt),
		generates: formatGenerates(row.generateCount, segment),
		lastSeen: formatRelative(row.lastSeenAt ?? row.createdAt),
		status: leadStatusLabel(segment, row.status, linkedInvite?.usedAt != null),
		sortAt: (row.lastSeenAt ?? row.createdAt)?.getTime() ?? 0
	});
}

for (const profile of profiles) {
	const existing = byEmail.get(profile.email);

	if (existing?.segment === 'converted_lead' || profile.leadId) {
		byEmail.set(profile.email, {
			email: profile.email,
			segment: 'converted_lead',
			onboarding: formatOnboarding(!!profile.onboardingCompletedAt),
			generates: formatGenerates(profile.generateCount, 'converted_lead'),
			lastSeen: formatRelative(profile.lastSeenAt ?? profile.createdAt),
			status: 'active',
			sortAt: (profile.lastSeenAt ?? profile.createdAt)?.getTime() ?? 0
		});
		continue;
	}

	if (existing) {
		if (existing.segment === 'approved_lead') {
			byEmail.set(profile.email, {
				email: profile.email,
				segment: 'converted_lead',
				onboarding: formatOnboarding(!!profile.onboardingCompletedAt),
				generates: formatGenerates(profile.generateCount, 'converted_lead'),
				lastSeen: formatRelative(profile.lastSeenAt ?? profile.createdAt),
				status: 'active',
				sortAt: (profile.lastSeenAt ?? profile.createdAt)?.getTime() ?? 0
			});
		}
		continue;
	}

	const inviteRow = profile.inviteId ? inviteById.get(profile.inviteId) : undefined;

	byEmail.set(profile.email, {
		email: profile.email,
		segment: 'invited_user',
		onboarding: formatOnboarding(!!profile.onboardingCompletedAt),
		generates: formatGenerates(profile.generateCount, 'invited_user'),
		lastSeen: formatRelative(profile.lastSeenAt ?? profile.createdAt),
		status: inviteRow?.usedAt ? 'active' : 'pending join',
		sortAt: (profile.lastSeenAt ?? profile.createdAt)?.getTime() ?? 0
	});
}

let rows = [...byEmail.values()].sort((a, b) => b.sortAt - a.sortAt);

if (segmentFilter) {
	rows = rows.filter((row) => row.segment === segmentFilter);
}

if (rows.length === 0) {
	console.log('');
	console.log(segmentFilter ? `No people in segment "${segmentFilter}".` : 'No people found.');
	console.log('');
	process.exit(0);
}

printTable(rows);
