/**
 * Post-login or post-email trial landing (trial hub).
 */
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { lead as leadTable } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export type WelcomeTrialState = 'first' | 'returning';

export const load: PageServerLoad = async (event) => {
	const { user, trialLead } = event.locals;
	const skipTour = event.url.searchParams.get('skip') === '1';

	if (!user && !trialLead) {
		return redirect(302, '/login');
	}

	if (user) {
		return {
			isTrial: false,
			trialState: null
		};
	}

	const [row] = await db
		.select({ onboardingCompletedAt: leadTable.onboardingCompletedAt })
		.from(leadTable)
		.where(eq(leadTable.id, trialLead!.id));

	const trialState: WelcomeTrialState =
		skipTour || row?.onboardingCompletedAt ? 'returning' : 'first';

	return {
		isTrial: true,
		trialState
	};
};
