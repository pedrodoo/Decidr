import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const isDemo = event.url.searchParams.get('demo') === '1';

	if (isDemo) {
		if (!event.locals.user && !event.locals.trialLead) {
			return redirect(302, '/login');
		}
		return { isDemo: true as const };
	}

	if (!event.locals.user && !event.locals.trialLead) {
		return redirect(302, '/login');
	}

	return { isDemo: false as const };
};
