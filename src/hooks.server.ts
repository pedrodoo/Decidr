/**
 * Server hook: runs on every request. Loads Better Auth session into event.locals (session, user), then delegates to Better Auth's SvelteKit handler for auth routes.
 */
import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auth } from '$lib/server/auth';
import { isAuthPath, svelteKitHandler } from 'better-auth/svelte-kit';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const AGENT_DEBUG_LOG = join(projectRoot, '.cursor/debug-9dda78.log');

function agentDebugNdjson(payload: Record<string, unknown>) {
	try {
		mkdirSync(dirname(AGENT_DEBUG_LOG), { recursive: true });
		appendFileSync(
			AGENT_DEBUG_LOG,
			`${JSON.stringify({ sessionId: '9dda78', timestamp: Date.now(), ...payload })}\n`
		);
	} catch {
		// ignore
	}
}

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	const trackedPath = event.url.pathname === '/login' || event.url.pathname === '/welcome';
	if (event.request.method === 'POST' && event.url.pathname === '/api/auth/sign-out') {
		// #region agent log
		agentDebugNdjson({
			runId: 'post-fix',
			hypothesisId: 'H3',
			location: 'src/hooks.server.ts:handleBetterAuth',
			message: 'Sign-out POST reached SvelteKit handle (before auth handler)',
			data: {
				hasCookieHeader: !!event.request.headers.get('cookie'),
				isAuthPath: isAuthPath(event.url.toString(), auth.options),
				requestOrigin: event.url.origin,
				configBaseURL: auth.options.baseURL ?? null
			}
		});
		// #endregion
	}
	if (trackedPath) {
		// #region agent log
		agentDebugNdjson({
			runId: 'post-fix',
			hypothesisId: 'H4',
			location: 'src/hooks.server.ts:handleBetterAuth',
			message: 'Session evaluated for tracked route',
			data: { path: event.url.pathname, hasSession: !!session, hasUser: !!session?.user }
		});
		// #endregion
	}

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
