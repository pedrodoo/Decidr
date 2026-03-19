<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const actionSignIn = '?/signInEmail';
	const actionSignUp = '?/signUpEmail';
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<main id="main" class="page">
	<h1 class="sr-only">Login</h1>

	<section class="card">
		<div class="eyebrow">Decidr</div>
		<h2 class="title">Log in to write your next decision</h2>
		<p class="subtitle">A quick setup so you can start your first decision flow.</p>

		<form method="post" class="form" action={actionSignIn} use:enhance>
			<div class="fields">
				<label class="field" for="email">
					<span class="label">Email</span>
					<input id="email" type="email" name="email" autocomplete="email" required />
				</label>

				<label class="field" for="password">
					<span class="label">Password</span>
					<input
						id="password"
						type="password"
						name="password"
						autocomplete="current-password"
						required
					/>
				</label>

				<label class="field" for="name">
					<span class="label">Name</span>
					<input id="name" type="text" name="name" autocomplete="name" placeholder="For registration" />
				</label>
			</div>

			<div class="actions">
				<button class="btn-primary" type="submit" formaction={actionSignIn}>
					Log in
				</button>

				<button class="btn-secondary" type="submit" formaction={actionSignUp}>
					Register
				</button>
			</div>

			{#if form?.message}
				<p class="error" role="alert">{form.message}</p>
			{/if}
		</form>
	</section>
</main>

<style>
	.page {
		max-width: 760px;
		margin: 0 auto;
		padding: 48px 24px 100px;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.card {
		border: 1px solid var(--border);
		background: var(--surface);
		border-radius: 10px;
		padding: 24px;
	}

	.eyebrow {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--orange);
		margin-bottom: 12px;
	}

	.title {
		font-size: var(--text-xxl);
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		margin-bottom: 8px;
	}

	.subtitle {
		font-size: var(--text-sm);
		color: var(--text-secondary);
		line-height: 1.65;
		margin-bottom: 24px;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.fields {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.label {
		font-family: var(--font-mono);
		font-size: var(--text-xs);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--orange);
	}

	.field input {
		width: 100%;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--dt-radius-md);
		padding: var(--dt-space-3) 14px;
		font-family: var(--font-sans);
		font-size: var(--text-base);
		color: var(--text-primary);
		transition: border-color var(--dt-duration-normal), background var(--dt-duration-normal);
		line-height: var(--dt-line-height-normal);
	}

	.field input::placeholder {
		color: var(--text-muted);
		font-size: var(--text-sm);
	}

	.field input:focus {
		border-color: var(--border-focus);
		background: var(--surface-2);
	}

	.field input:focus-visible {
		outline: 2px solid var(--orange);
		outline-offset: 2px;
	}

	.actions {
		display: flex;
		gap: 12px;
		align-items: center;
	}

	.error {
		font-size: 13px;
		color: #f87171;
		margin-top: 6px;
	}
</style>

