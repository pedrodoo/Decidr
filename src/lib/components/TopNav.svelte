<script lang="ts">
	import type { Theme } from '$lib/theme';
	import type { SessionLayoutUser } from '$lib/types/session';
	import { getUserDisplayName, getUserInitial } from '$lib/utils/userDisplay';

	type Props = {
		user: SessionLayoutUser;
		onReportBug: () => void;
		onLogOut: () => void | Promise<void>;
		theme: Theme;
		onThemeToggle: () => void;
	};

	let { user, onReportBug, onLogOut, theme, onThemeToggle }: Props = $props();
	let isAccountModalOpen = $state(false);

	const displayName = $derived(getUserDisplayName(user?.name, user?.email));
	const avatarInitial = $derived(getUserInitial(user?.name, user?.email));

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

<header class="nav">
	<a class="logo" href="/" aria-label="Decidr home">
		<div class="logo-mark" aria-hidden="true">
			<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
				<path d="M2 2h4v4H2zM8 2h4v4H8zM2 8h4v4H2zM8 8h4v2h-2v2H8z"></path>
			</svg>
		</div>
		<span>Decidr</span>
	</a>

	<div class="nav-actions">
		<button
			class="nav-btn"
			type="button"
			aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
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

		{#if user}
			<button class="nav-btn" type="button" aria-label="Report a bug" title="Report a bug" onclick={onReportBug}>
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

			<button class="nav-user-btn" type="button" onclick={openAccountModal} aria-label="Account">
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
			<a class="btn-secondary nav-login-link" href="/login">Log in</a>
		{/if}
	</div>
</header>

{#if user && isAccountModalOpen}
	<div class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Account">
		<button class="modal-backdrop-close" type="button" aria-label="Close account dialog" onclick={closeAccountModal}
		></button>
		<div class="modal">
			<div class="modal-header">
				<div class="modal-title">Account</div>
				<button class="modal-close" type="button" aria-label="Close" onclick={closeAccountModal}>✕</button>
			</div>

			<div class="modal-body">
				<div class="user-info">
					<div class="user-avatar-large">{avatarInitial}</div>
					<div>
						<div class="user-name">{user.name ?? user.email}</div>
						{#if user.name}
							<div class="user-email">{user.email}</div>
						{/if}
					</div>
				</div>

				<button class="btn-logout" type="button" onclick={handleLogOut}>Sign out</button>
			</div>
		</div>
	</div>
{/if}
