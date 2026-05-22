<script lang="ts">
	import RateLimitIndicator from '$lib/components/RateLimitIndicator.svelte';
	import type { TrialUsage } from '$lib/server/trial-limits';

	type Props = {
		trialUsage: TrialUsage | null;
		rateLimit: { limit: number; remaining: number; resetAt: number };
		showRateLimit: boolean;
	};

	let { trialUsage, rateLimit, showRateLimit }: Props = $props();

	const showBar = $derived(showRateLimit && !trialUsage);
</script>

{#if showBar}
	<div class="trial-status-bar">
		<RateLimitIndicator serverRateLimit={rateLimit} />
	</div>
{/if}

<style>
	.trial-status-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: 12px;
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 24px 12px;
	}
</style>
