import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user && !event.locals.trialLead) {
		return redirect(302, '/login');
	}

	const parentData = await event.parent();

	return {
		isTrial: !event.locals.user && !!event.locals.trialLead,
		trialUsage: parentData.trialUsage
	};
};
