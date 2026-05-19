import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Interactive tour steps (Phase 3). */
export const load: PageServerLoad = async (event) => {
	if (!event.locals.user && !event.locals.trialLead) {
		return redirect(302, '/login');
	}
	return {};
};
