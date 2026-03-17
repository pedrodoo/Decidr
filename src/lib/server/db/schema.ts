/**
 * Main app tables (Drizzle). Auth-related tables (user, session, etc.) live in auth.schema.ts (Better Auth–generated).
 */
import { pgTable, serial, integer, text } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export * from './auth.schema';
