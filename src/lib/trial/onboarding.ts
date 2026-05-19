/** Client-side mirror of tour completion (server source of truth: lead.onboarding_completed_at). */
export const ONBOARDING_COMPLETED_KEY = 'decidr:onboarding-completed';

export function readOnboardingCompletedLocal(): boolean {
	if (typeof localStorage === 'undefined') return false;
	try {
		return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === '1';
	} catch {
		return false;
	}
}

export function writeOnboardingCompletedLocal(): void {
	try {
		localStorage.setItem(ONBOARDING_COMPLETED_KEY, '1');
	} catch {
		/* ignore quota / private mode */
	}
}
