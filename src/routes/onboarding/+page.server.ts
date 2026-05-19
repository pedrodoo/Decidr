import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Tour entry and walkthrough — trial cookie or authenticated session required. */
export const load: PageServerLoad = async (event) => {
	if (!event.locals.user && !event.locals.trialLead) {
		return redirect(302, '/login');
	}
	return {};
};
