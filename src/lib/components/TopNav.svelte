<script lang="ts">
	import TrialModeBadge from '$lib/components/TrialModeBadge.svelte';
	import type { TrialUsage } from '$lib/server/trial-limits';
	import { getTrialUsageDetail } from '$lib/utils/trialUsageLabel';
	import type { Theme } from '$lib/theme';
	import type { SessionLayoutUser } from '$lib/types/session';
	import { getUserDisplayName, getUserInitial } from '$lib/utils/userDisplay';
	import { strings } from '$lib/strings.js';

	type Props = {
		user: SessionLayoutUser;
		trialEmail?: string | null;
		trialUsage?: TrialUsage | null;
		onReportBug: () => void;
		onLogOut: () => void | Promise<void>;
		theme: Theme;
		onThemeToggle: () => void;
		highlightBugButton?: boolean;
	};

	let {
		user,
		trialEmail = null,
		trialUsage = null,
		onReportBug,
		onLogOut,
		theme,
		onThemeToggle,
		highlightBugButton = false
	}: Props = $props();
	let isAccountModalOpen = $state(false);
	const s = strings.topNav;

	const sessionEmail = $derived(user?.email ?? trialEmail ?? null);
	const hasSession = $derived(!!user || !!trialEmail);
	const displayName = $derived(getUserDisplayName(user?.name, sessionEmail));
	const avatarInitial = $derived(getUserInitial(user?.name, sessionEmail));
	const trialAccessLine = $derived(
		trialUsage
			? s.trialAccessSummary.replace('{detail}', getTrialUsageDetail(trialUsage))
			: s.trialAccess
	);

	function openAccountModal() {
		isAccountModalOpen = true;
	}

	function closeAccountModal() {
		isAccountModalOpen = false;
	}

	function handleLogOut() {
		closeAccountModal();
		onLogOut();
	}

	function handleWindowKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeAccountModal();
		}
	}

</script>

<svelte:window onkeydown={handleWindowKeyDown} />

<header class="nav" class:nav--with-trial={!!trialUsage}>
	<a class="logo" href="/" aria-label={s.homeAria}>
		<div class="logo-mark" aria-hidden="true">
			<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
				<path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8h4v2h-2v2H8z"></path>
			</svg>
		</div>
		<span>{strings.common.appName}</span>
	</a>

	{#if trialUsage}
		<div class="nav-center">
			<TrialModeBadge {trialUsage} />
		</div>
	{/if}

	<div class="nav-actions">
		<button
			class="nav-btn"
			type="button"
			aria-label={theme === 'dark' ? s.themeSwitchToLight : s.themeSwitchToDark}
			title={theme === 'dark' ? s.lightModeTitle : s.darkModeTitle}
			onclick={onThemeToggle}
		>
			{#if theme === 'dark'}
				<svg class="nav-btn__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"></circle>
					<path d="M12 2.8V5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
					<path d="M12 18.8V21.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
					<path d="M5.5 5.5L7.2 7.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
					<path d="M16.8 16.8L18.5 18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
					<path d="M2.8 12H5.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
					<path d="M18.8 12H21.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
					<path d="M5.5 18.5L7.2 16.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
					<path d="M16.8 7.2L18.5 5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
				</svg>
			{:else}
				<svg class="nav-btn__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M20.1 14.3A8.3 8.3 0 1 1 9.7 3.9a7 7 0 1 0 10.4 10.4Z"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
						stroke-linejoin="round"
					></path>
				</svg>
			{/if}
		</button>

		{#if user || trialEmail}
			<button
				class="nav-btn"
				class:nav-btn--highlight={highlightBugButton}
				type="button"
				data-bug-report-btn
				aria-label={s.reportBug}
				title={s.reportBug}
				onclick={onReportBug}
			>
				<svg class="nav-btn__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M12 3L21 19H3L12 3Z"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linejoin="round"
					></path>
					<path d="M12 9V13.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
					<circle cx="12" cy="16.8" r="1.1" fill="currentColor"></circle>
				</svg>
			</button>
		{/if}

		{#if hasSession}
			<button class="nav-user-btn" type="button" onclick={openAccountModal} aria-label={s.account}>
				<div class="nav-avatar" aria-hidden="true">{avatarInitial}</div>
				<span class="nav-username">{displayName}</span>
				<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
					<path
						d="M3 4.5l3 3 3-3"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					></path>
				</svg>
			</button>
		{:else}
			<a class="btn-secondary nav-login-link" href="/login">{s.login}</a>
		{/if}
	</div>
</header>

{#if hasSession && isAccountModalOpen}
	<div class="modal-backdrop" role="dialog" aria-modal="true" aria-label={s.account}>
		<button class="modal-backdrop-close" type="button" aria-label={s.closeAccountDialog} onclick={closeAccountModal}
		></button>
		<div class="modal">
			<div class="modal-header">
				<div class="modal-title">{s.account}</div>
				<button class="modal-close" type="button" aria-label={s.close} onclick={closeAccountModal}>✕</button>
			</div>

			<div class="modal-body">
				<div class="user-info">
					<div class="user-avatar-large">{avatarInitial}</div>
					<div>
						{#if user}
							<div class="user-name">{user.name ?? user.email}</div>
							{#if user.name}
								<div class="user-email">{user.email}</div>
							{/if}
						{:else if trialEmail}
							<div class="user-name">{trialEmail}</div>
							<div class="user-email" role="status">{trialAccessLine}</div>
						{/if}
					</div>
				</div>

				<button class="btn-logout" type="button" onclick={handleLogOut}>{s.signOut}</button>
			</div>
		</div>
	</div>
{/if}
