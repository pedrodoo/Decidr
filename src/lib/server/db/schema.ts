/**
 * Main app tables (Drizzle). Auth-related tables (user, session, etc.) live in auth.schema.ts (Better Auth–generated).
 */
import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const bugReport = pgTable('bug_report', {
	id: serial('id').primaryKey(),
	userId: text('user_id'),
	leadId: integer('lead_id'),
	email: text('email').notNull(),
	description: text('description').notNull(),
	whereFound: text('where_found').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const invite = pgTable('invite', {
	id: serial('id').primaryKey(),
	tokenHash: text('token_hash').notNull().unique(),
	email: text('email'),
	leadId: integer('lead_id'),
	source: text('source').notNull().default('direct'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	usedAt: timestamp('used_at', { withTimezone: true })
});

/** App profile for every Better Auth user (direct invite or converted lead). */
export const userProfile = pgTable('user_profile', {
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

/** Homepage email capture + trial lifecycle (see email-first trial plan). */
export const lead = pgTable('lead', {
	id: serial('id').primaryKey(),
	email: text('email').notNull().unique(),
	status: text('status').notNull().default('trial'),
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

export * from './auth.schema';
