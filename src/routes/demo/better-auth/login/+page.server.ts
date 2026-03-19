/** Loads demo login page (redirects to /demo/better-auth if already signed in). Actions: signInEmail, signUpEmail. */
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async (event) => {
	// #region agent log
	fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H1',location:'src/routes/demo/better-auth/login/+page.server.ts:load',message:'demo login page load hit',data:{hasUser:!!event.locals.user},timestamp:Date.now()})}).catch(()=>{});
	// #endregion

	if (event.locals.user) {
		// #region agent log
		fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H1',location:'src/routes/demo/better-auth/login/+page.server.ts:load',message:'demo login already signed in -> redirect to demo auth index',data:{target:'/demo/better-auth'},timestamp:Date.now()})}).catch(()=>{});
		// #endregion
		return redirect(302, '/demo/better-auth');
	}
	return {};
};

export const actions: Actions = {
	signInEmail: async (event) => {
		// #region agent log
		fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H1',location:'src/routes/demo/better-auth/login/+page.server.ts:actions.signInEmail',message:'demo signInEmail action invoked',data:{},timestamp:Date.now()})}).catch(()=>{});
		// #endregion

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';

		try {
			await auth.api.signInEmail({
				body: {
					email,
					password,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Signin failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		// #region agent log
		fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H1',location:'src/routes/demo/better-auth/login/+page.server.ts:actions.signInEmail',message:'demo signInEmail successful -> redirect target',data:{target:'/demo/better-auth'},timestamp:Date.now()})}).catch(()=>{});
		// #endregion

		return redirect(302, '/demo/better-auth');
	},
	signUpEmail: async (event) => {
		// #region agent log
		fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H1',location:'src/routes/demo/better-auth/login/+page.server.ts:actions.signUpEmail',message:'demo signUpEmail action invoked',data:{},timestamp:Date.now()})}).catch(()=>{});
		// #endregion

		const formData = await event.request.formData();
		const email = formData.get('email')?.toString() ?? '';
		const password = formData.get('password')?.toString() ?? '';
		const name = formData.get('name')?.toString() ?? '';

		try {
			await auth.api.signUpEmail({
				body: {
					email,
					password,
					name,
					callbackURL: '/auth/verification-success'
				}
			});
		} catch (error) {
			if (error instanceof APIError) {
				return fail(400, { message: error.message || 'Registration failed' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		// #region agent log
		fetch('http://127.0.0.1:7340/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b68eac'},body:JSON.stringify({sessionId:'b68eac',runId:'pre-fix',hypothesisId:'H1',location:'src/routes/demo/better-auth/login/+page.server.ts:actions.signUpEmail',message:'demo signUpEmail successful -> redirect target',data:{target:'/demo/better-auth'},timestamp:Date.now()})}).catch(()=>{});
		// #endregion

		return redirect(302, '/demo/better-auth');
	}
};
