<script lang="ts">
	import { strings } from '$lib/strings.js';

	type Props = {
		fullWidth?: boolean;
	};

	let { fullWidth = false }: Props = $props();

	const s = strings.landing;

	let email = $state('');
	let submitting = $state(false);
	let errorMessage = $state('');
	let success = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		errorMessage = '';

		const trimmed = email.trim();
		if (!trimmed) {
			errorMessage = s.emailErrorInvalid;
			return;
		}

		submitting = true;

		try {
			const response = await fetch('/api/leads', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: trimmed })
			});

			const payload = await response.json().catch(() => ({}));

			if (!response.ok) {
				errorMessage =
					typeof payload.message === 'string' ? payload.message : s.emailErrorGeneric;
				return;
			}

			success = true;
			window.location.href = '/welcome';
		} catch {
			errorMessage = s.emailErrorGeneric;
		} finally {
			submitting = false;
		}
	}
</script>

<form
	class="email-capture"
	class:email-capture--full={fullWidth}
	onsubmit={handleSubmit}
	aria-busy={submitting}
>
	<div class="email-capture-pill">
		<input
			id="landing-email-{fullWidth ? 'hero' : 'cta'}"
			class="email-capture-input"
			type="email"
			name="email"
			aria-label={s.emailLabel}
			autocomplete="email"
			placeholder={s.emailPlaceholder}
			bind:value={email}
			required
			disabled={submitting || success}
		/>
		<button class="email-capture-btn" type="submit" disabled={submitting || success}>
			{submitting ? s.submittingEmail : s.submitEmail}
			{#if !submitting}
				<svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
					<path
						d="M5 3l4 4-4 4"
						stroke="white"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			{/if}
		</button>
	</div>
	{#if errorMessage}
		<p class="email-capture-error" role="alert">{errorMessage}</p>
	{/if}
	{#if success}
		<p class="email-capture-success" role="status">{s.emailSuccess}</p>
	{:else}
		<p class="email-capture-privacy">{s.privacyNote}</p>
	{/if}
</form>

<style>
	.email-capture {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		width: 100%;
	}

	.email-capture--full {
		max-width: 100%;
	}

	.email-capture-pill {
		display: flex;
		align-items: center;
		width: 100%;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 11px;
		padding: 5px;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
	}

	.email-capture-pill:focus-within {
		border-color: var(--border-focus);
		box-shadow: 0 0 0 2px var(--focus-ring);
	}

	.email-capture-input {
		flex: 1;
		min-width: 0;
		padding: 10px 12px;
		font-size: 14px;
		border: none;
		background: transparent;
		color: var(--text-primary);
		outline: none;
	}

	.email-capture-input::placeholder {
		color: var(--text-muted);
	}

	.email-capture-error {
		font-size: 13px;
		color: var(--red, #e55);
		margin: 0;
	}

	.email-capture-success {
		font-size: 13px;
		color: var(--accent-text-green);
		margin: 0;
	}

	.email-capture-privacy {
		font-size: 12px;
		color: var(--text-muted);
		margin: 0;
		line-height: 1.5;
	}

	.email-capture-btn {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 18px;
		background: var(--orange);
		color: white;
		font-family: var(--font-sans);
		font-size: 14px;
		font-weight: 600;
		letter-spacing: -0.01em;
		border-radius: 7px;
		border: none;
		white-space: nowrap;
		cursor: pointer;
		transition: background 0.15s;
	}

	.email-capture-btn:hover:not(:disabled) {
		background: var(--orange-hover);
	}

	.email-capture-btn:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.email-capture-btn:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}
</style>
