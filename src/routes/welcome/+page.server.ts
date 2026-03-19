/**
 * First-run landing page after authentication.
 * - Requires a session (event.locals.user).
 * - Provides a single CTA into the existing stable decision flow.
 */
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	// #region agent log
	fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H3',location:'src/routes/welcome/+page.server.ts:load',message:'welcome route load hit',data:{hasUser:!!event.locals.user},timestamp:Date.now()})}).catch(()=>{});
	// #endregion

	if (!event.locals.user) {
		// #region agent log
		fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H3',location:'src/routes/welcome/+page.server.ts:load',message:'welcome unauthenticated redirecting',data:{target:'/login'},timestamp:Date.now()})}).catch(()=>{});
		// #endregion

		return redirect(302, '/login');
	}
	return {};
};

