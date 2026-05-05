<script lang="ts">
	import BugReportModal from '$lib/components/BugReportModal.svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import { strings } from '$lib/strings.js';
	import type { Theme } from '$lib/theme';
	import type { SessionLayoutUser } from '$lib/types/session';

	type BugReportValues = {
		description: string;
		whereFound: string;
		email: string;
	};

	type Props = {
		user: SessionLayoutUser;
		onLogOut: () => void | Promise<void>;
		theme: Theme;
		onThemeToggle: () => void;
	};

	let { user, onLogOut, theme, onThemeToggle }: Props = $props();
	let isBugModalOpen = $state(false);
	let isSubmittingBug = $state(false);
	let bugSubmitError = $state('');
	const s = strings.bugReport;

	const defaultEmail = $derived(user?.email ?? '');

	function openBugModal() {
		bugSubmitError = '';
		isBugModalOpen = true;
	}

	function closeBugModal() {
		if (isSubmittingBug) return;
		bugSubmitError = '';
		isBugModalOpen = false;
	}

	async function submitBugReport(values: BugReportValues) {
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
				const payload = await response.json().catch(() => ({ message: s.submitFailed }));
				bugSubmitError = payload.message || s.submitFailed;
				return;
			}

			isBugModalOpen = false;
		} catch {
			bugSubmitError = s.submitFailed;
		} finally {
			isSubmittingBug = false;
		}
	}
</script>

<TopNav
	user={user}
	onReportBug={openBugModal}
	onLogOut={onLogOut}
	theme={theme}
	onThemeToggle={onThemeToggle}
/>

{#if user}
	<BugReportModal
		open={isBugModalOpen}
		email={defaultEmail}
		submitting={isSubmittingBug}
		errorMessage={bugSubmitError}
		onClose={closeBugModal}
		onSubmit={submitBugReport}
	/>
{/if}
