<script lang="ts">
	type NavUser = {
		name?: string | null;
		email: string;
	};

	type Props = {
		user: NavUser | null;
		onReportBug: () => void;
		onLogOut: () => void;
	};

	let { user, onReportBug, onLogOut }: Props = $props();
	let isAccountModalOpen = $state(false);

	const displayName = $derived(getDisplayName(user?.name ?? undefined, user?.email ?? undefined));
	const avatarInitial = $derived(getInitial(user?.name ?? undefined, user?.email ?? undefined));

	function openAccountModal() {
		isAccountModalOpen = true;
	}

	function closeAccountModal() {
		isAccountModalOpen = false;
	}

	function handleLogOut() {
		// #region agent log
		fetch('http://127.0.0.1:7361/ingest/27341e39-35f0-4dcf-9555-2b08ee4dceb2', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '9dda78' },
			body: JSON.stringify({
				sessionId: '9dda78',
				runId: 'pre-fix',
				hypothesisId: 'H1',
				location: 'src/lib/components/TopNav.svelte:handleLogOut',
				message: 'Sign out button handler invoked',
				data: { isAccountModalOpen },
				timestamp: Date.now()
			})
		}).catch(() => {});
		// #endregion
		closeAccountModal();
		onLogOut();
	}

	function handleWindowKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeAccountModal();
		}
	}

	function getInitial(name?: string, email?: string): string {
		if (name?.trim()) return name.trim()[0].toUpperCase();
		if (email?.trim()) return email.trim()[0].toUpperCase();
		return '?';
	}

	function getDisplayName(name?: string, email?: string): string {
		if (name?.trim()) return name.trim().split(' ')[0];
		if (email?.trim()) return email.trim().split('@')[0];
		return 'Account';
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
