<script lang="ts">
	import BugReportModal from '$lib/components/BugReportModal.svelte';
	import TopNav from '$lib/components/TopNav.svelte';
	import { highlightBugReportButton } from '$lib/stores/bug-hint';
	import { strings } from '$lib/strings.js';
	import type { TrialUsage } from '$lib/server/trial-limits';
	import type { Theme } from '$lib/theme';
	import type { SessionLayoutUser } from '$lib/types/session';

	type BugReportValues = {
		description: string;
		whereFound: string;
		email: string;
	};

	type TrialLeadLayout = {
		email: string;
	};

	type Props = {
		user: SessionLayoutUser;
		trialLead?: TrialLeadLayout | null;
		trialUsage?: TrialUsage | null;
		onLogOut: () => void | Promise<void>;
		theme: Theme;
		onThemeToggle: () => void;
		highlightBugButton?: boolean;
	};

	let {
		user,
		trialLead = null,
		trialUsage = null,
		onLogOut,
		theme,
		onThemeToggle,
		highlightBugButton: highlightBugButtonProp = false
	}: Props = $props();
	let highlightFromStore = $state(false);

	$effect(() => {
		const unsub = highlightBugReportButton.subscribe((v) => {
			highlightFromStore = v;
		});
		return unsub;
	});

	const highlightBugButton = $derived(highlightBugButtonProp || highlightFromStore);
	let isBugModalOpen = $state(false);
	let isSubmittingBug = $state(false);
	let bugSubmitError = $state('');
	const s = strings.bugReport;

	const canReportBug = $derived(!!user || !!trialLead);
	const defaultEmail = $derived(user?.email ?? trialLead?.email ?? '');

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
	{user}
	trialEmail={trialLead?.email ?? null}
	{trialUsage}
	onReportBug={openBugModal}
	{onLogOut}
	{theme}
	{onThemeToggle}
	{highlightBugButton}
/>

{#if canReportBug}
	<BugReportModal
		open={isBugModalOpen}
		email={defaultEmail}
		submitting={isSubmittingBug}
		errorMessage={bugSubmitError}
		onClose={closeBugModal}
		onSubmit={submitBugReport}
	/>
{/if}
