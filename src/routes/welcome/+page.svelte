<script lang="ts">
	import { onMount } from 'svelte';
	import { strings } from '$lib/strings.js';
	import {
		listRecentDecisions,
		resolveDecisionLink,
		STATUS_LABELS,
		type DecisionRecord
	} from '$lib/decisions/storage';

	let recentDecisions = $state<DecisionRecord[]>([]);
	const s = strings.welcome;

	function formatDate(isoDate: string): string {
		const date = new Date(isoDate);
		return new Intl.DateTimeFormat('pt-PT', {
			day: '2-digit',
			month: 'short'
		}).format(date);
	}

	const ctaLabel = $derived(
		recentDecisions.length === 0 ? s.startFirstDecision : s.startNewDecision
	);

	onMount(() => {
		recentDecisions = listRecentDecisions(3);
	});
</script>

<svelte:head>
	<title>{s.pageTitle}</title>
</svelte:head>

<main id="main" class="page">
	<h1 class="sr-only">{s.pageSrOnlyTitle}</h1>

	<section class="card">
		<div class="eyebrow">{s.eyebrow}</div>
		<h2 class="title">{s.title}</h2>
		<p class="subtitle">{s.subtitle}</p>

		<div class="ctaRow">
			<a class="btn-primary cta" href="/decisions/new">
				{ctaLabel}
				<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
					<path
						d="M5 3l4 4-4 4"
						stroke="white"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</a>
		</div>
	</section>

	{#if recentDecisions.length > 0}
		<section class="recent">
			<div class="recent-header">
				<h2>{s.recentTitle}</h2>
				<a class="view-all" href="/decisions">{s.viewAll}</a>
			</div>
			<div class="recent-list">
				{#each recentDecisions as decision (decision.id)}
					<a class="recent-item" href={resolveDecisionLink(decision)}>
						<div class="recent-item-main">
							<h3>{decision.title}</h3>
							<p>{decision.audienceLabel}</p>
						</div>
						<div class="recent-item-meta">
							<span class="status-pill status-{decision.status}">
								{STATUS_LABELS[decision.status]}
							</span>
							<span class="recent-item-date">{formatDate(decision.updatedAt)}</span>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</main>

<style>
	.page {
		max-width: 760px;
		margin: 0 auto;
		padding: 48px 24px 100px;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.card {
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 10px;
		padding: 28px;
		margin-bottom: 16px;
	}

	.eyebrow {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent-text-orange);
		margin-bottom: 12px;
	}

	.title {
		font-size: var(--text-xxl);
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		margin-bottom: 12px;
	}

	.subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
		margin-bottom: 20px;
		max-width: 620px;
	}

	.ctaRow {
		display: flex;
		align-items: center;
	}

	.cta {
		text-decoration: none;
	}

	.recent {
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 10px;
		padding: 22px;
	}

	.recent-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 14px;
	}

	.recent-header h2 {
		font-size: 17px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.view-all {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		text-decoration: none;
	}

	.recent-list {
		display: flex;
		flex-direction: column;
	}

	.recent-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		padding: 12px 0;
		border-top: 1px solid var(--border);
		text-decoration: none;
		color: inherit;
		transition: background 0.15s;
		border-radius: 6px;
		margin: 0 -8px;
		padding-left: 8px;
		padding-right: 8px;
	}

	.recent-item:hover {
		background: var(--surface-2);
	}

	.recent-item:first-child {
		border-top: 0;
	}

	.recent-item-main {
		min-width: 0;
		flex: 1;
	}

	.recent-item h3 {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 2px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.recent-item p {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.recent-item-meta {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;
	}

	.recent-item-date {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-muted);
	}

	.status-pill {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		border-radius: 999px;
		padding: 3px 8px;
		border: 1px solid var(--border);
		color: var(--text-secondary);
		background: var(--surface);
	}

	.status-pill.status-draft {
		color: var(--text-muted);
	}
	.status-pill.status-not-ready {
		color: var(--semantic-danger);
		border-color: rgba(248, 113, 113, 0.3);
		background: rgba(248, 113, 113, 0.06);
	}
	.status-pill.status-needs-work {
		color: var(--semantic-warning);
		border-color: rgba(245, 158, 11, 0.3);
		background: rgba(245, 158, 11, 0.06);
	}
	.status-pill.status-ready {
		color: var(--semantic-success);
		border-color: rgba(52, 211, 153, 0.3);
		background: rgba(52, 211, 153, 0.06);
	}
</style>
