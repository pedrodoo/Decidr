import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const parentData = await event.parent();
	const isDemo = event.url.searchParams.get('demo') === '1';

	if (isDemo) {
		if (!event.locals.user && !event.locals.trialLead) {
			return redirect(302, '/login');
		}
		return { isDemo: true as const, trialUsage: parentData.trialUsage };
	}

	if (!event.locals.user && !event.locals.trialLead) {
		return redirect(302, '/login');
	}

	return { isDemo: false as const, trialUsage: parentData.trialUsage };
};
