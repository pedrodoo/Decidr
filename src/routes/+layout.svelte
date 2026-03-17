<!-- Root layout: shared across all routes. Loads fonts, favicon, app.css, and skip link for a11y. -->
<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '@fontsource/sora/300.css';
	import '@fontsource/sora/400.css';
	import '@fontsource/sora/500.css';
	import '@fontsource/sora/600.css';
	import '@fontsource/sora/700.css';
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource/ibm-plex-mono/500.css';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a href="#main" class="skip-link">Skip to main content</a>
{@render children()}