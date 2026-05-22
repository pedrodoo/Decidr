import { strings } from '$lib/strings.js';
import type { TrialUsage } from '$lib/server/trial-limits';

export function getTrialUsageDetail(trialUsage: TrialUsage): string {
	const t = strings.trial;
	if (trialUsage.status === 'approval_requested') {
		return t.badgeApprovalPending;
	}
	return t.generationsUsed
		.replace('{used}', String(trialUsage.used))
		.replace('{limit}', String(trialUsage.limit));
}
