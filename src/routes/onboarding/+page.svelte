<script lang="ts">
	import { strings } from '$lib/strings.js';

	const s = strings.onboarding;
</script>

<svelte:head>
	<title>{s.pageTitle}</title>
</svelte:head>

<main id="main" class="page">
	<h1 class="sr-only">{s.pageSrOnlyTitle}</h1>

	<section class="card">
		<div class="eyebrow">{s.eyebrow}</div>
		<span class="example-badge">{s.exampleBadge}</span>
		<h2 class="title">{s.entryTitle}</h2>
		<p class="subtitle">{s.entrySubtitle}</p>
		<p class="body">{s.entryBody}</p>

		<ol class="steps-list">
			{#each s.entrySteps as step, i (i)}
				<li>{step}</li>
			{/each}
		</ol>

		<div class="cta-row">
			<a class="btn-primary cta" href="/onboarding/walkthrough">
				{s.beginWalkthrough}
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
			<a class="btn-secondary" href="/welcome">{s.backToWelcome}</a>
		</div>
	</section>
</main>

<style>
	.page {
		max-width: 640px;
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
	}

	.eyebrow {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent-text-orange);
		margin-bottom: 12px;
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
		margin-bottom: 12px;
	}

	.body {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
		margin-bottom: 20px;
	}

	.steps-list {
		margin: 0 0 28px;
		padding-left: 20px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.steps-list li {
		font-size: 14px;
		color: var(--text-primary);
		line-height: 1.5;
	}

	.cta-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px;
	}

	.cta {
		text-decoration: none;
	}
</style>
