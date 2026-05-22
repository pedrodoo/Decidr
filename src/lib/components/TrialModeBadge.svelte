<script lang="ts">
	import { strings } from '$lib/strings.js';
	import type { TrialUsage } from '$lib/server/trial-limits';
	import { getTrialUsageDetail } from '$lib/utils/trialUsageLabel';

	let { trialUsage }: { trialUsage: TrialUsage } = $props();

	const t = strings.trial;
	const label = $derived(getTrialUsageDetail(trialUsage));
</script>

<div class="trial-badge" role="status">
	<span class="trial-badge-label">{t.badge}</span>
	<span class="trial-badge-value">{label}</span>
</div>

<style>
	.trial-badge {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		border-radius: 999px;
		border: 1px solid var(--orange-border);
		background: var(--orange-dim);
		font-size: var(--text-xs);
	}

	.trial-badge-label {
		font-family: var(--font-mono);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--accent-text-orange);
	}

	.trial-badge-value {
		color: var(--text-secondary);
	}
</style>
