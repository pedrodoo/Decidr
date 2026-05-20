import type { LayoutServerLoad } from './$types';
import { getRateLimitStatus } from '$lib/server/rate-limit';
import { buildTrialUsage } from '$lib/server/trial-limits';

export const load: LayoutServerLoad = async ({ locals, getClientAddress }) => {
	const rateLimit = getRateLimitStatus(getClientAddress());
	const trialUsage =
		!locals.user && locals.trialLead ? buildTrialUsage(locals.trialLead) : null;

	return {
		user: locals.user ?? null,
		trialLead: locals.trialLead
			? {
					email: locals.trialLead.email
				}
			: null,
		trialUsage,
		rateLimit
	};
};
