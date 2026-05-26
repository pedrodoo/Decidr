import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Former tour intro — merged into /welcome. */
export const load: PageServerLoad = async (event) => {
	if (!event.locals.user && !event.locals.trialLead) {
		return redirect(302, '/login');
	}
	return redirect(302, '/welcome');
};
