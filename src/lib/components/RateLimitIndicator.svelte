<script lang="ts">
	import { strings } from '$lib/strings.js';
	import { clientRateLimit, type ClientRateLimitStatus } from '$lib/stores/rate-limit';
	import type { TrialUsage } from '$lib/server/trial-limits';

	type Props = {
		serverRateLimit: { limit: number; remaining: number; resetAt: number };
		trialUsage?: TrialUsage | null;
	};

	let { serverRateLimit, trialUsage = null }: Props = $props();

	const r = strings.rateLimit;
	let live = $state<ClientRateLimitStatus | null>(null);

	$effect(() => {
		const unsub = clientRateLimit.subscribe((v) => {
			live = v;
		});
		return unsub;
	});

	const status = $derived(live ?? serverRateLimit);

	function formatReset(unixSeconds: number): string {
		const date = new Date(unixSeconds * 1000);
		return new Intl.DateTimeFormat('pt-PT', {
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}

	const hourlyLabel = $derived(
		status.remaining === 0
			? r.limitReached.replace('{time}', formatReset(status.resetAt))
			: r.remaining
					.replace('{remaining}', String(status.remaining))
					.replace('{limit}', String(status.limit))
	);
</script>

<div class="rate-limit" role="status">
	{#if trialUsage}
		<span class="rate-trial-line">
			{r.trialHourlyLine
				.replace('{used}', String(trialUsage.used))
				.replace('{limit}', String(trialUsage.limit))
				.replace('{hourlyRemaining}', String(status.remaining))
				.replace('{hourlyLimit}', String(status.limit))}
		</span>
	{:else}
		<span class="rate-line">{r.hourlyLimit.replace('{limit}', String(status.limit))}</span>
		<span class="rate-line">{hourlyLabel}</span>
	{/if}
</div>

<style>
	.rate-limit {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 12px;
		font-size: var(--text-xs);
		color: var(--text-muted);
	}

	.rate-trial-line,
	.rate-line {
		font-family: var(--font-mono);
		letter-spacing: 0.03em;
	}
</style>
