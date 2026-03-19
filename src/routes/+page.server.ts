import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	// #region agent log
	fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H2',location:'src/routes/+page.server.ts:load',message:'root route auth-based redirect decision',data:{hasUser:!!event.locals.user},timestamp:Date.now()})}).catch(()=>{});
	// #endregion

	if (event.locals.user) return redirect(302, '/welcome');
	return redirect(302, '/login');
};

