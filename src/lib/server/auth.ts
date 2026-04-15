/**
 * Better Auth config: email/password, Drizzle adapter (Neon), SvelteKit cookies.
 * Used by demo routes (/demo/better-auth, login) and will protect app routes when auth is enforced.
 */
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

export const auth = betterAuth({
	// In dev, omit baseURL so Better Auth + `svelteKitHandler` match the request host (e.g. localhost
	// vs 127.0.0.1). A fixed `ORIGIN` that does not match the browser origin makes `isAuthPath` false,
	// so `/api/auth/*` falls through to SvelteKit and returns 404 for POST /api/auth/sign-out.
	baseURL: dev ? undefined : env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	plugins: [sveltekitCookies(getRequestEvent)] // make sure this is the last plugin in the array
});
