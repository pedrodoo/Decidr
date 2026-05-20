<script lang="ts">
	import { strings } from '$lib/strings.js';
	import { invalidateAll } from '$app/navigation';
	import type { TrialUsage } from '$lib/server/trial-limits';

	let {
		trialUsage,
		variant = 'limit'
	}: {
		trialUsage: TrialUsage;
		variant?: 'limit' | 'locked-modes';
	} = $props();

	const t = strings.trial;
	let loading = $state(false);
	let error = $state('');
	const sent = $derived(trialUsage.status === 'approval_requested');

	const title = $derived(
		variant === 'locked-modes' ? t.lockedCommunicateTitle : t.limitReachedTitle
	);
	const body = $derived(
		variant === 'locked-modes' ? t.lockedModesBody : t.limitReachedBody
	);

	async function requestAccess() {
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/leads/request-access', { method: 'POST' });
			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(payload.message ?? t.requestFailed);
			}
			await invalidateAll();
		} catch (e) {
			error = e instanceof Error ? e.message : t.requestFailed;
		} finally {
			loading = false;
		}
	}
</script>

<div class="trial-panel" role="region" aria-label={title}>
	<p class="trial-panel-title">{title}</p>
	<p class="trial-panel-body">{body}</p>
	{#if sent}
		<p class="trial-panel-sent" role="status">{t.requestSent}</p>
	{:else}
		<button class="btn-primary" type="button" onclick={requestAccess} disabled={loading}>
			{loading ? strings.common.generating : t.requestAccess}
		</button>
	{/if}
	{#if error}
		<p class="trial-panel-error">{error}</p>
	{/if}
</div>

<style>
	.trial-panel {
		padding: 20px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
		margin: 16px 0;
	}

	.trial-panel-title {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 8px;
	}

	.trial-panel-body {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 16px;
	}

	.trial-panel-sent {
		font-size: var(--text-sm);
		color: var(--accent-text-green);
	}

	.trial-panel-error {
		font-size: var(--text-sm);
		color: var(--semantic-danger);
		margin-top: 10px;
	}
</style>
