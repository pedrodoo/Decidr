<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import { strings } from '$lib/strings.js';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const s = strings.join;
</script>

<svelte:head>
	<title>{s.pageTitle}</title>
</svelte:head>

<main class="page">
	<section class="card">
		<div class="eyebrow">{s.eyebrow}</div>
		<h1 class="title">{s.title}</h1>
		<p class="subtitle">{s.subtitle}</p>

		<form method="post" class="form" use:enhance>
			<div class="fields">
				<label class="field" for="name">
					<span class="label">{s.labels.name}</span>
					<input id="name" type="text" name="name" autocomplete="name" required />
				</label>

				<label class="field" for="email">
					<span class="label">{s.labels.email}</span>
					<input
						id="email"
						type="email"
						name="email"
						autocomplete="email"
						value={data.email ?? ''}
						readonly={!!data.email}
						required
					/>
				</label>

				<label class="field" for="password">
					<span class="label">{s.labels.password}</span>
					<input
						id="password"
						type="password"
						name="password"
						autocomplete="new-password"
						required
					/>
				</label>
			</div>

			<button class="btn-primary" type="submit">{s.createAccount}</button>

			{#if form?.message}
				<p class="error" role="alert">{form.message}</p>
			{/if}
		</form>
	</section>
</main>

<style>
	.page {
		max-width: 480px;
		margin: 0 auto;
		padding: 48px 24px 100px;
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
		color: var(--accent-text-orange);
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
		color: var(--accent-text-orange);
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
		transition:
			border-color var(--dt-duration-normal),
			background var(--dt-duration-normal);
		line-height: var(--dt-line-height-normal);
	}

	.field input[readonly] {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.field input:focus {
		border-color: var(--border-focus);
		background: var(--surface-2);
	}

	.field input:focus-visible {
		outline: 2px solid var(--focus-ring);
		outline-offset: 2px;
	}

	.error {
		font-size: 13px;
		color: var(--semantic-danger);
		margin-top: 6px;
	}
</style>
