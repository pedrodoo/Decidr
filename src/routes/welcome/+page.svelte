<script lang="ts">
	import { onMount } from 'svelte';
	import { listRecentDecisions, type DecisionHistoryItem } from '$lib/decisions/storage';

	let recentDecisions = $state<DecisionHistoryItem[]>([]);

	function formatDate(isoDate: string): string {
		const date = new Date(isoDate);
		return new Intl.DateTimeFormat('pt-PT', {
			day: '2-digit',
			month: 'short'
		}).format(date);
	}

	onMount(() => {
		recentDecisions = listRecentDecisions(3);
	});
</script>

<svelte:head>
	<title>Welcome</title>
</svelte:head>

<main id="main" class="page">
	<h1 class="sr-only">Welcome</h1>

	<section class="card">
		<div class="eyebrow">Decidr</div>
		<h2 class="title">For teams who take decision conversations seriously.</h2>
		<p class="subtitle">
			Decidr helps product and design teams structure their discourse before it reaches the business table.
			It was built to turn scattered opinions into clear, shared reasoning so cross-functional decisions move
			with more trust and less noise.
		</p>

		<div class="ctaRow">
			<a class="btn-primary cta" href="/decisions/new">
				Start your first decision
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
				<h2>Recent decisions</h2>
				<a class="view-all" href="/decisions">View all</a>
			</div>
			<div class="recent-list">
				{#each recentDecisions as decision}
					<article class="recent-item">
						<div>
							<h3>{decision.title}</h3>
							<p>{decision.audienceLabel}</p>
						</div>
						<span>{formatDate(decision.updatedAt)}</span>
					</article>
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
		color: var(--orange);
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
		gap: 8px;
	}

	.recent-item {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 12px;
		padding: 10px 0;
		border-top: 1px solid var(--border);
	}

	.recent-item:first-child {
		border-top: 0;
		padding-top: 0;
	}

	.recent-item h3 {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 2px;
	}

	.recent-item p {
		font-size: 12px;
		color: var(--text-secondary);
	}

	.recent-item span {
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-muted);
		flex-shrink: 0;
	}
</style>

