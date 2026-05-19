import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		user: locals.user ?? null,
		trialLead: locals.trialLead
			? {
					email: locals.trialLead.email
				}
			: null
	};
};
