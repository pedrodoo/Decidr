/**
 * Drizzle client for Neon. Used by server code (e.g. auth adapter, future API and decision log).
 * Schema is in ./schema.ts; auth tables are in ./auth.schema.ts (Better Auth–generated).
 */
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = neon(env.DATABASE_URL);

export const db = drizzle(client, { schema });
