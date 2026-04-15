<!-- Root layout: shared across all routes. Loads fonts, favicon, app.css, and skip link for a11y. -->
<script lang="ts">
	import { dev } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import BugReportSection from '$lib/components/BugReportSection.svelte';
	import type { LayoutData } from './$types';
	import '@fontsource/sora/300.css';
	import '@fontsource/sora/400.css';
	import '@fontsource/sora/500.css';
	import '@fontsource/sora/600.css';
	import '@fontsource/sora/700.css';
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource/ibm-plex-mono/500.css';
	import '../app.css';

	let { children, data } = $props<{ children: () => unknown; data: LayoutData }>();

	async function handleLogOut() {
		try {
			await fetch('/api/auth/sign-out', {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json'
				},
				body: '{}'
			});
		} catch (error) {
			if (dev) {
				console.error('Sign-out request failed; continuing to login redirect.', error);
			}
		} finally {
			window.location.href = '/login';
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a href="#main" class="skip-link">Skip to main content</a>
<BugReportSection user={data.user} onLogOut={handleLogOut} />

<div id="main">
	{@render children()}
</div>