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
	userId: text('user_id').notNull(),
	email: text('email').notNull(),
	description: text('description').notNull(),
	whereFound: text('where_found').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const invite = pgTable('invite', {
	id: serial('id').primaryKey(),
	tokenHash: text('token_hash').notNull().unique(),
	email: text('email'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	usedAt: timestamp('used_at', { withTimezone: true })
});

export * from './auth.schema';
