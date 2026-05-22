<!-- Root layout: shared across all routes. Loads fonts, favicon, app.css, and skip link for a11y. -->
<script lang="ts">
	import { dev } from '$app/environment';
	import favicon from '$lib/assets/favicon.svg';
	import BugReportSection from '$lib/components/BugReportSection.svelte';
	import TrialStatusBar from '$lib/components/TrialStatusBar.svelte';
	import { applyTheme, getPreferredTheme, toggleTheme, type Theme } from '$lib/theme';
	import type { LayoutData } from './$types';
	import { onMount } from 'svelte';
	import '@fontsource/sora/300.css';
	import '@fontsource/sora/400.css';
	import '@fontsource/sora/500.css';
	import '@fontsource/sora/600.css';
	import '@fontsource/sora/700.css';
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource/ibm-plex-mono/500.css';
	import '../app.css';
	import { strings } from '$lib/strings.js';
	import { clientRateLimit } from '$lib/stores/rate-limit';

	let { children, data } = $props<{ children: () => unknown; data: LayoutData }>();
	let theme = $state<Theme>('dark');
	const s = strings.layout;

	async function handleLogOut() {
		try {
			if (data.trialLead) {
				await fetch('/api/trial/sign-out', {
					method: 'POST',
					credentials: 'include'
				});
			} else if (data.user) {
				await fetch('/api/auth/sign-out', {
					method: 'POST',
					credentials: 'include',
					headers: {
						'Content-Type': 'application/json'
					},
					body: '{}'
				});
			}
		} catch (error) {
			if (dev) {
				console.error('Sign-out request failed; continuing to login redirect.', error);
			}
		} finally {
			window.location.href = '/login';
		}
	}

	onMount(() => {
		theme = getPreferredTheme();
		applyTheme(theme);
		clientRateLimit.set(data.rateLimit);
	});

	function handleThemeToggle() {
		theme = toggleTheme(theme);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<script>
		(() => {
			try {
				const saved = localStorage.getItem('theme');
				const theme =
					saved === 'dark' || saved === 'light'
						? saved
						: window.matchMedia('(prefers-color-scheme: dark)').matches
							? 'dark'
							: 'light';
				document.documentElement.dataset.theme = theme;
			} catch {
				document.documentElement.dataset.theme = 'dark';
			}
		})();
	</script>
</svelte:head>

<a href="#main" class="skip-link">{s.skipToMain}</a>
<BugReportSection
	user={data.user}
	trialLead={data.trialLead}
	trialUsage={data.trialUsage}
	onLogOut={handleLogOut}
	theme={theme}
	onThemeToggle={handleThemeToggle}
/>

<TrialStatusBar
	trialUsage={data.trialUsage}
	rateLimit={data.rateLimit}
	showRateLimit={!!data.user || !!data.trialUsage}
/>

<div id="main">
	{@render children()}
</div>