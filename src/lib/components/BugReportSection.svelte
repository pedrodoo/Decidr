<script lang="ts">
	import BugReportModal from '$lib/components/BugReportModal.svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import type { SessionLayoutUser } from '$lib/types/session';

	type BugReportValues = {
		description: string;
		whereFound: string;
		email: string;
	};

	type Props = {
		user: SessionLayoutUser;
		onLogOut: () => void | Promise<void>;
	};

	let { user, onLogOut }: Props = $props();
	let isBugModalOpen = $state(false);
	let isSubmittingBug = $state(false);
	let bugSubmitError = $state('');

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

<TopNav user={user} onReportBug={openBugModal} onLogOut={onLogOut} />

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
