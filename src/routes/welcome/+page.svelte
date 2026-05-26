<script lang="ts">
	import { onMount } from 'svelte';
	import { strings } from '$lib/strings.js';
	import {
		listRecentDecisions,
		resolveDecisionLink,
		STATUS_LABELS,
		type DecisionRecord
	} from '$lib/decisions/storage';
	import type { PageData } from './$types';
	import InputDepthChooser from '$lib/components/InputDepthChooser.svelte';

	let { data }: { data: PageData } = $props();

	let recentDecisions = $state<DecisionRecord[]>([]);
	const s = strings.welcome;
	const ob = strings.onboarding;

	const isTrialFirst = $derived(data.isTrial && data.trialState === 'first');
	const isTrialReturning = $derived(data.isTrial && data.trialState === 'returning');

	function formatDate(isoDate: string): string {
		const date = new Date(isoDate);
		return new Intl.DateTimeFormat('pt-PT', {
			day: '2-digit',
			month: 'short'
		}).format(date);
	}

	onMount(() => {
		if (!data.isTrial) {
			recentDecisions = listRecentDecisions(3);
		}
	});
</script>

<svelte:head>
	<title>{s.pageTitle}</title>
</svelte:head>

<main id="main" class="page">
	<h1 class="sr-only">{s.pageSrOnlyTitle}</h1>

	<section class="card">
		<div class="eyebrow">{s.eyebrow}</div>

		{#if isTrialFirst}
			<span class="example-badge">{ob.exampleBadge}</span>
			<h2 class="title">{ob.entryTitle}</h2>
			<p class="subtitle">{ob.entrySubtitle}</p>
			<p class="body">{ob.entryBody}</p>

			<ol class="steps-list">
				{#each ob.entrySteps as step, i (i)}
					<li>{step}</li>
				{/each}
			</ol>

			<p class="bug-hint">{s.tourBugHint}</p>

			<div class="cta-row">
				<a class="btn-primary cta" href="/onboarding/walkthrough">
					{ob.beginWalkthrough}
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

			<p class="skip-block">
				<a class="skip-link" href="/welcome?skip=1">{s.skipTour}</a>
				<span class="skip-hint">{s.skipTourHint}</span>
			</p>
		{:else if isTrialReturning}
			<h2 class="title">{s.returningTitle}</h2>
			<p class="subtitle">{s.returningSubtitle}</p>
			<p class="trial-limit-note">{s.trialLimitNote}</p>

			{#if data.skippedTour}
				<p class="skipped-note" role="status">{s.skipTourHint}</p>
			{/if}

			<div class="cta-row cta-row--stacked">
				<InputDepthChooser />
				<a class="btn-secondary" href="/onboarding/walkthrough">{s.replayTour}</a>
			</div>
		{:else}
			<h2 class="title">{s.title}</h2>
			<p class="subtitle">{s.subtitle}</p>

			<InputDepthChooser compact />
		{/if}
	</section>

	{#if !data.isTrial && recentDecisions.length > 0}
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

	.trial-limit-note {
		font-size: var(--text-sm);
		color: var(--text-muted);
		line-height: 1.6;
		margin-bottom: 20px;
	}

	.subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
		margin-bottom: 12px;
		max-width: 620px;
	}

	.body {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
		margin-bottom: 16px;
		max-width: 620px;
	}

	.example-badge {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 10px;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 4px 10px;
		margin-bottom: 16px;
	}

	.steps-list {
		margin: 0 0 20px;
		padding-left: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		max-width: 620px;
	}

	.steps-list li {
		font-size: 14px;
		color: var(--text-primary);
		line-height: 1.5;
	}

	.bug-hint {
		font-size: 13px;
		color: var(--text-muted);
		line-height: 1.55;
		margin: 0 0 20px;
		max-width: 620px;
	}

	.skipped-note {
		font-size: 13px;
		color: var(--text-muted);
		margin: 0 0 16px;
		padding: 10px 12px;
		border-left: 2px solid var(--orange);
		background: var(--bg);
	}

	.cta-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	.cta-row--stacked {
		flex-direction: column;
		align-items: flex-start;
	}

	.cta {
		text-decoration: none;
	}

	.skip-block {
		margin: 20px 0 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.skip-link {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-secondary);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.skip-link:hover {
		color: var(--text-primary);
	}

	.skip-hint {
		font-size: 12px;
		color: var(--text-muted);
		line-height: 1.5;
		max-width: 480px;
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
