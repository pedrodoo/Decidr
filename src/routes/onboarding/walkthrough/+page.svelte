<script lang="ts">
	import OnboardingWalkthrough from '$lib/components/OnboardingWalkthrough.svelte';
	import { strings } from '$lib/strings.js';

	const s = strings.onboarding;
</script>

<svelte:head>
	<title>{s.walkthroughPageTitle}</title>
</svelte:head>

<main id="main" class="page">
	<h1 class="sr-only">{s.walkthroughSrOnly}</h1>

	<nav class="top-nav" aria-label="Tour navigation">
		<a class="btn-ghost-inline" href="/onboarding">{s.backToEntry}</a>
	</nav>

	<OnboardingWalkthrough />
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

	.top-nav {
		margin-bottom: 24px;
	}
</style>
