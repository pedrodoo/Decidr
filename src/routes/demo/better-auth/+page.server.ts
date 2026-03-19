/** Loads signed-in user for demo; redirects to login if no session. Handles signOut action. */
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = async (event) => {
	// #region agent log
	fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H1',location:'src/routes/demo/better-auth/+page.server.ts:load',message:'demo auth index route load hit',data:{hasUser:!!event.locals.user},timestamp:Date.now()})}).catch(()=>{});
	// #endregion

	if (!event.locals.user) {
		// #region agent log
		fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H1',location:'src/routes/demo/better-auth/+page.server.ts:load',message:'demo auth index unauthenticated -> redirect to demo login',data:{target:'/demo/better-auth/login'},timestamp:Date.now()})}).catch(()=>{});
		// #endregion
		return redirect(302, '/demo/better-auth/login');
	}
	return { user: event.locals.user };
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/demo/better-auth/login');
	}
};
