<script lang="ts">
	import { strings } from '$lib/strings.js';

	const s = strings.onboarding;
</script>

<svelte:head>
	<title>{s.walkthroughPageTitle}</title>
</svelte:head>

<main id="main" class="page">
	<h1 class="sr-only">{s.walkthroughSrOnly}</h1>

	<section class="card">
		<span class="example-badge">{s.exampleBadge}</span>
		<h2 class="title">{s.walkthroughPlaceholderTitle}</h2>
		<p class="subtitle">{s.walkthroughPlaceholderBody}</p>
		<div class="cta-row">
			<a class="btn-secondary" href="/onboarding">{s.backToEntry}</a>
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
		font-size: var(--text-xl);
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		margin-bottom: 12px;
	}

	.subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
		margin-bottom: 24px;
	}

	.cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
</style>
