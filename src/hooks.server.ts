/**
 * Server hook: runs on every request. Loads Better Auth session into event.locals (session, user), then delegates to Better Auth's SvelteKit handler for auth routes.
 */
import type { Handle } from '@sveltejs/kit';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	// #region agent log
	fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H3',location:'src/hooks.server.ts:handleBetterAuth',message:'better-auth session lookup',data:{hasSession:!!session,hasUser:!!session?.user},timestamp:Date.now()})}).catch(()=>{});
	// #endregion

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle: Handle = handleBetterAuth;
