<script lang="ts">
	import { onMount } from 'svelte';
	import {
		listDecisions,
		resolveDecisionLink,
		STATUS_LABELS,
		type DecisionRecord
	} from '$lib/decisions/storage';

	let decisions = $state<DecisionRecord[]>([]);

	function formatDate(isoDate: string): string {
		const date = new Date(isoDate);
		return new Intl.DateTimeFormat('pt-PT', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		}).format(date);
	}

	onMount(() => {
		decisions = listDecisions();
	});
</script>

<svelte:head>
	<title>Decision Dashboard</title>
</svelte:head>

<main id="main" class="page">
	<div class="page-header">
		<div>
			<p class="eyebrow">Decidr</p>
			<h1 class="title">Decision Dashboard</h1>
			<p class="subtitle">All your past decisions in one place.</p>
		</div>
		<a class="btn-primary" href="/decisions/new">New decision</a>
	</div>

	{#if decisions.length === 0}
		<section class="empty-state">
			<h2>No decisions yet</h2>
			<p>Once you generate outputs, your decisions will appear here.</p>
			<a class="btn-secondary" href="/decisions/new">Start your first decision</a>
		</section>
	{:else}
		<section class="list">
			{#each decisions as decision (decision.id)}
				<a class="card" href={resolveDecisionLink(decision)}>
					<div class="card-head">
						<h2>{decision.title}</h2>
						<span class="date">{formatDate(decision.updatedAt)}</span>
					</div>
					<div class="meta-row">
						<span class="pill">{decision.audienceLabel}</span>
						<span class="pill status-pill status-{decision.status}">
							{STATUS_LABELS[decision.status]}
						</span>
						{#if decision.iterations.length > 0}
							<span class="pill">
								{decision.iterations.length} iteration{decision.iterations.length === 1 ? '' : 's'}
							</span>
						{/if}
					</div>
					{#if decision.summary}
						<p class="summary">{decision.summary}</p>
					{/if}
				</a>
			{/each}
		</section>
	{/if}
</main>

<style>
	.page {
		max-width: 820px;
		margin: 0 auto;
		padding: 48px 24px 100px;
	}

	.page-header {
		display: flex;
		gap: 18px;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 28px;
	}

	.eyebrow {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent-text-orange);
		margin-bottom: 10px;
	}

	.title {
		font-size: 30px;
		font-weight: 700;
		letter-spacing: -0.04em;
		color: var(--text-primary);
		margin-bottom: 8px;
	}

	.subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
	}

	.empty-state {
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 12px;
		padding: 28px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.empty-state h2 {
		font-size: 20px;
		color: var(--text-primary);
	}

	.empty-state p {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.card {
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 10px;
		padding: 18px;
		text-decoration: none;
		color: inherit;
		display: block;
		transition:
			border-color 0.15s,
			transform 0.1s;
	}

	.card:hover {
		border-color: var(--border-focus);
		transform: translateY(-1px);
	}

	.card-head {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		align-items: baseline;
		margin-bottom: 10px;
	}

	.card-head h2 {
		font-size: 18px;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--text-primary);
	}

	.date {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-muted);
	}

	.meta-row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 10px;
	}

	.pill {
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-secondary);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 4px 8px;
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

	.summary {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.6;
	}

	@media (max-width: 640px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
