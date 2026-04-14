<!-- Root layout: shared across all routes. Loads fonts, favicon, app.css, and skip link for a11y. -->
<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import TopNav from '$lib/components/TopNav.svelte';
	import BugReportModal from '$lib/components/BugReportModal.svelte';
	import '@fontsource/sora/300.css';
	import '@fontsource/sora/400.css';
	import '@fontsource/sora/500.css';
	import '@fontsource/sora/600.css';
	import '@fontsource/sora/700.css';
	import '@fontsource/ibm-plex-mono/400.css';
	import '@fontsource/ibm-plex-mono/500.css';
	import '../app.css';

	type LayoutUser = {
		id: string;
		name: string | null;
		email: string;
	};

	type LayoutData = {
		user: LayoutUser | null;
	};

	let { children, data } = $props<{ children: () => unknown; data: LayoutData }>();
	let isBugModalOpen = $state(false);
	let isSubmittingBug = $state(false);
	let bugSubmitError = $state('');

	const defaultEmail = $derived(data.user?.email ?? '');

	function openBugModal() {
		bugSubmitError = '';
		isBugModalOpen = true;
	}

	function closeBugModal() {
		if (isSubmittingBug) return;
		bugSubmitError = '';
		isBugModalOpen = false;
	}

	async function handleLogOut() {
		try {
			await fetch('/api/auth/signout', { method: 'POST' });
		} finally {
			window.location.href = '/login';
		}
	}

	async function submitBugReport(values: { description: string; whereFound: string; email: string }) {
		bugSubmitError = '';
		isSubmittingBug = true;

		try {
			const response = await fetch('/api/bugs', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(values)
			});

			if (!response.ok) {
				const payload = await response.json().catch(() => ({ message: 'Failed to submit bug report.' }));
				bugSubmitError = payload.message || 'Failed to submit bug report.';
				return;
			}

			isBugModalOpen = false;
		} catch {
			bugSubmitError = 'Failed to submit bug report.';
		} finally {
			isSubmittingBug = false;
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a href="#main" class="skip-link">Skip to main content</a>
<TopNav user={data.user} onReportBug={openBugModal} onLogOut={handleLogOut} />

{#if data.user}
	<BugReportModal
		open={isBugModalOpen}
		email={defaultEmail}
		submitting={isSubmittingBug}
		errorMessage={bugSubmitError}
		onClose={closeBugModal}
		onSubmit={submitBugReport}
	/>
{/if}

<div id="main">
	{@render children()}
</div>